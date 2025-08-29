import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Tooltip, FunnelChart, Funnel, LabelList, Cell, AreaChart, Area } from 'recharts';
import { Tender, Client, User, SalesLeaderboardData, TenderStatus, FinancialRequest, SystemActivityLog, Role } from '../types';
import { calculateSalesLeaderboard, calculateTenderFunnel, getWinLossValueByMonth, getWinRateByCategory, calculateWinLossBySource, flattenTendersForExport } from '../utils/analytics';
import { DownloadIcon, SparklesIcon } from '../constants';
import { formatCurrency, formatLargeIndianNumber, getFinancialRequestStatusBadgeClass } from '../utils/formatting';
import { exportToCsv } from '../utils/export';
import { generateReportSummary } from '../services/geminiService';

const ReportingCard: React.FC<{title: string, children: React.ReactNode, className?: string, headerActions?: React.ReactNode}> = ({title, children, className, headerActions}) => (
    <div className={`bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm h-full flex flex-col ${className}`}>
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
            {headerActions && <div>{headerActions}</div>}
        </div>
        <div className="flex-grow">
            {children}
        </div>
    </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800/80 backdrop-blur-sm text-white p-3 rounded-lg border border-slate-700">
          <p className="font-bold">{label}</p>
          {payload.map((pld: any) => (
              <p key={pld.dataKey} style={{ color: pld.color }}>
                  {pld.name}: {pld.dataKey.toLowerCase().includes('rate') ? `${pld.value.toFixed(1)}%` : formatCurrency(pld.value)}
              </p>
          ))}
        </div>
      );
    }
    return null;
};

const ExecutiveSummaryTab: React.FC<{ tenders: Tender[]; clients: Client[] }> = ({ tenders, clients }) => {
    const [aiSummary, setAiSummary] = useState<string | null>(null);
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

    const funnelData = useMemo(() => calculateTenderFunnel(tenders), [tenders]);
    const trendData = useMemo(() => getWinLossValueByMonth(tenders, 6), [tenders]);
    const categoryWinRateData = useMemo(() => getWinRateByCategory(tenders), [tenders]);

    const wonTenders = useMemo(() => tenders.filter(t => t.status === TenderStatus.Won), [tenders]);
    const lostTenders = useMemo(() => tenders.filter(t => t.status === TenderStatus.Lost), [tenders]);
    
    const totalWonValue = useMemo(() => wonTenders.reduce((sum, t) => sum + t.value, 0), [wonTenders]);
    const winRate = useMemo(() => {
        const total = wonTenders.length + lostTenders.length;
        return total > 0 ? (wonTenders.length / total) * 100 : 0;
    }, [wonTenders, lostTenders]);
    const avgDealSize = useMemo(() => wonTenders.length > 0 ? totalWonValue / wonTenders.length : 0, [totalWonValue, wonTenders]);
    const newClientsWon = useMemo(() => new Set(wonTenders.map(t => t.clientId)).size, [wonTenders]);

    const FUNNEL_COLORS = ['#3366CC', '#DC3912', '#FF9900', '#109618', '#990099', '#0099C6'];

    const handleGenerateSummary = async () => {
        setIsGeneratingSummary(true);
        setAiSummary(null);
        try {
            const dataForAI = {
                kpis: { totalWonValue, winRate, avgDealSize, newClientsWon },
                funnelData, trendData, categoryWinRateData
            };
            const summary = await generateReportSummary(dataForAI);
            setAiSummary(summary);
        } catch (error) {
            console.error(error);
            setAiSummary("Failed to generate AI summary. Please check the console for details.");
        } finally {
            setIsGeneratingSummary(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ReportingCard
                title="Executive Summary"
                className="lg:col-span-2"
                headerActions={
                    <button onClick={handleGenerateSummary} disabled={isGeneratingSummary} className="flex items-center space-x-2 text-sm bg-blue-100 text-blue-700 font-semibold px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors shadow-sm dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900 disabled:opacity-50">
                        {isGeneratingSummary ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div> : <SparklesIcon className="w-5 h-5"/>}
                        <span>{isGeneratingSummary ? 'Generating...' : 'Generate AI Summary'}</span>
                    </button>
                }
            >
                {(aiSummary || isGeneratingSummary) && (
                    <div className="mb-6 p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                        {isGeneratingSummary && <p className="text-sm text-slate-600 dark:text-slate-300">Generating AI summary...</p>}
                        {aiSummary && <p className="prose prose-sm dark:prose-invert max-w-none">{aiSummary}</p>}
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-2xl shadow-sm"><p className="text-sm text-slate-500 dark:text-slate-400">Total Value Won</p><p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{formatLargeIndianNumber(totalWonValue)}</p></div>
                    <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-2xl shadow-sm"><p className="text-sm text-slate-500 dark:text-slate-400">Overall Win Rate</p><p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{winRate.toFixed(1)}%</p></div>
                    <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-2xl shadow-sm"><p className="text-sm text-slate-500 dark:text-slate-400">Average Deal Size</p><p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">{formatLargeIndianNumber(avgDealSize)}</p></div>
                    <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-2xl shadow-sm"><p className="text-sm text-slate-500 dark:text-slate-400">Clients Won</p><p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{newClientsWon}</p></div>
                </div>
            </ReportingCard>

            <ReportingCard title="Tender Funnel">
                <ResponsiveContainer width="100%" height={300}>
                    <FunnelChart>
                        <Tooltip content={<CustomTooltip/>}/>
                        <Funnel dataKey="count" data={funnelData} isAnimationActive>
                            <LabelList position="right" fill="#fff" stroke="none" dataKey="name" className="text-xs" />
                            {funnelData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={FUNNEL_COLORS[index % FUNNEL_COLORS.length]} />
                            ))}
                        </Funnel>
                    </FunnelChart>
                </ResponsiveContainer>
            </ReportingCard>
            <ReportingCard title="Win/Loss Value Trend (Last 6 Months)">
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2}/>
                        <XAxis dataKey="name" tick={{fill: '#94a3b8'}} className="text-xs"/>
                        <YAxis tickFormatter={(value) => formatLargeIndianNumber(value as number)} tick={{fill: '#94a3b8'}} className="text-xs"/>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Area type="monotone" dataKey="wonValue" stackId="1" stroke="#16a34a" fill="#16a34a" fillOpacity={0.6} name="Won Value" />
                        <Area type="monotone" dataKey="lostValue" stackId="1" stroke="#dc2626" fill="#dc2626" fillOpacity={0.6} name="Lost Value" />
                    </AreaChart>
                </ResponsiveContainer>
            </ReportingCard>
            <ReportingCard title="Win Rate by Tender Category" className="lg:col-span-2">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={categoryWinRateData} layout="vertical" margin={{ left: 100 }}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2}/>
                        <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} tick={{fill: '#94a3b8'}} className="text-xs"/>
                        <YAxis dataKey="name" type="category" tick={{fill: '#94a3b8'}} className="text-xs" width={100} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="Win Rate" fill="#4f46e5" background={{ fill: '#eee', fillOpacity: 0.1 }} />
                    </BarChart>
                </ResponsiveContainer>
            </ReportingCard>
        </div>
    );
};

const SalesMisTab: React.FC<{tenders: Tender[], users: User[], clients: Client[], currentUser: User}> = ({tenders, users, clients, currentUser}) => {
    const isSalesUser = currentUser.role === Role.Sales;
    const usersToDisplay = isSalesUser ? [currentUser] : users.filter(u => u.role === Role.Sales);

    const userPerformanceData = useMemo(() => {
        return usersToDisplay.map(user => {
            const assignedTenders = tenders.filter(t => t.assignedTo?.includes(user.id));
            const awardedTenders = assignedTenders.filter(t => t.status === TenderStatus.Won);
            const lostTenders = assignedTenders.filter(t => t.status === TenderStatus.Lost);

            const totalCompleted = awardedTenders.length + lostTenders.length;

            return {
                userId: user.id,
                userName: user.name,
                assigned: assignedTenders.length,
                inProcess: assignedTenders.filter(t => [TenderStatus.Submitted, TenderStatus.UnderReview].includes(t.status)).length,
                awarded: awardedTenders.length,
                valueAwarded: awardedTenders.reduce((sum, t) => sum + t.value, 0),
                winRate: totalCompleted > 0 ? (awardedTenders.length / totalCompleted) * 100 : 0,
            };
        }).sort((a, b) => b.valueAwarded - a.valueAwarded);
    }, [tenders, usersToDisplay]);

    const winLossBySource = useMemo(() => calculateWinLossBySource(tenders), [tenders]);
    
    const handleExport = () => {
        const dataForExport = flattenTendersForExport(tenders, users, clients);
        exportToCsv(`m-intergraph-tender-report-${new Date().toISOString().split('T')[0]}.csv`, dataForExport);
    };

    return (
        <div className="space-y-6">
            <ReportingCard
                title="User Performance"
                headerActions={
                     <button
                        onClick={handleExport}
                        className="bg-green-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-sm flex items-center space-x-2"
                    >
                        <DownloadIcon className="w-5 h-5"/>
                        <span>Download Tender Report (CSV)</span>
                    </button>
                }
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700/50 dark:text-slate-300">
                            <tr>
                                <th className="px-6 py-3 text-left">USER</th>
                                <th className="px-6 py-3 text-center">ASSIGNED</th>
                                <th className="px-6 py-3 text-center">IN PROCESS</th>
                                <th className="px-6 py-3 text-center">AWARDED</th>
                                <th className="px-6 py-3 text-right">VALUE AWARDED</th>
                                <th className="px-6 py-3 text-right">WIN RATE</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {userPerformanceData.map(stat => (
                            <tr key={stat.userId}>
                                <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">{stat.userName}</td>
                                <td className="px-6 py-4 text-center">{stat.assigned}</td>
                                <td className="px-6 py-4 text-center">{stat.inProcess}</td>
                                <td className="px-6 py-4 text-center">{stat.awarded}</td>
                                <td className="px-6 py-4 text-right font-mono">{formatCurrency(stat.valueAwarded)}</td>
                                <td className="px-6 py-4 text-right font-semibold">{stat.winRate.toFixed(1)}%</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </ReportingCard>
            
            <ReportingCard title="Win/Loss by Source">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={winLossBySource} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                        <XAxis dataKey="name" tick={{fill: '#94a3b8'}} className="text-xs"/>
                        <YAxis tick={{fill: '#94a3b8'}} className="text-xs"/>
                        <Tooltip content={<CustomTooltip />}/>
                        <Legend wrapperStyle={{paddingTop: '20px'}}/>
                        <Bar dataKey="lost" fill="#ef4444" name="Lost"/>
                        <Bar dataKey="won" fill="#22c55e" name="Won"/>
                    </BarChart>
                </ResponsiveContainer>
            </ReportingCard>
        </div>
    );
}

const FinanceMisTab: React.FC<{ financialRequests: FinancialRequest[], tenders: Tender[], users: User[] }> = ({ financialRequests, tenders, users }) => {
    const tenderMap = useMemo(() => new Map(tenders.map(t => [t.id, t])), [tenders]);
    const userMap = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);
    const wonTenders = useMemo(() => tenders.filter(t => t.status === TenderStatus.Won), [tenders]);
    const projectProfitability = useMemo(() => wonTenders.map(tender => ({
        id: tender.id,
        title: tender.title,
        value: tender.value,
        cost: tender.cost || 0,
        profit: tender.value - (tender.cost || 0) - (tender.liquidatedDamages || 0),
        margin: tender.value > 0 ? ((tender.value - (tender.cost || 0) - (tender.liquidatedDamages || 0)) / tender.value) * 100 : 0
    })).sort((a,b) => b.profit - a.profit), [wonTenders]);

    return (
        <div className="space-y-6">
            <ReportingCard title="Project Profitability">
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                            <tr>
                                <th className="px-4 py-2 text-left">Tender</th>
                                <th className="px-4 py-2 text-right">Value</th>
                                <th className="px-4 py-2 text-right">Cost</th>
                                <th className="px-4 py-2 text-right">Profit</th>
                                <th className="px-4 py-2 text-right">Margin</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {projectProfitability.map(p => (
                            <tr key={p.id}>
                                <td className="px-4 py-2 font-medium text-slate-800 dark:text-slate-200">{p.title}</td>
                                <td className="px-4 py-2 text-right font-mono">{formatCurrency(p.value)}</td>
                                <td className="px-4 py-2 text-right font-mono">{formatCurrency(p.cost)}</td>
                                <td className="px-4 py-2 text-right font-mono font-semibold text-green-600 dark:text-green-400">{formatCurrency(p.profit)}</td>
                                <td className="px-4 py-2 text-right font-semibold text-blue-600 dark:text-blue-400">{p.margin.toFixed(1)}%</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </ReportingCard>
             <ReportingCard title="Financial Requests Ledger">
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                            <tr>
                                <th className="px-4 py-2 text-left">Tender</th>
                                <th className="px-4 py-2 text-left">Type</th>
                                <th className="px-4 py-2 text-right">Amount</th>
                                <th className="px-4 py-2 text-center">Status</th>
                                <th className="px-4 py-2 text-left">Requested By</th>
                                <th className="px-4 py-2 text-left">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {financialRequests.map(req => (
                            <tr key={req.id}>
                                <td className="px-4 py-2 font-medium text-slate-800 dark:text-slate-200">{tenderMap.get(req.tenderId)?.title || 'N/A'}</td>
                                <td className="px-4 py-2">{req.type}</td>
                                <td className="px-4 py-2 text-right font-mono">{formatCurrency(req.amount)}</td>
                                <td className="px-4 py-2 text-center"><span className={getFinancialRequestStatusBadgeClass(req.status)}>{req.status}</span></td>
                                <td className="px-4 py-2">{userMap.get(req.requestedById)?.name || 'N/A'}</td>
                                <td className="px-4 py-2">{new Date(req.requestDate).toLocaleDateString()}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </ReportingCard>
        </div>
    );
}

const ActivityLogTab: React.FC<{ activityLog: SystemActivityLog[] }> = ({ activityLog }) => {
    const [filter, setFilter] = useState('');
    const filteredLogs = useMemo(() => {
        if (!filter) return activityLog;
        const lowercasedFilter = filter.toLowerCase();
        return activityLog.filter(log => 
            log.user.toLowerCase().includes(lowercasedFilter) ||
            log.action.toLowerCase().includes(lowercasedFilter) ||
            log.entityName.toLowerCase().includes(lowercasedFilter) ||
            log.details?.toLowerCase().includes(lowercasedFilter)
        );
    }, [activityLog, filter]);

    return (
        <ReportingCard title="System Activity Log">
            <input 
                type="text"
                placeholder="Filter logs..."
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className="w-full mb-4 bg-slate-100 dark:bg-slate-700 rounded-md p-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <div className="overflow-y-auto max-h-[60vh]">
                <table className="w-full text-sm">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300 sticky top-0">
                        <tr>
                            <th className="px-4 py-2 text-left">Timestamp</th>
                            <th className="px-4 py-2 text-left">User</th>
                            <th className="px-4 py-2 text-left">Action</th>
                            <th className="px-4 py-2 text-left">Entity</th>
                            <th className="px-4 py-2 text-left">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {filteredLogs.map(log => (
                            <tr key={log.id}>
                                <td className="px-4 py-2 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                                <td className="px-4 py-2">{log.user}</td>
                                <td className="px-4 py-2 font-semibold">{log.action}</td>
                                <td className="px-4 py-2">
                                    <span className={`px-2 py-0.5 text-xs rounded-full ${log.entityType === 'Tender' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'}`}>{log.entityType}</span>
                                    <p className="mt-1">{log.entityName}</p>
                                </td>
                                <td className="px-4 py-2 text-slate-500">{log.details}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </ReportingCard>
    );
}

const ReportingView: React.FC<{ tenders: Tender[], clients: Client[], users: User[], financialRequests: FinancialRequest[], activityLog: SystemActivityLog[], currentUser: User }> = (props) => {
    const { tenders, clients, users, financialRequests, activityLog, currentUser } = props;
    const [activeTab, setActiveTab] = useState<'summary' | 'sales' | 'finance' | 'activity'>('summary');

    const isSalesUser = currentUser.role === Role.Sales;

    const filteredData = useMemo(() => {
        if (!isSalesUser) {
            // Admin/Finance and other roles see all data
            return { tenders, clients, users, financialRequests, activityLog };
        }

        // Sales user sees only data related to their assigned tenders
        const userTenders = tenders.filter(t => (t.assignedTo || []).includes(currentUser.id));
        const userTenderIds = new Set(userTenders.map(t => t.id));
        const clientIds = new Set(userTenders.map(t => t.clientId));

        return {
            tenders: userTenders,
            clients: clients.filter(c => clientIds.has(c.id)),
            users: users, // Pass all users so leaderboards can be calculated, but data will be based on filtered tenders
            financialRequests: financialRequests.filter(req => userTenderIds.has(req.tenderId)),
            activityLog: activityLog.filter(log =>
                log.userId === currentUser.id ||
                (log.entityType === 'Tender' && userTenderIds.has(log.entityId)) ||
                (log.entityType === 'Client' && clientIds.has(log.entityId))
            ),
        };
    }, [isSalesUser, tenders, clients, users, financialRequests, activityLog, currentUser.id]);
    
    const renderContent = () => {
        switch(activeTab) {
            case 'summary': return <ExecutiveSummaryTab tenders={filteredData.tenders} clients={filteredData.clients} />;
            case 'sales': return <SalesMisTab tenders={filteredData.tenders} users={filteredData.users} clients={filteredData.clients} currentUser={currentUser} />;
            case 'finance': return <FinanceMisTab financialRequests={filteredData.financialRequests} tenders={filteredData.tenders} users={filteredData.users} />;
            case 'activity': return <ActivityLogTab activityLog={filteredData.activityLog} />;
            default: return null;
        }
    }

    return (
        <div className="p-8 space-y-8">
            <div className="border-b border-slate-200 dark:border-slate-700">
                <nav className="-mb-px flex space-x-8">
                    {(['summary', 'sales', 'finance', 'activity'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                            activeTab === tab
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-600'
                            }`}
                        >
                            {tab === 'summary' ? 'Executive Summary' : (tab === 'activity' ? 'Activity Log' : `${tab} MIS`)}
                        </button>
                    ))}
                </nav>
            </div>
            {renderContent()}
        </div>
    );
};

export default ReportingView;