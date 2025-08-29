

import React, { useState, useMemo } from 'react';
import { OEM, Tender, UserStatus } from '../types';
import { PlusCircleIcon, PencilIcon, SearchIcon } from '../constants';
import { formatCurrency, getUserStatusBadgeClass } from '../utils/formatting';

const OemDetailView: React.FC<{oem: OEM, tenders: Tender[], onBack: () => void}> = ({oem, tenders, onBack}) => {
    const associatedTenders = useMemo(() => tenders.filter(t => t.oemId === oem.id), [tenders, oem.id]);

    return (
        <div>
            <button onClick={onBack} className="mb-6 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                &larr; Back to OEM List
            </button>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{oem.name}</h2>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                        <p className="text-slate-500">Region</p>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{oem.region || 'N/A'}</p>
                    </div>
                     <div>
                        <p className="text-slate-500">Area</p>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{oem.area || 'N/A'}</p>
                    </div>
                    {oem.website && 
                        <div>
                            <p className="text-slate-500">Website</p>
                            <a href={`https://${oem.website}`} target="_blank" rel="noreferrer" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline text-sm truncate block">{oem.website}</a>
                        </div>
                    }
                </div>

                <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-6">
                    <h4 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-2">Primary Contact</h4>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <p className="text-slate-500">Name</p>
                            <p className="font-semibold text-slate-800 dark:text-slate-200">{oem.contactPerson}</p>
                        </div>
                        <div>
                            <p className="text-slate-500">Email</p>
                            <a href={`mailto:${oem.email}`} className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">{oem.email}</a>
                        </div>
                        <div>
                            <p className="text-slate-500">Phone</p>
                            <p className="font-semibold text-slate-800 dark:text-slate-200">{oem.phone}</p>
                        </div>
                    </div>
                </div>

                {oem.accountManager && (
                    <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-6">
                        <div className="flex items-center space-x-3 mb-2">
                             <h4 className="text-base font-semibold text-slate-700 dark:text-slate-300">Account Manager</h4>
                             <span className={getUserStatusBadgeClass(oem.accountManagerStatus || 'Inactive')}>{oem.accountManagerStatus}</span>
                        </div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{oem.accountManager}</p>
                    </div>
                )}

                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mt-8 mb-4">Associated Tenders</h3>
                 <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                        <tr>
                            <th className="px-4 py-2 text-left">Title</th>
                            <th className="px-4 py-2 text-left">Client</th>
                            <th className="px-4 py-2 text-right">Value</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {associatedTenders.map(t => (
                        <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                            <td className="px-4 py-2 font-medium text-slate-800 dark:text-slate-200">{t.title}</td>
                            <td className="px-4 py-2 text-slate-600 dark:text-slate-300">{t.clientName}</td>
                            <td className="px-4 py-2 text-right font-mono text-slate-600 dark:text-slate-300">{formatCurrency(t.value)}</td>
                        </tr>
                    ))}
                    {associatedTenders.length === 0 && (
                        <tr><td colSpan={3} className="text-center py-4 text-slate-500">No tenders associated with this OEM.</td></tr>
                    )}
                    </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

interface OemsViewProps {
    oems: OEM[];
    tenders: Tender[];
    onAddOem: () => void;
    onEditOem: (oem: OEM) => void;
}

const OemsView: React.FC<OemsViewProps> = ({ oems, tenders, onAddOem, onEditOem }) => {
    const [selectedOem, setSelectedOem] = useState<OEM | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredOems = useMemo(() => {
        const lowercasedTerm = searchTerm.toLowerCase();
        if (!lowercasedTerm) return oems;
        return oems.filter(oem =>
            oem.name.toLowerCase().includes(lowercasedTerm) ||
            oem.contactPerson.toLowerCase().includes(lowercasedTerm) ||
            (oem.region || '').toLowerCase().includes(lowercasedTerm) ||
            (oem.accountManager || '').toLowerCase().includes(lowercasedTerm)
        );
    }, [oems, searchTerm]);

    if (selectedOem) {
        return <OemDetailView oem={selectedOem} tenders={tenders} onBack={() => setSelectedOem(null)} />;
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-4">
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">OEM Directory</h3>
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search OEMs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-slate-100 dark:bg-slate-700 rounded-lg pl-10 pr-4 py-2 w-64 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                        />
                    </div>
                </div>
                <button onClick={onAddOem} className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center space-x-2">
                    <PlusCircleIcon className="w-5 h-5"/>
                    <span>Add New OEM</span>
                </button>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                        <tr>
                            <th scope="col" className="px-6 py-3">OEM Name</th>
                            <th scope="col" className="px-6 py-3">Region</th>
                            <th scope="col" className="px-6 py-3">Contact Person</th>
                            <th scope="col" className="px-6 py-3">Account Manager</th>
                            <th scope="col" className="px-6 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOems.map((oem) => (
                            <tr key={oem.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                <th scope="row" className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">{oem.name}</th>
                                <td className="px-6 py-4">{oem.region || 'N/A'}</td>
                                <td className="px-6 py-4">{oem.contactPerson}</td>
                                <td className="px-6 py-4">
                                    {oem.accountManager ? (
                                        <div className="flex items-center space-x-2">
                                            <span>{oem.accountManager}</span>
                                            <span className={getUserStatusBadgeClass(oem.accountManagerStatus as UserStatus || 'Inactive')}>{oem.accountManagerStatus}</span>
                                        </div>
                                    ) : 'N/A'}
                                </td>
                                <td className="px-6 py-4 text-center space-x-2">
                                    <button onClick={() => setSelectedOem(oem)} className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">View</button>
                                    <button onClick={() => onEditOem(oem)} className="font-medium text-slate-600 dark:text-slate-400 hover:underline">Edit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OemsView;