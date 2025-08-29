


import React, { useState, useMemo, useCallback } from 'react';
import { Client, ClientStatus, Contact, User, ClientHistoryLog, Tender, TenderStatus, InteractionLog, ClientAcquisitionSource } from '../types';
import { PlusCircleIcon, TrashIcon, PencilIcon, CurrencyDollarIcon, SparklesIcon, ChartBarIcon, SearchIcon } from '../constants';
import { getClientStatusBadgeClass, getTenderStatusBadgeClass, formatCurrency, formatLargeIndianNumber } from '../utils/formatting';
import { calculateClientHealth } from '../utils/analytics';
import InteractionLogger from './InteractionLogger';
import AiClientSummaryModal from './AiClientSummaryModal';

const EditableField: React.FC<{ label: string, value: string | number, name: string, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void, isEditing: boolean, type?: string }> =
    ({ label, value, name, onChange, isEditing, type = 'text' }) => (
        <div>
            <p className="text-base text-slate-500 dark:text-slate-400">{label}</p>
            {isEditing ? (
                type === 'textarea' ?
                    <textarea name={name} value={value} onChange={onChange} rows={4} className="w-full mt-1 bg-slate-100 dark:bg-slate-700 rounded-md p-2 text-base text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition" />
                    :
                    <input name={name} type={type} value={value} onChange={onChange} className="w-full mt-1 bg-slate-100 dark:bg-slate-700 rounded-md p-2 text-base text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition" />
            ) : (
                 <p className={`font-semibold text-slate-800 dark:text-slate-200 text-base ${type === 'textarea' ? 'prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap' : ''}`}>{
                    value ? (type === 'number' ? formatCurrency(Number(value)) : value) : (type === 'textarea' ? 'No notes added.' : 'N/A')
                }</p>
            )}
        </div>
    );
    
const getClientHealthBadgeClass = (health?: 'Excellent' | 'Good' | 'At-Risk') => {
    const base = "px-2.5 py-1 text-sm font-medium rounded-full";
    switch(health) {
        case 'Excellent': return `${base} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`;
        case 'Good': return `${base} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300`;
        case 'At-Risk': return `${base} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300`;
        default: return `hidden`;
    }
};

const ClientDetailView: React.FC<{
    client: Client,
    tenders: Tender[],
    onBack: () => void,
    onUpdateClient: (client: Client) => void,
    onLogInteraction: (clientId: string, interaction: Omit<InteractionLog, 'id' | 'user' | 'userId' | 'timestamp'>) => void,
    onAddContact: (clientId: string) => void,
    onEditContact: (clientId: string, contact: Contact) => void,
    onDeleteContact: (clientId: string, contactId: string) => void,
    onOpenAiSummary: () => void,
    currentUser: User
}> = ({ client, tenders, onBack, onUpdateClient, onLogInteraction, onAddContact, onEditContact, onDeleteContact, onOpenAiSummary, currentUser }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedClient, setEditedClient] = useState(client);

    const clientTenders = useMemo(() => tenders.filter(t => t.clientId === client.id), [tenders, client.id]);
    const totalValueWon = useMemo(() => clientTenders.filter(t => t.status === TenderStatus.Won).reduce((sum, t) => sum + t.value, 0), [clientTenders]);
    const activeTenderValue = useMemo(() => clientTenders.filter(t => t.status !== TenderStatus.Won && t.status !== TenderStatus.Lost).reduce((sum, t) => sum + t.value, 0), [clientTenders]);
    const clientHealth = useMemo(() => calculateClientHealth(client, clientTenders), [client, clientTenders]);


    const handleEditToggle = () => {
        if (isEditing) {
            onUpdateClient(editedClient);
        }
        setIsEditing(!isEditing);
    };

    const handleCancel = () => {
        setEditedClient(client);
        setIsEditing(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setEditedClient(prev => ({ ...prev!, [name]: type === 'number' ? Number(value) : value }));
    };
    
    const clientForDisplay = isEditing ? editedClient : client;

    return (
        <div className="p-8">
            <button onClick={onBack} className="mb-6 text-base font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                &larr; Back to Client List
            </button>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-8 space-y-10">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center space-x-3">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{clientForDisplay.name}</h2>
                            <span className={getClientHealthBadgeClass(clientHealth)}>Health: {clientHealth}</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400">{clientForDisplay.industry}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                       <div className={getClientStatusBadgeClass(clientForDisplay.status)}>{clientForDisplay.status}</div>
                        <button onClick={onOpenAiSummary} className="flex items-center space-x-2 text-base bg-blue-100 text-blue-700 font-semibold px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors shadow-sm dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900">
                           <SparklesIcon className="w-5 h-5"/>
                           <span>AI Summary</span>
                        </button>
                       <button onClick={handleEditToggle} className="text-base bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">{isEditing ? 'Save Changes' : 'Edit Client'}</button>
                        {isEditing && <button onClick={handleCancel} className="text-base bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold px-4 py-2 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500">Cancel</button>}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Financial Summary</h3>
                             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
                                    <p className="text-base text-green-600 dark:text-green-300 font-semibold flex items-center"><CurrencyDollarIcon className="w-4 h-4 mr-2"/>Total Value Won</p>
                                    <p className="text-2xl font-bold text-green-800 dark:text-green-100 mt-1">{formatLargeIndianNumber(totalValueWon)}</p>
                                </div>
                                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                                    <p className="text-base text-blue-600 dark:text-blue-300 font-semibold flex items-center"><SparklesIcon className="w-4 h-4 mr-2"/>Active Tender Value</p>
                                    <p className="text-2xl font-bold text-blue-800 dark:text-blue-100 mt-1">{formatLargeIndianNumber(activeTenderValue)}</p>
                                </div>
                                <div className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg">
                                    <p className="text-base text-slate-600 dark:text-slate-300 font-semibold flex items-center"><ChartBarIcon className="w-4 h-4 mr-2"/>Associated Tenders</p>
                                    <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{clientTenders.length}</p>
                                </div>
                            </div>
                        </div>

                         <div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Associated Tenders</h3>
                             <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                                <table className="w-full text-base">
                                <thead className="text-sm text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                                    <tr>
                                        <th className="px-4 py-2 text-left">Title</th>
                                        <th className="px-4 py-2 text-right">Value</th>
                                        <th className="px-4 py-2 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {clientTenders.map(t => (
                                    <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                                        <td className="px-4 py-2 font-medium text-slate-800 dark:text-slate-200">{t.title}</td>
                                        <td className="px-4 py-2 text-right font-mono text-slate-600 dark:text-slate-300">{formatCurrency(t.value)}</td>
                                        <td className="px-4 py-2 text-center"><span className={getTenderStatusBadgeClass(t.status)}>{t.status}</span></td>
                                    </tr>
                                ))}
                                {clientTenders.length === 0 && (
                                    <tr><td colSpan={3} className="text-center py-4 text-slate-500">No tenders associated with this client.</td></tr>
                                )}
                                </tbody>
                                </table>
                            </div>
                         </div>


                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Client Details</h3>
                            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-6 text-base">
                                <EditableField label="Client Name" name="name" value={clientForDisplay.name} onChange={handleChange} isEditing={isEditing} />
                                <EditableField label="Industry" name="industry" value={clientForDisplay.industry} onChange={handleChange} isEditing={isEditing} />
                                <EditableField label="GSTIN" name="gstin" value={clientForDisplay.gstin} onChange={handleChange} isEditing={isEditing} />
                                 <div>
                                    <p className="text-base text-slate-500 dark:text-slate-400">Acquisition Source</p>
                                    {isEditing ? (
                                        <select name="source" value={clientForDisplay.source || ''} onChange={handleChange} className="w-full mt-1 bg-slate-100 dark:bg-slate-700 rounded-md p-2 text-base text-slate-800 dark:text-slate-200">
                                            <option value="">Select a source</option>
                                            {Object.values(ClientAcquisitionSource).map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    ) : <p className="font-semibold text-slate-800 dark:text-slate-200">{clientForDisplay.source || 'N/A'}</p>}
                                </div>
                                <div>
                                    <p className="text-base text-slate-500 dark:text-slate-400">Category</p>
                                    {isEditing ? <input name="category" value={clientForDisplay.category} onChange={handleChange} className="w-full mt-1 bg-slate-100 dark:bg-slate-700 rounded-md p-2 text-base text-slate-800 dark:text-slate-200"/> : <p className="font-semibold text-slate-800 dark:text-slate-200">{clientForDisplay.category}</p>}
                                </div>
                                <div>
                                    <p className="text-base text-slate-500 dark:text-slate-400">Status</p>
                                    {isEditing ? (
                                        <select name="status" value={clientForDisplay.status} onChange={handleChange} className="w-full mt-1 bg-slate-100 dark:bg-slate-700 rounded-md p-2 text-base text-slate-800 dark:text-slate-200">
                                            {Object.values(ClientStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    ) : <div className={`inline-block mt-1 ${getClientStatusBadgeClass(clientForDisplay.status)}`}>{clientForDisplay.status}</div>}
                                </div>
                                 <EditableField label="Potential Value" name="potentialValue" value={clientForDisplay.potentialValue || 0} onChange={handleChange} isEditing={isEditing} type="number"/>

                                <div className="md:col-span-2">
                                     <EditableField label="Notes" name="notes" value={clientForDisplay.notes || ''} onChange={handleChange} isEditing={isEditing} type="textarea"/>
                                </div>
                            </div>
                        </div>

                         <div>
                            <div className="flex justify-between items-center mb-4">
                               <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Key Contacts</h3>
                               <button onClick={() => onAddContact(client.id)} className="flex items-center space-x-2 text-base font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200">
                                   <PlusCircleIcon className="w-5 h-5"/>
                                   <span>Add Contact</span>
                               </button>
                            </div>
                            <div className="border border-slate-200 dark:border-slate-700 rounded-lg">
                            {client.contacts.length > 0 ? (
                                <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                                {client.contacts.map(contact => (
                                    <li key={contact.id} className="p-4 flex justify-between items-center group">
                                        <div>
                                            <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center text-base">{contact.name} {contact.isPrimary && <span className="ml-2 text-sm bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full">Primary</span>}</p>
                                            <p className="text-base text-slate-500 dark:text-slate-400">{contact.role}</p>
                                        </div>
                                        <div className="text-right text-base">
                                             <a href={`mailto:${contact.email}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">{contact.email}</a>
                                             <p className="text-slate-500 dark:text-slate-400">{contact.phone}</p>
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity space-x-2">
                                            <button onClick={() => onEditContact(client.id, contact)} className="p-1 text-slate-500 hover:text-indigo-600"><PencilIcon className="w-4 h-4"/></button>
                                            <button onClick={() => onDeleteContact(client.id, contact.id)} className="p-1 text-slate-500 hover:text-red-600"><TrashIcon className="w-4 h-4"/></button>
                                        </div>
                                    </li>
                                ))}
                                </ul>
                            ) : (
                                <p className="p-4 text-base text-slate-500 dark:text-slate-400 text-center">No contacts listed. Click 'Add Contact' to get started.</p>
                            )}
                            </div>
                        </div>
                    </div>
                    {/* Right Column */}
                    <div className="space-y-6">
                         <InteractionLogger 
                            interactions={client.interactions || []}
                            onLogInteraction={(interaction) => onLogInteraction(client.id, interaction)}
                         />
                         <div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Automated Activity</h3>
                            <ul className="border border-slate-200 dark:border-slate-700 rounded-lg max-h-96 overflow-y-auto">
                                {(client.history || []).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((log, index) => (
                                    <li key={index} className="p-3 border-b border-slate-200 dark:border-slate-700 last:border-b-0">
                                        <p className="text-base text-slate-800 dark:text-slate-200">
                                            <span className="font-semibold">{log.user}</span> {log.action}
                                        </p>
                                        {log.details && <p className="text-sm text-slate-500 dark:text-slate-400 pl-2 border-l-2 border-slate-200 dark:border-slate-600 ml-1 py-1 px-2 mt-1">{log.details}</p>}
                                        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">{new Date(log.timestamp).toLocaleString('en-IN')}</p>
                                    </li>
                                ))}
                                {(client.history || []).length === 0 && <p className="p-4 text-base text-slate-500 dark:text-slate-400 text-center">No activity yet.</p>}
                            </ul>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface CrmViewProps {
    clients: Client[];
    tenders: Tender[];
    onAddClient: () => void;
    onEditClient: (client: Client) => void;
    onUpdateClient: (client: Client) => void;
    onLogInteraction: (clientId: string, interaction: Omit<InteractionLog, 'id' | 'user' | 'userId' | 'timestamp'>) => void;
    onAddContact: (clientId: string) => void;
    onEditContact: (clientId: string, contact: Contact) => void;
    onDeleteContact: (clientId: string, contactId: string) => void;
    currentUser: User;
}

const CrmView: React.FC<CrmViewProps> = (props) => {
    const { clients, tenders, onAddClient, onEditClient, onUpdateClient, ...restProps } = props;
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('All');
    const [categoryFilter, setCategoryFilter] = useState<string>('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [isAiSummaryModalOpen, setIsAiSummaryModalOpen] = useState(false);

    const categories = useMemo(() => ['All', ...Array.from(new Set(clients.map(c => c.category)))], [clients]);

    const filteredClients = useMemo(() => {
        const lowercasedTerm = searchTerm.toLowerCase();
        return clients.filter(client => 
            (statusFilter === 'All' || client.status === statusFilter) &&
            (categoryFilter === 'All' || client.category === categoryFilter) &&
            (!lowercasedTerm || 
                client.name.toLowerCase().includes(lowercasedTerm) ||
                client.industry.toLowerCase().includes(lowercasedTerm) ||
                client.category.toLowerCase().includes(lowercasedTerm)
            )
        );
    }, [clients, statusFilter, categoryFilter, searchTerm]);
    
    const handleUpdateAndSelectClient = useCallback((updatedClientData: Client) => {
        onUpdateClient(updatedClientData);
        setSelectedClient(prev => ({...(prev as Client), ...updatedClientData}));
    }, [onUpdateClient]);


    if (selectedClient) {
        // Find the most recent version of the client from the main state
        const currentClientState = clients.find(c => c.id === selectedClient.id) || selectedClient;
        const clientTenders = tenders.filter(t => t.clientId === selectedClient.id);
        return (
            <>
                <ClientDetailView 
                    client={currentClientState} 
                    tenders={tenders}
                    onBack={() => setSelectedClient(null)} 
                    onUpdateClient={handleUpdateAndSelectClient}
                    onOpenAiSummary={() => setIsAiSummaryModalOpen(true)}
                    {...restProps}
                />
                {isAiSummaryModalOpen && (
                    <AiClientSummaryModal 
                        client={currentClientState}
                        tenders={clientTenders}
                        onClose={() => setIsAiSummaryModalOpen(false)}
                    />
                )}
            </>
        );
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-4">
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Client Directory</h3>
                    <div>
                       <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-white dark:bg-slate-700 text-base font-semibold text-slate-600 dark:text-slate-200 rounded-md px-3 py-2 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                           <option value="All">All Statuses</option>
                           {Object.values(ClientStatus).map(s => <option key={s} value={s}>{s}</option>)}
                       </select>
                    </div>
                     <div>
                       <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="bg-white dark:bg-slate-700 text-base font-semibold text-slate-600 dark:text-slate-200 rounded-md px-3 py-2 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                           <option value="All">All Categories</option>
                           {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                    </div>
                     <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search clients..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-slate-100 dark:bg-slate-700 rounded-lg pl-10 pr-4 py-2 w-64 text-base text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                        />
                    </div>
                </div>
                <button onClick={onAddClient} className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm text-base">
                    Add New Client
                </button>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-base text-left text-slate-500 dark:text-slate-400">
                    <thead className="text-sm text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                        <tr>
                            <th scope="col" className="px-6 py-3">Client Name</th>
                            <th scope="col" className="px-6 py-3">Category</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Primary Contact</th>
                            <th scope="col" className="px-6 py-3 text-right">Potential Value</th>
                            <th scope="col" className="px-6 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredClients.map((client) => {
                            const primaryContact = client.contacts.find(c => c.isPrimary);
                            return (
                                <tr key={client.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <th scope="row" className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">{client.name}</th>
                                    <td className="px-6 py-4">{client.category}</td>
                                    <td className="px-6 py-4"><span className={getClientStatusBadgeClass(client.status)}>{client.status}</span></td>
                                    <td className="px-6 py-4">{primaryContact?.name || 'N/A'}</td>
                                    <td className="px-6 py-4 text-right font-mono text-slate-800 dark:text-slate-200">{client.potentialValue ? formatCurrency(client.potentialValue) : '-'}</td>
                                    <td className="px-6 py-4 text-center space-x-2">
                                        <button onClick={() => setSelectedClient(client)} className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">View</button>
                                        <button onClick={() => onEditClient(client)} className="font-medium text-slate-600 dark:text-slate-400 hover:underline">Edit</button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CrmView;