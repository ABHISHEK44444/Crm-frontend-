import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TenderStatus, Tender, Client, User, BidWorkflowStage } from '../types';
import Card from './Card';
import { SparklesIcon, BellIcon, ClipboardListIcon, CheckCircleIcon } from '../constants';
import { formatLargeIndianNumber } from '../utils/formatting';

interface DashboardProps {
    tenders: Tender[];
    clients: Client[];
    currentUser: User;
    onCardClick: (filter: { type: string; value: any }) => void;
}

const LifecycleStat: React.FC<{ count: number; label: string, value?: string, className?: string, onClick?: () => void }> = ({ count, label, value, className = '', onClick }) => (
    <button 
        onClick={onClick}
        disabled={!onClick}
        className={`w-full text-center bg-gray-50 dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700 hover:ring-2 hover:ring-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-200 disabled:cursor-default disabled:hover:ring-0 ${className}`}>
        <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{count}</p>
        <p className="text-base font-medium text-gray-500 dark:text-gray-400 mt-1">{label}</p>
        {value && <p className="text-lg font-semibold text-green-600 dark:text-green-400 mt-1">{value}</p>}
    </button>
);


const Dashboard: React.FC<DashboardProps> = ({ tenders, clients, currentUser, onCardClick }) => {
    
    const isUpcoming = (dateString: string, days: number): boolean => {
        if (!dateString) return false;
        const targetDate = new Date(dateString);
        const today = new Date();
        const diffTime = targetDate.getTime() - today.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays <= days;
    };
    
    // Stat Card Calculations
    const finalStatuses: TenderStatus[] = [TenderStatus.Won, TenderStatus.Lost, TenderStatus.Archived, TenderStatus.Dropped];
    const biddingInProcess = tenders.filter(t => 
        [BidWorkflowStage.Preparation, BidWorkflowStage.Submission].includes(t.workflowStage) && 
        !finalStatuses.includes(t.status)
    );
    const upcomingDeadlines48h = tenders.filter(t => isUpcoming(t.deadline, 2) && !finalStatuses.includes(t.status));
    const upcomingDeadlines7d = tenders.filter(t => isUpcoming(t.deadline, 7) && !finalStatuses.includes(t.status));
    const upcomingDeadlines15d = tenders.filter(t => isUpcoming(t.deadline, 15) && !finalStatuses.includes(t.status));
    const awardedTenders = tenders.filter(t => t.status === TenderStatus.Won);
    const awardedTendersValue = awardedTenders.reduce((s, t) => s + t.value, 0);

    // Lifecycle Overview Calculations
    const submittedCount = tenders.filter(t => t.workflowStage === BidWorkflowStage.Submission && !finalStatuses.includes(t.status)).length;
    const techEvalCount = tenders.filter(t => t.workflowStage === BidWorkflowStage.UnderTechnicalEvaluation && !finalStatuses.includes(t.status)).length;
    const finEvalCount = tenders.filter(t => t.workflowStage === BidWorkflowStage.UnderFinancialEvaluation && !finalStatuses.includes(t.status)).length;
    const lostTendersCount = tenders.filter(t => t.status === TenderStatus.Lost).length;

    // "My Assignments" List
    const myAssignments = tenders
        .filter(t => t.assignedTo?.includes(currentUser.id) && !finalStatuses.includes(t.status))
        .sort((a,b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
        .slice(0, 5);

    // Tenders by Status Chart Data
    const tenderStatusCounts = tenders.reduce((acc, tender) => {
        acc[tender.status] = (acc[tender.status] || 0) + 1;
        return acc;
    }, {} as Record<TenderStatus, number>);

    const chartData = Object.entries(tenderStatusCounts).map(([name, value]) => ({
        name,
        count: value,
    }));
    
    // Financial Expiry Alerts
    const expiringEMDs = tenders.filter(t => t.emd && isUpcoming(t.emd.expiryDate, 30));
    const expiringPBGs = tenders.filter(t => t.pbg && isUpcoming(t.pbg.expiryDate, 30));
    const expiringItems = [...expiringEMDs, ...expiringPBGs];

  return (
    <div className="p-8 space-y-8">
      {/* 1. Quick Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card 
            title="Tenders due in 48 hours" 
            value={upcomingDeadlines48h.length.toString()} 
            icon={<BellIcon className="w-6 h-6 text-red-500" />}
            onClick={() => onCardClick({ type: 'deadline', value: '48h' })}
        />
        <Card 
            title="Upcoming Deadlines (7d)" 
            value={upcomingDeadlines7d.length.toString()}
            icon={<BellIcon className="w-6 h-6" />}
            onClick={() => onCardClick({ type: 'deadline', value: '7d' })}
        />
        <Card 
            title="Upcoming Deadlines (15d)" 
            value={upcomingDeadlines15d.length.toString()}
            icon={<BellIcon className="w-6 h-6" />}
            onClick={() => onCardClick({ type: 'deadline', value: '15d' })}
        />
        <Card 
            title="Bidding In-Process" 
            value={biddingInProcess.length.toString()}
            icon={<SparklesIcon className="w-6 h-6" />}
            onClick={() => onCardClick({ type: 'workflowStage_and_status', value: { workflowStages: [BidWorkflowStage.Preparation, BidWorkflowStage.Submission], status: 'In Process' } })}
        />
        <Card 
            title="Value Awarded" 
            value={formatLargeIndianNumber(awardedTendersValue)} 
            icon={<CheckCircleIcon className="w-6 h-6 text-green-500" />}
            onClick={() => onCardClick({ type: 'status', value: TenderStatus.Won })}
        />
      </div>

      {/* 2. Lifecycle Overview */}
      <div className="bg-white dark:bg-[#161b22] p-6 rounded-2xl shadow-lg shadow-black/10 dark:shadow-black/20 border dark:border-[#30363d]">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Tender Lifecycle Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <LifecycleStat count={submittedCount} label="Bid Submitted" onClick={() => onCardClick({ type: 'workflowStage', value: BidWorkflowStage.Submission })} />
            <LifecycleStat count={techEvalCount} label="Under Technical Evaluation" onClick={() => onCardClick({ type: 'workflowStage', value: BidWorkflowStage.UnderTechnicalEvaluation })} />
            <LifecycleStat count={finEvalCount} label="Under Financial Evaluation" onClick={() => onCardClick({ type: 'workflowStage', value: BidWorkflowStage.UnderFinancialEvaluation })} />
            <LifecycleStat count={awardedTenders.length} label="Awarded" value={formatLargeIndianNumber(awardedTenders.reduce((s,t) => s + t.value, 0))} onClick={() => onCardClick({ type: 'status', value: TenderStatus.Won })} />
            <LifecycleStat count={lostTendersCount} label="Lost" className="bg-red-100 dark:bg-red-900/40 dark:border-red-800/60" onClick={() => onCardClick({ type: 'status', value: TenderStatus.Lost })} />
        </div>
      </div>

      {/* 3. My Assignments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-3 bg-white dark:bg-[#161b22] p-6 rounded-2xl shadow-lg shadow-black/10 dark:shadow-black/20 border dark:border-[#30363d]">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">My Assignments</h3>
            <div className="space-y-3">
                {myAssignments.length > 0 ? myAssignments.map(tender => (
                    <div key={tender.id} className="p-3 bg-gray-50 dark:bg-[#0d1117] rounded-lg flex justify-between items-center border border-gray-200 dark:border-[#30363d]">
                        <div>
                            <p className="font-semibold text-gray-800 dark:text-gray-200 text-base">{tender.title}</p>
                            <p className="text-base text-gray-500 dark:text-gray-400">{tender.clientName}</p>
                        </div>
                        <div className="text-right">
                             <p className={`text-base font-bold ${isUpcoming(tender.deadline, 2) ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-200'}`}>
                                Due: {new Date(tender.deadline).toLocaleDateString('en-IN')}
                             </p>
                        </div>
                    </div>
                )) : <p className="text-base text-center py-4 text-gray-500 dark:text-gray-400">You have no active assigned tenders.</p>}
            </div>
        </div>
      </div>

      {/* 4. Chart and Financials */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-[#161b22] p-6 rounded-2xl shadow-lg shadow-black/10 dark:shadow-black/20 border dark:border-[#30363d]">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Tenders by Status</h3>
          <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer debounce={50}>
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} className="stroke-gray-300 dark:stroke-[#30363d]"/>
                <XAxis dataKey="name" tick={{ fill: '#64748b' }} className="text-sm dark:fill-gray-400" />
                <YAxis allowDecimals={false} tick={{ fill: '#64748b' }} className="text-sm dark:fill-gray-400"/>
                <Tooltip
                  cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }}
                  contentStyle={{ backgroundColor: '#0d1117', borderColor: '#30363d', borderRadius: '0.75rem' }}
                  labelStyle={{ color: '#cbd5e1' }}
                />
                <Legend iconType="circle" wrapperStyle={{ color: '#9ca3af' }} />
                <Bar dataKey="count" fill="#22d3ee" name="Count"/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white dark:bg-[#161b22] p-6 rounded-2xl shadow-lg shadow-black/10 dark:shadow-black/20 border dark:border-[#30363d]">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Financial Expiry Alerts (30d)</h3>
          <div className="space-y-4">
            {expiringItems.length > 0 ? expiringItems.map(item => (
                 <div key={item.id} className="bg-yellow-500/10 border-l-4 border-yellow-400 p-3 rounded-r-lg">
                    <p className="font-semibold text-base text-yellow-800 dark:text-yellow-300">
                        {item.emd ? 'EMD' : 'PBG'} for "{item.title}"
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-400">
                        Expires: {new Date(item.emd?.expiryDate || item.pbg!.expiryDate).toLocaleDateString('en-IN')}
                    </p>
                 </div>
            )) : <p className="text-base text-gray-500 dark:text-gray-400 mt-4">No EMDs or PBGs are expiring in the next 30 days.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;