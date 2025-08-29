

import { Tender, Client, User, FunnelData, SalesLeaderboardData, BidWorkflowStage, TenderStatus } from '../types';

export const calculateTenderFunnel = (tenders: Tender[]): FunnelData[] => {
    const stageOrder = Object.values(BidWorkflowStage);
    const funnel: { [key in BidWorkflowStage]?: number } = {};

    tenders.forEach(tender => {
        const currentStageIndex = stageOrder.indexOf(tender.workflowStage);
        if (currentStageIndex === -1) return; // Ignore if stage not in enum

        for (let i = 0; i <= currentStageIndex; i++) {
            const stage = stageOrder[i];
            funnel[stage] = (funnel[stage] || 0) + 1;
        }
    });

    return stageOrder.map(stage => ({
        name: stage,
        count: funnel[stage] || 0,
    }));
};

export const calculateWinLossBySource = (tenders: Tender[]): { name: string; won: number; lost: number }[] => {
    const results: { [key: string]: { won: number, lost: number } } = {};

    tenders.forEach(tender => {
        if ((tender.status === TenderStatus.Won || tender.status === TenderStatus.Lost) && tender.source) {
            const key = tender.source;
            if (!results[key]) {
                results[key] = { won: 0, lost: 0 };
            }
            if (tender.status === TenderStatus.Won) {
                results[key].won++;
            } else {
                results[key].lost++;
            }
        }
    });

    return Object.entries(results).map(([name, data]) => ({
        name,
        ...data,
    })).sort((a,b) => (b.won + b.lost) - (a.won + a.lost));
}

export const calculateSalesLeaderboard = (tenders: Tender[], users: User[]): SalesLeaderboardData[] => {
    const salesUsers = users.filter(u => u.role === 'Sales');
    const leaderboardData: { [userId: string]: { valueWon: number, tendersWon: number, tendersLost: number } } = {};

    salesUsers.forEach(u => {
        leaderboardData[u.id] = { valueWon: 0, tendersWon: 0, tendersLost: 0 };
    });

    tenders.forEach(tender => {
        if (tender.assignedTo && (tender.status === TenderStatus.Won || tender.status === TenderStatus.Lost)) {
            tender.assignedTo.forEach(userId => {
                if (leaderboardData[userId]) {
                    if (tender.status === TenderStatus.Won) {
                        leaderboardData[userId].tendersWon++;
                        leaderboardData[userId].valueWon += tender.value;
                    } else {
                        leaderboardData[userId].tendersLost++;
                    }
                }
            });
        }
    });
    
    return salesUsers.map(user => {
        const data = leaderboardData[user.id];
        const totalBids = data.tendersWon + data.tendersLost;
        return {
            userId: user.id,
            userName: user.name,
            avatarUrl: user.avatarUrl,
            valueWon: data.valueWon,
            tendersWon: data.tendersWon,
            winRate: totalBids > 0 ? (data.tendersWon / totalBids) * 100 : 0,
        };
    }).sort((a,b) => b.valueWon - a.valueWon);
};


export const calculateClientHealth = (client: Client, clientTenders: Tender[]): 'Excellent' | 'Good' | 'At-Risk' => {
    const wonTenders = clientTenders.filter(t => t.status === TenderStatus.Won);
    const lostTenders = clientTenders.filter(t => t.status === TenderStatus.Lost);
    const totalCompleted = wonTenders.length + lostTenders.length;

    if (totalCompleted === 0) return 'Good'; // New client

    const winRate = (wonTenders.length / totalCompleted) * 100;

    if (winRate >= 75) return 'Excellent';
    if (winRate >= 40) return 'Good';
    return 'At-Risk';
};

export const getWinLossValueByMonth = (tenders: Tender[], months: number = 6) => {
    const results: { [month: string]: { wonValue: number, lostValue: number } } = {};
    const today = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthKey = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
        results[monthKey] = { wonValue: 0, lostValue: 0 };
    }

    tenders.forEach(tender => {
        if (tender.status === TenderStatus.Won || tender.status === TenderStatus.Lost) {
            // Find the timestamp of the status change to Won/Lost
            const decisionLog = (tender.history || []).slice().reverse().find(h => h.action.includes('Changed Tender Status') && (h.details?.includes(TenderStatus.Won) || h.details?.includes(TenderStatus.Lost)));
            const decisionDate = new Date(decisionLog?.timestamp || tender.deadline);
            const monthKey = decisionDate.toLocaleString('en-US', { month: 'short', year: '2-digit' });

            if (results[monthKey]) {
                if (tender.status === TenderStatus.Won) {
                    results[monthKey].wonValue += tender.value;
                } else {
                    results[monthKey].lostValue += tender.value;
                }
            }
        }
    });

    return Object.entries(results).map(([name, values]) => ({ name, ...values }));
};

export const getWinRateByCategory = (tenders: Tender[]) => {
    const categories: { [category: string]: { won: number, total: number } } = {};

    tenders.forEach(tender => {
        if (tender.status === TenderStatus.Won || tender.status === TenderStatus.Lost) {
            const category = tender.itemCategory || 'Uncategorized';
            if (!categories[category]) {
                categories[category] = { won: 0, total: 0 };
            }
            if (tender.status === TenderStatus.Won) {
                categories[category].won++;
            }
            categories[category].total++;
        }
    });

    return Object.entries(categories).map(([name, data]) => {
        return {
            name,
            'Win Rate': data.total > 0 ? (data.won / data.total) * 100 : 0,
        };
    }).sort((a,b) => b['Win Rate'] - a['Win Rate']);
};

export const flattenTendersForExport = (tenders: Tender[], users: User[], clients: Client[]): any[] => {
    const userMap = new Map(users.map(u => [u.id, u.name]));
    const clientMap = new Map(clients.map(c => [c.id, c.name]));

    return tenders.map(tender => ({
        'Tender ID': tender.id,
        'Tender Number': tender.tenderNumber || 'N/A',
        'Title': tender.title,
        'Client': clientMap.get(tender.clientId) || tender.clientName,
        'Status': tender.status,
        'Workflow Stage': tender.workflowStage,
        'Deadline': new Date(tender.deadline).toLocaleDateString('en-CA'), // YYYY-MM-DD for better sorting in Excel
        'Value (INR)': tender.value,
        'Cost (INR)': tender.cost || 0,
        'Profit (INR)': (tender.status === TenderStatus.Won) ? (tender.value - (tender.cost || 0)) : 0,
        'Assigned To': (tender.assignedTo || []).map(id => userMap.get(id)).filter(Boolean).join(', '),
        'Source': tender.source || 'N/A',
        'EMD Amount': tender.emd?.amount || tender.emdAmount || 0,
        'PBG Amount': tender.pbg?.amount || 0,
        'Reason for Loss': tender.reasonForLoss || 'N/A',
        'Loss Notes': tender.reasonForLossNotes || 'N/A',
    }));
};