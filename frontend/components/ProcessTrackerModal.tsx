

import React, { useState, useMemo } from 'react';
import { Tender, User, PostAwardStage, PostAwardProcess, ProcessStage, ProcessStageStatus, TenderDocument, TenderDocumentType, ProcessStageLog, BidWorkflowStage } from '../types';
import { GitBranchIcon, CheckCircleIcon, UploadCloudIcon, TrashIcon, FileTextIcon, ClipboardListIcon } from '../constants';

const STAGE_STATUS_OPTIONS: ProcessStageStatus[] = ['Pending', 'In Progress', 'Completed', 'Skipped'];

const getStatusBadgeClass = (status: ProcessStageStatus) => {
    switch (status) {
        case 'Completed': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
        case 'In Progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
        case 'Skipped': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        case 'Pending':
        default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
    }
};

interface ProcessTrackerModalProps {
    tender: Tender;
    currentUser: User;
    users: User[];
    onClose: () => void;
    onSave: (tenderId: string, updatedProcess: PostAwardProcess) => void;
}

const ALL_PROCESS_STAGES = Object.values(PostAwardStage);
const ALL_BID_STAGES = Object.values(BidWorkflowStage);

const BiddingWorkflowViewer: React.FC<{ tender: Tender }> = ({ tender }) => {
    const currentStageIndex = ALL_BID_STAGES.indexOf(tender.workflowStage);
    return (
        <ol className="relative border-l border-slate-300 dark:border-slate-700 space-y-4">
            {ALL_BID_STAGES.map((stageName, index) => {
                const isComplete = index < currentStageIndex;
                const isCurrent = index === currentStageIndex;
                const checklist = tender.checklists?.[stageName] || [];

                return (
                    <li key={stageName} className="ml-8">
                        <span className={`absolute -left-4 flex items-center justify-center w-8 h-8 rounded-full ring-8 ring-slate-100 dark:ring-[#0d1117] ${isComplete || isCurrent ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                           {isComplete ? <CheckCircleIcon className="w-5 h-5 text-white" /> : <div className={`w-3 h-3 rounded-full ${isCurrent ? 'bg-white' : 'bg-slate-500 dark:bg-slate-400'}`}></div>}
                        </span>
                         <div className={`p-4 rounded-lg ${isCurrent ? 'bg-white dark:bg-[#161b22] border border-indigo-500/50' : 'bg-slate-100/50 dark:bg-slate-800/30'}`}>
                            <h3 className={`text-lg font-semibold ${isCurrent ? 'text-indigo-600 dark:text-indigo-300' : 'text-slate-800 dark:text-slate-200'}`}>{stageName}</h3>
                            {checklist.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                                    <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Checklist Items</h4>
                                    <ul className="list-inside space-y-1">
                                        {checklist.map(item => (
                                            <li key={item.id} className={`flex items-center text-sm ${item.completed ? 'text-slate-500 line-through' : 'text-slate-700 dark:text-slate-300'}`}>
                                               <CheckCircleIcon className={`w-4 h-4 mr-2 flex-shrink-0 ${item.completed ? 'text-green-500' : 'text-slate-300 dark:text-slate-600'}`} />
                                               <span>{item.text}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                         </div>
                    </li>
                );
            })}
        </ol>
    );
};


const PostAwardTracker: React.FC<ProcessTrackerModalProps> = ({ tender, currentUser, onClose, onSave, users }) => {
    const userMap = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);

    const initialProcessState = useMemo(() => {
        const initialState: PostAwardProcess = { ...tender.postAwardProcess };
        ALL_PROCESS_STAGES.forEach(stage => {
            if (!initialState[stage]) {
                initialState[stage] = {
                    status: 'Pending',
                    notes: '',
                    documents: [],
                    history: []
                };
            }
        });
        return initialState;
    }, [tender.postAwardProcess]);

    const [processState, setProcessState] = useState<PostAwardProcess>(initialProcessState);
    const [activeStage, setActiveStage] = useState<PostAwardStage | null>(null);

     const handleUpdateStage = (stage: PostAwardStage, updatedData: Partial<ProcessStage>) => {
        setProcessState(prev => ({
            ...prev,
            [stage]: {
                ...(prev[stage] as ProcessStage),
                ...updatedData,
                updatedAt: new Date().toISOString(),
                updatedById: currentUser.id,
            }
        }));
    };

    const handleStatusChange = (stage: PostAwardStage, status: ProcessStageStatus) => {
        const oldStatus = processState[stage]?.status;
        if (oldStatus === status) return;

        const log: ProcessStageLog = {
            userId: currentUser.id,
            userName: currentUser.name,
            timestamp: new Date().toISOString(),
            action: `Status changed from ${oldStatus} to ${status}`
        };
        handleUpdateStage(stage, { status, history: [...(processState[stage]?.history || []), log] });
    };

    const handleNotesChange = (stage: PostAwardStage, notes: string) => {
        handleUpdateStage(stage, { notes });
    };

    const handleFileUpload = (stage: PostAwardStage, file: File) => {
        const newDocument: TenderDocument = {
            id: `doc_${Date.now()}`,
            name: file.name,
            url: URL.createObjectURL(file), // This URL is temporary and only valid for the session
            type: TenderDocumentType.Other, // Generic type for process documents
            mimeType: file.type,
            uploadedAt: new Date().toISOString(),
            uploadedById: currentUser.id,
        };
        const log: ProcessStageLog = {
            userId: currentUser.id,
            userName: currentUser.name,
            timestamp: new Date().toISOString(),
            action: `Uploaded document: ${file.name}`
        };
        const currentDocuments = processState[stage]?.documents || [];
        handleUpdateStage(stage, { documents: [...currentDocuments, newDocument], history: [...(processState[stage]?.history || []), log] });
    };

    const handleSave = () => {
        onSave(tender.id, processState);
    };

    return (
        <>
            <div className="p-8 flex-grow overflow-y-auto">
                <ol className="relative border-l border-slate-300 dark:border-slate-700 space-y-10">
                    {ALL_PROCESS_STAGES.map((stageName, index) => {
                        const stageData = processState[stageName]!;
                        const isComplete = stageData.status === 'Completed';
                        const isActive = activeStage === stageName;

                        return (
                            <li key={stageName} className="ml-8">
                                <span className={`absolute -left-4 flex items-center justify-center w-8 h-8 rounded-full ring-8 ring-slate-100 dark:ring-[#0d1117] ${isComplete ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                    {isComplete ? <CheckCircleIcon className="w-5 h-5 text-white" /> : <div className="w-3 h-3 bg-slate-500 dark:bg-slate-400 rounded-full"></div>}
                                </span>
                                <div className="p-4 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-lg shadow-sm">
                                    <div className="flex justify-between items-center cursor-pointer" onClick={() => setActiveStage(isActive ? null : stageName)}>
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{stageName}</h3>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(stageData.status)}`}>{stageData.status}</span>
                                    </div>
                                    {stageData.updatedAt && (
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            Last updated by {userMap.get(stageData.updatedById || '')?.name || 'N/A'} on {new Date(stageData.updatedAt).toLocaleDateString()}
                                        </p>
                                    )}

                                    {isActive && (
                                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-[#30363d] space-y-4">
                                            {/* Status Update */}
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Update Status</label>
                                                <div className="flex space-x-1 bg-slate-200 dark:bg-[#0d1117] p-1 rounded-lg">
                                                    {STAGE_STATUS_OPTIONS.map(opt => (
                                                        <button key={opt} onClick={() => handleStatusChange(stageName, opt)} className={`flex-1 px-3 py-1 text-sm font-semibold rounded-md transition-colors ${stageData.status === opt ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/50'}`}>{opt}</button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Notes */}
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notes</label>
                                                <textarea value={stageData.notes} onChange={(e) => handleNotesChange(stageName, e.target.value)} rows={3} className="w-full bg-slate-100 dark:bg-slate-700 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"></textarea>
                                            </div>

                                            {/* File Upload */}
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Attachments</label>
                                                <div className="space-y-2">
                                                    {stageData.documents.map(doc => (
                                                        <div key={doc.id} className="flex items-center justify-between bg-slate-100 dark:bg-slate-700/50 p-2 rounded-lg">
                                                            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 truncate hover:underline text-sm text-indigo-600 dark:text-indigo-400">
                                                                <FileTextIcon className="w-4 h-4 flex-shrink-0" />
                                                                <span className="truncate">{doc.name}</span>
                                                            </a>
                                                            <button onClick={() => {}} className="p-1 text-slate-500 hover:text-red-600"><TrashIcon className="w-4 h-4" /></button>
                                                        </div>
                                                    ))}
                                                </div>
                                                <label htmlFor={`upload-${index}`} className="mt-2 w-full flex items-center justify-center space-x-2 px-3 py-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700">
                                                    <UploadCloudIcon className="w-5 h-5 text-slate-500 dark:text-slate-300" />
                                                    <span className="text-sm text-slate-600 dark:text-slate-200">Upload File</span>
                                                    <input id={`upload-${index}`} type="file" className="sr-only" onChange={(e) => e.target.files && handleFileUpload(stageName, e.target.files[0])} />
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </li>
                        )
                    })}
                </ol>
            </div>
             <div className="p-4 border-t border-slate-200 dark:border-[#30363d] flex justify-end space-x-3 flex-shrink-0 bg-slate-100 dark:bg-[#0d1117] rounded-b-2xl">
                    <button type="button" onClick={onClose} className="bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold px-4 py-2 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500">Cancel</button>
                    <button type="button" onClick={handleSave} className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 shadow-sm">Save & Close</button>
                </div>
        </>
    );
};


const ProcessTrackerModal: React.FC<ProcessTrackerModalProps> = (props) => {
    const { tender, onClose } = props;
    const isWon = tender.status === 'Won';

    const title = isWon ? 'Post-Award Process Tracker' : 'Bidding Process Overview';
    const description = isWon ? `Manage the post-award lifecycle for: ${tender.title}` : `Review the bidding workflow for: ${tender.title}`;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-slate-100 dark:bg-[#0d1117] rounded-2xl shadow-2xl w-full max-w-5xl h-[95vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-200 dark:border-[#30363d] flex-shrink-0">
                    <div className="flex items-center space-x-3">
                        <GitBranchIcon className="w-6 h-6 text-indigo-500" />
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{title}</h2>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{description}</p>
                </div>
                
                {isWon ? <PostAwardTracker {...props} /> : (
                    <>
                        <div className="p-8 flex-grow overflow-y-auto">
                           <BiddingWorkflowViewer tender={tender} />
                        </div>
                         <div className="p-4 border-t border-slate-200 dark:border-[#30363d] flex justify-end space-x-3 flex-shrink-0 bg-slate-100 dark:bg-[#0d1117] rounded-b-2xl">
                            <button type="button" onClick={onClose} className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 shadow-sm">Close</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};


export default ProcessTrackerModal;