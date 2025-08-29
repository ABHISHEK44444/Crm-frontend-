

import React, { useState, useMemo } from 'react';
import { Tender, User, FinancialRequest, FinancialRequestStatus, Role, FinancialRequestType, TenderStatus, EMDStatus, PBGStatus } from '../types';
import Card from './Card';
import { FinanceIcon, BellIcon, CurrencyDollarIcon, PlusCircleIcon, ClipboardCheckIcon, ClipboardXIcon, SearchIcon, ArrowLeftIcon } from '../constants';
import { formatCurrency, formatLargeIndianNumber, getFinancialRequestStatusBadgeClass } from '../utils/formatting';

interface FinanceViewProps {
    tenders: Tender[];
    financialRequests: FinancialRequest[];
    currentUser: User;
    users: User[];
    onRequestNew: () => void;
    onUpdateRequestStatus: (requestId: string, newStatus: FinancialRequestStatus, details?: { reason?: string }) => void;
    onProcessRequest: (request: FinancialRequest) => void;
    onDeclineRequest: (request: FinancialRequest) => void;
}

const ActionListItem: React.FC<{ title: string, subtitle: string, value: string, onClick?: () => void, status: React.ReactNode }> = ({ title, subtitle, value, onClick, status }) => (
    <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
        <div>
            <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{title}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
        <div className="flex items-center space-x-4">
            <span className="font-mono text-sm text-slate-700 dark:text-slate-300">{value}</span>
            {status}
        </div>
    </div>
);


const FinanceDashboardTab: React.FC<{ tenders: Tender[], financialRequests: FinancialRequest[], currentUser: User, users: User[] }> = ({ tenders, financialRequests, currentUser, users }) => {
    const userMap = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);
    
    const pendingApprovalValue = useMemo(() => financialRequests.filter(r => r.status === FinancialRequestStatus.PendingApproval).reduce((sum, r) => sum + r.amount, 0), [financialRequests]);
    const activePbgsValue = useMemo(() => tenders.filter(t => t.pbg?.status === PBGStatus.Active).reduce((sum, t) => sum + t.pbg!.amount, 0), [tenders]);
    const refundsPendingValue = useMemo(() => tenders.filter(t => t.emd?.refundStatus === EMDStatus.Requested || t.emd?.refundStatus === EMDStatus.UnderProcess).reduce((sum, t) => sum + t.emd!.amount, 0), [tenders]);
    
    const requestsToApprove = useMemo(() => financialRequests.filter(r => r.status === FinancialRequestStatus.PendingApproval), [financialRequests]);
    
    const isExpiringSoon = (dateString?: string, days: number = 30): boolean => {
        if (!dateString) return false;
        const expiryDate = new Date(dateString);
        const today = new Date();
        const diffTime = expiryDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 && diffDays <= days;
    };
    
    const tenderMap = useMemo(() => new Map(tenders.map(t => [t.id, t])), [tenders]);

    const expiringItems = useMemo(() => {
        const expiringEMDs = tenders
            .filter(t => t.emd && (t.emd.refundStatus !== EMDStatus.Refunded && t.emd.refundStatus !== EMDStatus.Forfeited && t.emd.refundStatus !== EMDStatus.Expired) && isExpiringSoon(t.emd.expiryDate))
            .map(t => ({
                id: `emd-${t.id}`,
                tenderTitle: t.title,
                type: 'EMD' as const,
                amount: t.emd!.amount,
                expiryDate: t.emd!.expiryDate!,
            }));

        const expiringPBGs = financialRequests
            .filter(r => r.type === FinancialRequestType.PBG && r.status === FinancialRequestStatus.Processed && isExpiringSoon(r.instrumentDetails?.expiryDate))
            .map(r => ({
                id: `pbg-${r.id}`,
                tenderTitle: tenderMap.get(r.tenderId)?.title || 'N/A',
                type: 'PBG' as const,
                amount: r.amount,
                expiryDate: r.instrumentDetails!.expiryDate!,
            }));
        
        return [...expiringEMDs, ...expiringPBGs].sort((a,b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
    }, [tenders, financialRequests, tenderMap]);

    const pendingRefunds = useMemo(() => tenders.filter(t => t.emd && (t.emd.refundStatus === EMDStatus.Requested || t.emd.refundStatus === EMDStatus.UnderProcess)), [tenders]);
    
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card title="Requests Pending Approval" value={formatLargeIndianNumber(pendingApprovalValue)} icon={<BellIcon className="w-6 h-6 text-yellow-500" />} />
                <Card title="Active PBG Value" value={formatLargeIndianNumber(activePbgsValue)} icon={<FinanceIcon className="w-6 h-6 text-green-500" />} />
                <Card title="EMD Refunds Pending" value={formatLargeIndianNumber(refundsPendingValue)} icon={<ArrowLeftIcon className="w-6 h-6 text-blue-500" />} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Requests to Approve</h3>
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm space-y-2">
                             {requestsToApprove.length > 0 ? requestsToApprove.map(req => {
                                 const tender = tenderMap.get(req.tenderId);
                                 return <ActionListItem 
                                     key={req.id}
                                     title={`${req.type} for ${tender?.title || 'N/A'}`}
                                     subtitle={`Requested by ${userMap.get(req.requestedById)?.name || 'Unknown'}`}
                                     value={formatCurrency(req.amount)}
                                     status={<span className={getFinancialRequestStatusBadgeClass(req.status)}>{req.status}</span>}
                                 />
                             }) : <p className="text-center text-sm text-slate-500 py-4">No requests are pending approval.</p>}
                        </div>
                    </div>

                     <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Pending EMD Refunds</h3>
                         <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm space-y-2">
                            {pendingRefunds.length > 0 ? pendingRefunds.map(t => (
                                <ActionListItem 
                                     key={t.id}
                                     title={`EMD for ${t.title}`}
                                     subtitle={`Status: ${t.status}`}
                                     value={formatCurrency(t.emd!.amount)}
                                     status={<span className={getFinancialRequestStatusBadgeClass(t.emd!.refundStatus as any)}>{t.emd!.refundStatus}</span>}
                                 />
                            )) : <p className="text-center text-sm text-slate-500 py-4">No EMD refunds are pending.</p>}
                         </div>
                    </div>
                </div>

                <div>
                     <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Instruments Expiring (30d)</h3>
                     <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm space-y-2">
                        {expiringItems.length > 0 ? expiringItems.map(item => {
                            const diffDays = Math.ceil((new Date(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                            return <ActionListItem 
                                key={item.id}
                                title={`${item.type} for ${item.tenderTitle}`}
                                subtitle={`Expires in ${diffDays} days`}
                                value={formatCurrency(item.amount)}
                                status={<span className="text-xs font-semibold text-red-500">Expiring</span>}
                             />
                        }) : <p className="text-center text-sm text-slate-500 py-4">No instruments are expiring soon.</p>}
                     </div>
                </div>

            </div>
        </div>
    )
}

const FinanceRequestsTab: React.FC<FinanceViewProps> = ({ tenders, financialRequests, currentUser, onRequestNew, onUpdateRequestStatus, onProcessRequest, onDeclineRequest, users }) => {
    const [statusFilter, setStatusFilter] = useState<string>('Pending Approval');
    const [searchTerm, setSearchTerm] = useState('');
    
    const isAdmin = currentUser.role === Role.Admin;
    const isFinance = currentUser.role === Role.Finance;
    
    const userMap = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);
    const tenderMap = useMemo(() => new Map(tenders.map(t => [t.id, t])), [tenders]);

    const filteredRequests = useMemo(() => {
        const lowercasedTerm = searchTerm.toLowerCase();
        return financialRequests.filter(req => {
            const tender = tenderMap.get(req.tenderId);
            const requestedBy = userMap.get(req.requestedById);
            return (statusFilter === 'All' || req.status === statusFilter) &&
                (!lowercasedTerm ||
                    (tender?.title.toLowerCase().includes(lowercasedTerm)) ||
                    (tender?.clientName.toLowerCase().includes(lowercasedTerm)) ||
                    (requestedBy?.name.toLowerCase().includes(lowercasedTerm))
                );
        }).sort((a,b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
    }, [financialRequests, statusFilter, searchTerm, tenderMap, userMap]);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-4">
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Financial Requests</h3>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-white dark:bg-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-200 rounded-md px-3 py-2 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                        <option value="All">All Statuses</option>
                        {Object.values(FinancialRequestStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search requests..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-slate-100 dark:bg-slate-700 rounded-lg pl-10 pr-4 py-2 w-64 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                        />
                    </div>
                </div>
                <button onClick={() => onRequestNew()} className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 shadow-sm flex items-center space-x-2">
                    <PlusCircleIcon className="w-5 h-5"/>
                    <span>New Request</span>
                </button>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                     <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                        <tr>
                            <th scope="col" className="px-6 py-3">Request Details</th>
                            <th scope="col" className="px-6 py-3">Tender</th>
                            <th scope="col" className="px-6 py-3 text-right">Amount</th>
                            <th scope="col" className="px-6 py-3">Requested By</th>
                            <th scope="col" className="px-6 py-3">Expiry Date</th>
                            <th scope="col" className="px-6 py-3">Approver</th>
                            <th scope="col" className="px-6 py-3 text-center">Status</th>
                            <th scope="col" className="px-6 py-3 text-center">Actions</th>
                        </tr>
                     </thead>
                     <tbody>
                        {filteredRequests.map(req => {
                            const tender = tenderMap.get(req.tenderId);
                            const requestedBy = userMap.get(req.requestedById);
                            const approver = userMap.get(req.approverId || '');

                            const expiryDate = req.expiryDate || req.instrumentDetails?.expiryDate;

                            return (
                                <tr key={req.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700">
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                        <p>{req.type}</p>
                                        <p className="text-xs text-slate-500">{new Date(req.requestDate).toLocaleDateString()}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-semibold text-slate-800 dark:text-slate-200">{tender?.title || 'N/A'}</p>
                                        <p className="text-xs text-slate-500">{tender?.clientName || 'N/A'}</p>
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono text-slate-800 dark:text-slate-200">{formatCurrency(req.amount)}</td>
                                    <td className="px-6 py-4">{requestedBy?.name || 'Unknown User'}</td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                                        {expiryDate ? new Date(expiryDate).toLocaleDateString('en-IN') : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4">{approver?.name || 'N/A'}</td>
                                    <td className="px-6 py-4 text-center"><span className={getFinancialRequestStatusBadgeClass(req.status)}>{req.status}</span></td>
                                    <td className="px-6 py-4 text-center">
                                        {isAdmin && req.status === FinancialRequestStatus.PendingApproval && (
                                            <div className="flex justify-center space-x-2">
                                                <button onClick={() => onUpdateRequestStatus(req.id, FinancialRequestStatus.Approved)} className="p-2 rounded-lg bg-green-100 hover:bg-green-200 text-green-700" title="Approve"><ClipboardCheckIcon className="w-4 h-4"/></button>
                                                <button onClick={() => onDeclineRequest(req)} className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-700" title="Decline"><ClipboardXIcon className="w-4 h-4"/></button>
                                            </div>
                                        )}
                                        {isFinance && req.status === FinancialRequestStatus.Approved && (
                                            <button onClick={() => onProcessRequest(req)} className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline text-xs">Process</button>
                                        )}
                                        {isFinance && req.status === FinancialRequestStatus.Processed && req.type === FinancialRequestType.EMD && (
                                            <button onClick={() => onUpdateRequestStatus(req.id, FinancialRequestStatus.Refunded)} className="font-medium text-blue-600 dark:text-blue-400 hover:underline text-xs">Mark as Refunded</button>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                     </tbody>
                </table>
                 {filteredRequests.length === 0 && <p className="text-center py-10 text-slate-500">No requests match the current filter.</p>}
            </div>
        </div>
    );
};


export const FinanceView: React.FC<FinanceViewProps> = (props) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'requests'>('dashboard');

  const renderContent = () => {
      switch(activeTab) {
          case 'dashboard': return <FinanceDashboardTab tenders={props.tenders} financialRequests={props.financialRequests} currentUser={props.currentUser} users={props.users} />;
          case 'requests': return <FinanceRequestsTab {...props} />;
          default: return null;
      }
  }

  return (
    <div className="p-8 space-y-8">
        <div className="mb-6 border-b border-slate-200 dark:border-slate-700">
            <nav className="-mb-px flex space-x-8">
                {(['dashboard', 'requests'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                        activeTab === tab
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-600'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </nav>
        </div>
        {renderContent()}
    </div>
  );
};