import React, { useMemo } from 'react';
import { Tender, TenderStatus, User, OEM, Product } from '../types';
import { SparklesIcon, UploadCloudIcon, TrashIcon } from '../constants';
import { getTenderStatusBadgeClass, formatCurrency } from '../utils/formatting';
import { SearchIcon } from '../constants';

interface TenderListViewProps {
  tenders: Tender[];
  oems: OEM[];
  products: Product[];
  users: User[];
  setSelectedTender: (selection: { tender: Tender, from?: string } | null) => void;
  onAnalyze: (tender: Tender) => void;
  currentUser: User;
  onAddTender: () => void;
  onImportTender: () => void;
  onDeleteTender: (tender: Tender) => void;
  filters: {
      statusFilter: string;
      userFilter: string;
      searchTerm: string;
      workflowFilter: string | string[] | null;
      deadlineFilter: '48h' | '7d' | '15d' | null;
  };
  onFiltersChange: (newFilters: Partial<TenderListViewProps['filters']>) => void;
}

const getJurisdictionBadgeClass = (jurisdiction?: string): string => {
    const baseClass = "px-2 py-1 text-xs font-semibold rounded-full ring-1 ring-inset";
    if (!jurisdiction) return `hidden`;
    switch (jurisdiction.toLowerCase()) {
        case 'haryana': return `${baseClass} bg-orange-500/10 text-orange-400 ring-orange-500/20`;
        case 'gem': return `${baseClass} bg-teal-500/10 text-teal-400 ring-teal-500/20`;
        case 'rajasthan': return `${baseClass} bg-rose-500/10 text-rose-400 ring-rose-500/20`;
        default: return `${baseClass} bg-gray-500/10 text-gray-400 ring-gray-500/20`;
    }
}

const TenderListView: React.FC<TenderListViewProps> = ({ tenders, onAnalyze, currentUser, onAddTender, onImportTender, setSelectedTender, onDeleteTender, filters, onFiltersChange, users }) => {
    
    const userMap = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);

    const filteredTenders = useMemo(() => {
        const { statusFilter, userFilter, searchTerm, workflowFilter, deadlineFilter } = filters;

        const isUpcoming = (dateString: string, days: number): boolean => {
            if (!dateString) return false;
            const targetDate = new Date(dateString);
            const today = new Date();
            const diffTime = targetDate.getTime() - today.getTime();
            const diffDays = diffTime / (1000 * 60 * 60 * 24);
            return diffDays >= 0 && diffDays <= days;
        };
        
        const finalStatuses: TenderStatus[] = [TenderStatus.Won, TenderStatus.Lost, TenderStatus.Archived, TenderStatus.Dropped];

        return tenders.filter(tender => {
            const lowercasedTerm = searchTerm.toLowerCase();

            // Match against programmatic filters first
            const workflowMatch = !workflowFilter || (Array.isArray(workflowFilter) ? workflowFilter.includes(tender.workflowStage) : tender.workflowStage === workflowFilter);
            const deadlineMatch = !deadlineFilter || (isUpcoming(tender.deadline, deadlineFilter === '48h' ? 2 : (deadlineFilter === '7d' ? 7 : 15)) && !finalStatuses.includes(tender.status));

            // Match against UI filters
            const statusMatch = statusFilter === 'All' ||
                (statusFilter === 'In Process' && !finalStatuses.includes(tender.status)) ||
                tender.status === statusFilter;
            const userMatch = userFilter === 'All' || (tender.assignedTo || []).includes(userFilter);
            const searchMatch = !lowercasedTerm || 
                tender.title.toLowerCase().includes(lowercasedTerm) ||
                tender.clientName.toLowerCase().includes(lowercasedTerm) ||
                (tender.tenderNumber || '').toLowerCase().includes(lowercasedTerm);
            
            return statusMatch && userMatch && searchMatch && workflowMatch && deadlineMatch;
        });
    }, [tenders, filters]);

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-4">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Tender Listings</h3>
                    {/* Filters */}
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search by title, client..."
                            value={filters.searchTerm}
                            onChange={(e) => onFiltersChange({ searchTerm: e.target.value })}
                            className="bg-gray-100 dark:bg-[#21262d] rounded-lg pl-10 pr-4 py-2 w-64 text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition border border-transparent dark:border-[#30363d] focus:border-cyan-500"
                        />
                    </div>
                    <div>
                        <select
                            value={filters.statusFilter}
                            onChange={(e) => onFiltersChange({ statusFilter: e.target.value })}
                            className="bg-white dark:bg-[#21262d] text-sm font-semibold text-gray-600 dark:text-gray-300 rounded-md px-3 py-2 border border-gray-300 dark:border-[#30363d] focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                        >
                            <option value="All">All Statuses</option>
                            <option value="In Process">In Process</option>
                            {Object.values(TenderStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <select
                            value={filters.userFilter}
                            onChange={(e) => onFiltersChange({ userFilter: e.target.value })}
                            className="bg-white dark:bg-[#21262d] text-sm font-semibold text-gray-600 dark:text-gray-300 rounded-md px-3 py-2 border border-gray-300 dark:border-[#30363d] focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                        >
                            <option value="All">All Users</option>
                            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <button onClick={onImportTender} className="bg-blue-500/10 text-blue-400 font-semibold px-4 py-2 rounded-lg hover:bg-blue-500/20 transition-colors shadow-sm flex items-center space-x-2 text-sm">
                        <UploadCloudIcon className="w-5 h-5" />
                        <span>Import Tender</span>
                    </button>
                    <button onClick={onAddTender} className="bg-cyan-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-cyan-600 transition-colors shadow-sm text-sm">
                        Add New Tender
                    </button>
                </div>
            </div>
            <div className="bg-white dark:bg-[#161b22] border dark:border-[#30363d] rounded-2xl shadow-xl shadow-black/10 dark:shadow-black/20 overflow-hidden">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-[#21262d] dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Tender Title</th>
                            <th scope="col" className="px-6 py-3">Client</th>
                            <th scope="col" className="px-6 py-3 text-right">Value</th>
                            <th scope="col" className="px-6 py-3">Deadline</th>
                            <th scope="col" className="px-6 py-3">Assigned To</th>
                            <th scope="col" className="px-6 py-3 text-center">Status</th>
                            <th scope="col" className="px-6 py-3 text-center">Actions</th>
                            <th scope="col" className="px-6 py-3 text-center">Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTenders.map((tender) => (
                            <tr key={tender.id} className="bg-white dark:bg-[#161b22] border-b dark:border-[#30363d] hover:bg-gray-50 dark:hover:bg-[#21262d]/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                    {tender.title}
                                    <div className="flex items-center space-x-2 mt-1">
                                        {tender.jurisdiction && <span className={getJurisdictionBadgeClass(tender.jurisdiction)}>{tender.jurisdiction}</span>}
                                    </div>
                                </td>
                                <td className="px-6 py-4">{tender.clientName}</td>
                                <td className="px-6 py-4 text-right font-mono">{formatCurrency(tender.value)}</td>
                                <td className="px-6 py-4">{new Date(tender.deadline).toLocaleDateString('en-IN')}</td>
                                <td className="px-6 py-4">
                                    <div className="flex -space-x-2 overflow-hidden">
                                        {(tender.assignedTo || []).map(id => userMap.get(id)).filter(Boolean).map(user => (
                                            <img key={user!.id} className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-[#161b22]" src={user!.avatarUrl} alt={user!.name} title={user!.name} />
                                        ))}
                                        {(tender.assignedTo || []).length === 0 && <span className="text-xs">Unassigned</span>}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={getTenderStatusBadgeClass(tender.status)}>{tender.status}</span>
                                </td>
                                <td className="px-6 py-4 text-center space-x-2">
                                    <button onClick={() => setSelectedTender({ tender })} className="font-medium text-cyan-500 hover:underline">View</button>
                                    <button onClick={(e) => { e.stopPropagation(); onAnalyze(tender); }} className="font-medium text-cyan-500 hover:underline"><SparklesIcon className="w-4 h-4 inline-block" /></button>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {currentUser.role === 'Admin' && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onDeleteTender(tender); }} 
                                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                            aria-label={`Delete tender ${tender.title}`}
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredTenders.length === 0 && (
                    <div className="text-center py-16 text-gray-500">
                        <p className="font-semibold">No Tenders Found</p>
                        <p className="text-sm">Try adjusting your search or filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TenderListView;