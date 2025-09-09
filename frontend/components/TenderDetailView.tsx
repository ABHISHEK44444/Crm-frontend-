import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Document, Page } from 'react-pdf';
// Fix: Removed unused and undefined 'SecurityDeposit' type which is not exported from '../types'.
import { Tender, TenderStatus, User, Role, ChecklistItem, EMD, PBG, TenderFee, BidWorkflowStage, OEM, TenderDocument, TenderDocumentType, Product, AssignmentStatus, AssignmentResponse, FinancialRequest, FinancialRequestType, FinancialRequestStatus } from '../types';
import { SparklesIcon, UploadCloudIcon, TrashIcon, ExternalLinkIcon, FileTextIcon, PackageIcon, CurrencyDollarIcon, GitBranchIcon, AlertTriangleIcon, PencilIcon, DownloadIcon, ArrowLeftIcon, CheckCircleIcon, SaveIcon } from '../constants';
import WorkflowStepper from './WorkflowStepper';
import WorkflowChecklist from './WorkflowChecklist';
import { getTenderStatusBadgeClass, formatCurrency, getAssignmentStatusBadgeClass, toDatetimeLocal, openUrlInNewTab, getFinancialRequestStatusBadgeClass } from '../utils/formatting';
import AssignmentResponseModal from './AssignmentResponseModal';


interface TenderDetailViewProps {
    tender: Tender;
    onBack: () => void;
    onAnalyze: (tender: Tender) => void;
    onEligibilityCheck: (tender: Tender) => void;
    currentUser: User;
    users: User[];
    onUpdateTender: (tender: Tender) => Promise<void>;
    onAssignmentResponse: (tenderId: string, status: AssignmentStatus, notes: string) => void;
    oems: OEM[];
    products: Product[];
    financialRequests: FinancialRequest[];
    onGenerateDocument: (tender: Tender) => void;
    onFinancialRequest: (tenderId: string) => void;
    onPrepareBidPacket: (tender: Tender) => void;
    onTrackProcess: (tender: Tender) => void;
    highlightReason?: string;
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

const InfoRow: React.FC<{label: string, value: React.ReactNode}> = ({ label, value }) => (
    <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="font-semibold text-gray-800 dark:text-gray-200">{value || 'N/A'}</p>
    </div>
);

interface EditableFieldProps {
    label: string,
    name: keyof Tender,
    value: any,
    isEditing: boolean,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void,
    type?: string,
    displayFormatter?: (value: any) => React.ReactNode,
    editFormatter?: (value: any) => string,
    className?: string,
    options?: { label: string; value: string }[];
}

const EditableField: React.FC<EditableFieldProps> = ({ label, name, value, isEditing, onChange, type = 'text', displayFormatter, editFormatter, className='', options }) => {
    const commonInputClass = "mt-1 w-full bg-white dark:bg-slate-700 rounded-md p-1.5 text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition border border-gray-300 dark:border-[#30363d]";

    return (
        <div className={className}>
            <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
            {isEditing ? (
                options ? (
                    <select
                        name={name}
                        value={value === undefined ? '' : String(value)}
                        onChange={onChange}
                        className={commonInputClass}
                    >
                        <option value="">N/A</option>
                        {options.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                ) : type === 'textarea' ? (
                     <textarea
                        name={name}
                        value={editFormatter ? editFormatter(value) : value || ''}
                        onChange={onChange}
                        rows={4}
                        className={commonInputClass}
                    />
                ) : (
                    <input
                        type={type}
                        name={name}
                        value={editFormatter ? editFormatter(value) : value || ''}
                        onChange={onChange}
                        className={commonInputClass}
                    />
                )
            ) : (
                <div className="font-semibold text-gray-800 dark:text-gray-200">
                    {displayFormatter ? displayFormatter(value) : (value || 'N/A')}
                </div>
            )}
        </div>
    );
};


// Fix: Removed unused and undefined 'SecurityDeposit' type from props.
interface FinancialCardProps {
    title: string;
    data?: EMD | PBG | TenderFee;
    pendingRequest?: FinancialRequest;
    fallbackAmount?: number;
    children?: React.ReactNode;
}

const FinancialCard: React.FC<FinancialCardProps> = ({ title, data, pendingRequest, fallbackAmount, children }) => {
    if (!data?.amount && !pendingRequest && !fallbackAmount) return null;
    
    if (data && typeof data.amount === 'number' && !isNaN(data.amount)) {
        const formatDate = (dateString?: string) => dateString ? new Date(dateString).toLocaleDateString('en-IN') : undefined;
        const typedData: any = data;
        const isEmd = title.includes('EMD');
        const isPbg = title.includes('PBG');

        return (
            <div className="bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-[#30363d] rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{title}</h4>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                    <InfoRow label="Amount" value={formatCurrency(data.amount)} />
                    <InfoRow label="Mode" value={typedData.mode} />
                    <InfoRow label="Submission Date" value={formatDate(typedData.submittedDate)} />
                    {(isEmd || isPbg) && <InfoRow label="Expiry Date" value={formatDate(typedData.expiryDate)} />}
                    {isEmd && <InfoRow label="Refund Status" value={typedData.refundStatus} />}
                    {isPbg && <InfoRow label="Issuing Bank" value={typedData.issuingBank} />}
                    {isPbg && <InfoRow label="Status" value={typedData.status} />}
                </div>
                {children}
            </div>
        );
    }

    if (pendingRequest) {
        return (
            <div className="bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-[#30363d] rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{title}</h4>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                    <InfoRow label="Amount" value={formatCurrency(pendingRequest.amount)} />
                    <InfoRow label="Status" value={<span className={`px-2 py-0.5 text-xs rounded-full ${getFinancialRequestStatusBadgeClass(pendingRequest.status)}`}>{pendingRequest.status}</span>} />
                    <InfoRow label="Requested" value={new Date(pendingRequest.requestDate).toLocaleDateString('en-IN')} />
                </div>
                {children}
            </div>
        );
    }

    const amountToDisplay = (title.includes('EMD') && fallbackAmount) ? fallbackAmount : undefined;
    if (!amountToDisplay) return null;

    return (
        <div className="bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-[#30363d] rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{title}</h4>
            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                <InfoRow label="Amount" value={amountToDisplay ? formatCurrency(amountToDisplay) : 'N/A'} />
                <InfoRow label="Status" value="Not Requested" />
            </div>
            {children}
        </div>
    );
};


const TenderDetailView: React.FC<TenderDetailViewProps> = ({ tender, onBack, onAnalyze, onEligibilityCheck, currentUser, onUpdateTender, onAssignmentResponse, oems, products, onGenerateDocument, onFinancialRequest, onPrepareBidPacket, onTrackProcess, highlightReason, users, financialRequests }) => {
    const userMap = useMemo(() => new Map((users || []).map(u => [u.id, u])), [users]);
    const canManageAssignments = currentUser.role === Role.Admin;

    const [isEditing, setIsEditing] = useState(false);
    const [editableTender, setEditableTender] = useState<Tender>(tender);
    const [isEditingAssignment, setIsEditingAssignment] = useState(false);
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>(tender.assignedTo || []);
    const [selectedDocument, setSelectedDocument] = useState<TenderDocument | null>(null);
    const [deletingDoc, setDeletingDoc] = useState<TenderDocument | null>(null);
    const [assignmentResponseData, setAssignmentResponseData] = useState<{ status: AssignmentStatus } | null>(null);
    const [isReassigning, setIsReassigning] = useState(false); // For scrolling
    const assignmentSectionRef = useRef<HTMLDivElement>(null);
    const [isHighlighted, setIsHighlighted] = useState(false);

    const [numPages, setNumPages] = useState<number | null>(null);
    const pdfContainerRef = useRef<HTMLDivElement>(null);
    const [pdfContainerWidth, setPdfContainerWidth] = useState(0);

    const [newDocumentFile, setNewDocumentFile] = useState<File | null>(null);
    const [newDocumentType, setNewDocumentType] = useState<TenderDocumentType>(TenderDocumentType.Other);

    const linkedProduct = useMemo(() => products.find(p => p.id === tender.productId), [products, tender.productId]);

    const financialCards = useMemo(() => {
        const cards = [];
        const processedTypes = new Set<string>();

        // 1. Render all processed items from the tender object
        if (tender.tenderFee?.amount) {
            cards.push(<FinancialCard key="tender-fee" title="Tender Fee" data={tender.tenderFee} />);
            processedTypes.add(FinancialRequestType.TenderFee);
        }
        (tender.emds || []).forEach(emd => {
            cards.push(<FinancialCard key={emd.requestId || emd.submittedDate} title={`Earnest Money Deposit (${emd.mode})`} data={{ ...emd, type: 'EMD' }} />);
            // Normalize type for lookup
            const requestType = `EMD ${emd.mode}` as FinancialRequestType;
            processedTypes.add(requestType);
        });
        (tender.pbgs || []).forEach(pbg => {
            cards.push(<FinancialCard key={pbg.requestId || pbg.submittedDate} title="Performance Bank Guarantee (PBG)" data={{ ...pbg, type: 'PBG' }} />);
            processedTypes.add(FinancialRequestType.PBG);
        });

        // 2. Find and render the latest pending request for any type NOT yet processed
        const relevantRequests = (financialRequests || [])
            .filter(r => r.tenderId === tender.id && ![FinancialRequestStatus.Processed, FinancialRequestStatus.Declined, FinancialRequestStatus.Refunded, FinancialRequestStatus.Released, FinancialRequestStatus.Forfeited, FinancialRequestStatus.Expired].includes(r.status));
        
        const latestPendingByType = new Map<FinancialRequestType, FinancialRequest>();
        relevantRequests.forEach(req => {
            const existing = latestPendingByType.get(req.type);
            if (!existing || new Date(req.requestDate) > new Date(existing.requestDate)) {
                latestPendingByType.set(req.type, req);
            }
        });

        latestPendingByType.forEach((req, type) => {
            if (!processedTypes.has(type)) {
                cards.push(<FinancialCard key={req.id} title={req.type} pendingRequest={req} />);
            }
        });
        
        // 3. Fallback for EMD if nothing else is present
        const hasAnyEmd = cards.some(c => c.props.title.includes('EMD'));
        if (!hasAnyEmd && tender.emdAmount) {
             cards.push(<FinancialCard key="emd-fallback" title="Earnest Money Deposit (EMD)" fallbackAmount={tender.emdAmount} />);
        }

        return cards;

    }, [tender, financialRequests]);


    useEffect(() => {
        if (!isEditing) {
            setEditableTender(tender);
        }
    }, [tender, isEditing]);


    const handleTenderDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const numberFields = ['value', 'totalQuantity', 'pastExperienceYears', 'emdAmount', 'epbgPercentage', 'epbgDuration', 'cost', 'amountPaid', 'liquidatedDamages'];
        const dateFields = ['deadline', 'openingDate'];
        
        let processedValue: any = value;

        if (name === 'isBidToRaEnabled' || name === 'mseExemption' || name === 'startupExemption') {
            processedValue = value === '' ? undefined : value === 'true';
        } else if (numberFields.includes(name)) {
            processedValue = value === '' ? undefined : Number(value);
        } else if (dateFields.includes(name)) {
            processedValue = value ? new Date(value).toISOString() : undefined;
        }
        
        setEditableTender(prev => ({
            ...prev,
            [name]: processedValue
        }));
    };

    const handleSave = async () => {
        const newHistoryEntry = {
            userId: currentUser.id,
            user: currentUser.name,
            action: 'Updated Tender Details',
            timestamp: new Date().toISOString(),
        };
        const tenderToUpdate = { ...editableTender, history: [...(tender.history || []), newHistoryEntry] };

        // Optimistically exit edit mode to make the UI feel fast
        setIsEditing(false);

        try {
            await onUpdateTender(tenderToUpdate);
            // If successful, the parent state is already updated.
        } catch (error) {
            console.error("Failed to save tender, reverting UI.", error);
            // The parent component (App.tsx) handles the data revert and alert.
            // Re-enter edit mode so the user can see their changes and try again.
            setEditableTender(tenderToUpdate); // Keep user's changes in the form
            setIsEditing(true);
        }
    };

    const handleCancel = () => {
        setEditableTender(tender);
        setIsEditing(false);
    };

    const ALL_STAGES = Object.values(BidWorkflowStage);
    const handleAdvanceStage = () => {
        const currentStageIndex = ALL_STAGES.indexOf(tender.workflowStage);
        if (currentStageIndex < ALL_STAGES.length - 1) {
            const nextStage = ALL_STAGES[currentStageIndex + 1];
            const newHistoryEntry = {
                userId: currentUser.id,
                user: currentUser.name,
                action: 'Advanced Workflow Stage',
                timestamp: new Date().toISOString(),
                details: `Stage advanced from ${tender.workflowStage} to ${nextStage}.`
            };
            onUpdateTender({ ...tender, workflowStage: nextStage, history: [...(tender.history || []), newHistoryEntry] });
        }
    };

    const handleGoBackStage = () => {
        const currentStageIndex = ALL_STAGES.indexOf(tender.workflowStage);
        if (currentStageIndex > 0) {
            const previousStage = ALL_STAGES[currentStageIndex - 1];
            const newHistoryEntry = {
                userId: currentUser.id,
                user: currentUser.name,
                action: 'Reverted Workflow Stage',
                timestamp: new Date().toISOString(),
                details: `Stage reverted from ${tender.workflowStage} to ${previousStage}.`
            };
            onUpdateTender({ ...tender, workflowStage: previousStage, history: [...(tender.history || []), newHistoryEntry] });
        }
    };


    useEffect(() => {
        if (highlightReason === 'notification') {
            setIsHighlighted(true);
            const timer = setTimeout(() => setIsHighlighted(false), 4000);
            return () => clearTimeout(timer);
        }
    }, [highlightReason]);

    useEffect(() => {
        const updateWidth = () => {
            if (pdfContainerRef.current) {
                setPdfContainerWidth(pdfContainerRef.current.clientWidth);
            }
        };
        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    useEffect(() => {
        const docs = tender.documents || [];
        if (docs.length > 0) {
            const sortedDocs = [...docs].sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
            
            const currentSelectionIsValid = selectedDocument && docs.some(d => d.id === selectedDocument.id);
            
            if (!currentSelectionIsValid) {
                setSelectedDocument(sortedDocs[0]);
            }
        } else {
            setSelectedDocument(null);
        }
    }, [tender.documents, selectedDocument]);
    
    useEffect(() => {
        setNumPages(null);
    }, [selectedDocument]);

    useEffect(() => {
        if (isReassigning) {
            assignmentSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setIsReassigning(false);
        }
    }, [isReassigning]);
    
    const oemName = useMemo(() => oems.find(o => o.id === tender.oemId)?.name, [oems, tender.oemId]);
    
    const handleAssignmentSave = () => {
        const originalUsers = new Set(tender.assignedTo || []);
        const newUsers = new Set(selectedUserIds);

        const addedIds = selectedUserIds.filter(id => !originalUsers.has(id));
        const removedIds = (tender.assignedTo || []).filter(id => !newUsers.has(id));

        const addedNames = addedIds.map(id => userMap.get(id)?.name).filter(Boolean);
        const removedNames = removedIds.map(id => userMap.get(id)?.name).filter(Boolean);

        let details = '';
        if (addedNames.length > 0) details += `Assigned: ${addedNames.join(', ')}. `;
        if (removedNames.length > 0) details += `Unassigned: ${removedNames.join(', ')}.`;

        const newHistoryEntry = {
            userId: currentUser.id,
            user: currentUser.name,
            action: 'Updated Assignment',
            timestamp: new Date().toISOString(),
            details: details.trim() || 'No changes to assignment.'
        };

        const newResponses = { ...(tender.assignmentResponses || {}) };
        addedIds.forEach(id => {
            newResponses[id] = { status: AssignmentStatus.Pending };
        });
        removedIds.forEach(id => {
            delete newResponses[id];
        });

        const updatedTender = {
            ...tender,
            assignedTo: selectedUserIds,
            assignmentResponses: newResponses,
            history: [...(tender.history || []), newHistoryEntry]
        };

        onUpdateTender(updatedTender);
        setIsEditingAssignment(false);
    };

    const handleStatusChange = (newStatus: TenderStatus) => {
        if (tender.status === newStatus) return;

        const newHistoryEntry = {
            userId: currentUser.id,
            user: currentUser.name,
            action: 'Changed Tender Status',
            timestamp: new Date().toISOString(),
            details: `Status changed from ${tender.status} to ${newStatus}.`
        };

        onUpdateTender({ ...tender, status: newStatus, history: [...(tender.history || []), newHistoryEntry] });
    };

    const handleDeleteDocument = (documentId: string) => {
        const docToDelete = tender.documents?.find(d => d.id === documentId);
        if (docToDelete) {
          setDeletingDoc(docToDelete);
        }
    };

    const confirmDelete = () => {
        if (!deletingDoc) return;

        const updatedDocuments = (tender.documents || []).filter(doc => doc.id !== deletingDoc.id);

        const newHistoryEntry = {
            userId: currentUser.id,
            user: currentUser.name,
            action: 'Deleted Document',
            timestamp: new Date().toISOString(),
            details: `Removed document: ${deletingDoc.name}`
        };

        const updatedTender = {
            ...tender,
            documents: updatedDocuments,
            history: [...(tender.history || []), newHistoryEntry]
        };
        
        if (selectedDocument?.id === deletingDoc.id) {
            setSelectedDocument(null);
        }

        onUpdateTender(updatedTender);
        setDeletingDoc(null);
    };

    const handleAssignmentResponseClick = (status: AssignmentStatus, notes: string) => {
        onAssignmentResponse(tender.id, status, notes);
        setAssignmentResponseData(null);
    };

    const handleReassignClick = () => {
        setIsEditingAssignment(true);
        setIsReassigning(true);
    };

    const handleFileUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setNewDocumentFile(e.target.files[0]);
        }
    };
    
    const handleAddDocument = () => {
        if (!newDocumentFile) return;
    
        const reader = new FileReader();
        reader.onloadend = () => {
            const newDoc: TenderDocument = {
                id: `doc${Date.now()}`,
                name: newDocumentFile.name,
                url: reader.result as string,
                type: newDocumentType,
                mimeType: newDocumentFile.type,
                uploadedAt: new Date().toISOString(),
                uploadedById: currentUser.id,
            };
    
            const newHistoryEntry = {
                userId: currentUser.id,
                user: currentUser.name,
                action: 'Uploaded Document',
                timestamp: new Date().toISOString(),
                details: `Uploaded ${newDocumentType}: ${newDocumentFile.name}`
            };
    
            const updatedTender = {
                ...tender,
                documents: [...(tender.documents || []), newDoc],
                history: [...(tender.history || []), newHistoryEntry],
            };
    
            onUpdateTender(updatedTender);
            setNewDocumentFile(null);
            setNewDocumentType(TenderDocumentType.Other);
            const fileInput = document.getElementById('file-upload-detail') as HTMLInputElement;
            if(fileInput) fileInput.value = '';
        };
        reader.readAsDataURL(newDocumentFile);
    };
    
    const isAssignedToCurrentUser = (tender.assignedTo || []).includes(currentUser.id);
    const currentUserResponseStatus = tender.assignmentResponses?.[currentUser.id]?.status;

    const renderDocumentPreview = () => {
        if (!selectedDocument) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <UploadCloudIcon className="w-16 h-16" />
                    <p className="mt-2 font-semibold">No Document Selected</p>
                    <p className="text-sm">Upload or select a document to view.</p>
                </div>
            );
        }

        if (selectedDocument.mimeType === 'application/pdf') {
            return (
                <Document
                    file={selectedDocument.url}
                    onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                    error={<div className="text-center text-red-500 p-4">Failed to load PDF file. It might be corrupted or in an unsupported format.</div>}
                >
                    {Array.from(new Array(numPages || 0), (el, index) => (
                        <Page key={`page_${index + 1}`} pageNumber={index + 1} width={pdfContainerWidth} className="mb-2" />
                    ))}
                </Document>
            );
        }

        if (selectedDocument.mimeType.startsWith('image/')) {
            return <img src={selectedDocument.url} alt={selectedDocument.name} className="w-full h-full object-contain" />;
        }

        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 bg-gray-50 dark:bg-[#0d1117] rounded-md p-4">
                <FileTextIcon className="w-24 h-24 text-gray-400" />
                <p className="mt-4 font-semibold text-lg text-gray-700 dark:text-gray-300 truncate max-w-full px-4">{selectedDocument.name}</p>
                <p className="mt-1 text-sm">Preview not available for this file type.</p>
                <a
                    href={selectedDocument.url}
                    download={selectedDocument.name}
                    className="mt-6 inline-flex items-center space-x-2 px-6 py-3 bg-cyan-500 text-white text-base font-semibold rounded-lg hover:bg-cyan-600 transition-colors shadow"
                >
                    <DownloadIcon className="w-5 h-5" />
                    <span>Download File</span>
                </a>
            </div>
        );
    };

    const responses = Object.values(tender.assignmentResponses || {});
    const hasDeclines = responses.some(r => (r as AssignmentResponse).status === AssignmentStatus.Declined);
    const hasAccepts = responses.some(r => (r as AssignmentResponse).status === AssignmentStatus.Accepted);
    const needsReassignment = hasDeclines && !hasAccepts;

    const tenderForDisplay = isEditing ? editableTender : tender;
    
    const tenderNotices = (tender.documents || []).filter(doc => doc.type === TenderDocumentType.TenderNotice);
    const otherDocuments = (tender.documents || []).filter(doc => doc.type !== TenderDocumentType.TenderNotice);

    const renderDocItem = (doc: TenderDocument) => {
        const uploaderName = userMap.get(doc.uploadedById)?.name || 'System';
        const uploadDate = new Date(doc.uploadedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

        return (
            <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-slate-700">
                <button onClick={() => setSelectedDocument(doc)} className="flex items-center space-x-3 text-left flex-grow truncate">
                    <FileTextIcon className="w-6 h-6 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                    <div className="truncate">
                        <p className="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate">{doc.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{doc.type}</p>
                    </div>
                </button>
                <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-4">
                    <span className="hidden md:inline">{uploaderName}</span>
                    <span className="hidden lg:inline">{uploadDate}</span>
                    <div className="flex items-center space-x-2">
                        <button onClick={() => openUrlInNewTab(doc.url)} title="Open in new tab" className="p-1 hover:text-cyan-400"><ExternalLinkIcon className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteDocument(doc.id)} title="Delete document" className="p-1 hover:text-red-500"><TrashIcon className="w-4 h-4" /></button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="p-8 space-y-8">
                {/* Header */}
                <div className={`transition-all duration-500 ${isHighlighted ? 'p-4 bg-cyan-500/10 rounded-xl' : ''}`}>
                    <button onClick={onBack} className="mb-4 text-sm font-semibold text-cyan-400 hover:underline">
                        &larr; Back to Tender List
                    </button>
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{tenderForDisplay.title}</h2>
                            <p className="text-gray-500 dark:text-gray-400">For {tenderForDisplay.clientName} ({tenderForDisplay.department})</p>
                            <div className="flex items-center space-x-2 mt-2">
                                {tenderForDisplay.jurisdiction && <span className={`${getJurisdictionBadgeClass(tenderForDisplay.jurisdiction)}`}>{tenderForDisplay.jurisdiction}</span>}
                                {tenderForDisplay.source && <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-500/10 text-gray-400 ring-1 ring-inset ring-gray-500/20">Source: {tenderForDisplay.source}</span>}
                            </div>
                        </div>
                         <div className="flex items-center space-x-4 flex-shrink-0">
                            <button onClick={() => onTrackProcess(tender)} className="text-sm bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold px-4 py-2 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600">Track Process</button>
                             <select value={tender.status} onChange={(e) => handleStatusChange(e.target.value as TenderStatus)} className={`${getTenderStatusBadgeClass(tender.status)} appearance-none bg-transparent cursor-pointer font-bold text-base border-none focus:ring-2 focus:ring-cyan-500`}>
                                {Object.values(TenderStatus).map(s => <option key={s} value={s} className="bg-white dark:bg-[#161b22] text-gray-800 dark:text-gray-200">{s}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Assignment Banners */}
                {isAssignedToCurrentUser && currentUserResponseStatus === AssignmentStatus.Pending && (
                     <div className="bg-[#fffbeb] dark:bg-yellow-900/20 border-l-4 border-amber-500 p-4 rounded-r-md" role="alert">
                        <h4 className="font-bold text-[#854d0e] dark:text-yellow-200">Action Required</h4>
                        <p className="text-sm text-[#92400e] dark:text-yellow-300 mt-1">You have been assigned to this tender. Please confirm your participation.</p>
                        <div className="mt-4 space-x-3">
                            <button onClick={() => setAssignmentResponseData({ status: AssignmentStatus.Accepted })} className="px-5 py-2 text-sm font-semibold bg-[#28a745] text-white rounded-md hover:bg-green-700 shadow">Accept</button>
                            <button onClick={() => setAssignmentResponseData({ status: AssignmentStatus.Declined })} className="px-5 py-2 text-sm font-semibold bg-[#dc3545] text-white rounded-md hover:bg-red-700 shadow">Decline</button>
                        </div>
                    </div>
                )}
                 {currentUser.role === Role.Admin && needsReassignment && (
                    <div className="bg-orange-50 dark:bg-orange-900/30 border-l-4 border-amber-500 p-4 rounded-r-md" role="alert">
                        <div className="flex"><div className="flex-shrink-0"><AlertTriangleIcon className="h-5 w-5 text-amber-500" aria-hidden="true" /></div><div className="ml-3"><h4 className="font-bold text-orange-800 dark:text-orange-200">Assignment Declined</h4><p className="text-sm text-orange-800 dark:text-orange-300 mt-1">This tender requires re-assignment as one or more users have declined.</p><div className="mt-4"><button onClick={handleReassignClick} className="px-4 py-2 text-sm font-semibold bg-orange-500 text-white rounded-md hover:bg-orange-600 shadow-sm">Re-assign Tender</button></div></div></div>
                    </div>
                )}

                 {/* Workflow */}
                <div className="bg-white dark:bg-[#161b22] border dark:border-[#30363d] rounded-2xl shadow-lg shadow-black/10 dark:shadow-black/20">
                    <div className="p-6 border-b border-gray-200 dark:border-[#30363d]">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Bid Management Workflow</h3>
                    </div>
                    <div className="p-6">
                        <WorkflowStepper tender={tender} onUpdateTender={onUpdateTender} currentUser={currentUser} />
                        <div className="mt-12 flex justify-center items-center space-x-4">
                            <button onClick={handleGoBackStage} className="bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-slate-200 font-semibold px-6 py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors flex items-center space-x-2">
                                <ArrowLeftIcon className="w-5 h-5" />
                                <span>Go Back</span>
                            </button>
                            <button onClick={handleAdvanceStage} className="bg-indigo-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center space-x-2">
                                <CheckCircleIcon className="w-5 h-5" />
                                <span>Mark as Complete &amp; Advance to Next Stage</span>
                            </button>
                        </div>
                    </div>
                </div>


                 {/* Main Grid: Details and Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Key Information */}
                        <div className="bg-white dark:bg-[#161b22] border dark:border-[#30363d] rounded-2xl shadow-lg shadow-black/10 dark:shadow-black/20">
                            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-[#30363d]">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Key Information</h3>
                                {isEditing ? (
                                    <div className="flex items-center space-x-2">
                                        <button onClick={handleCancel} className="text-sm bg-gray-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold px-3 py-1 rounded-md hover:bg-gray-300 dark:hover:bg-slate-600">Cancel</button>
                                        <button 
                                            onClick={handleSave} 
                                            className="flex items-center justify-center space-x-2 text-sm bg-cyan-600 text-white font-semibold px-3 py-1 rounded-lg shadow-sm transition-all duration-200 ease-in-out hover:bg-cyan-500 hover:shadow-lg hover:shadow-cyan-500/30 transform hover:-translate-y-0.5 active:scale-95 active:bg-cyan-700"
                                        >
                                            <SaveIcon className="w-4 h-4" />
                                            <span>Save</span>
                                        </button>
                                    </div>
                                ) : (
                                    <button onClick={() => setIsEditing(true)} className="flex items-center space-x-2 text-sm bg-blue-500/10 text-blue-400 font-semibold px-3 py-1 rounded-lg hover:bg-blue-500/20"><PencilIcon className="w-4 h-4" /><span>Edit</span></button>
                                )}
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
                                    <EditableField label="Tender Value" name="value" value={tenderForDisplay.value} isEditing={isEditing} onChange={handleTenderDataChange} type="number" displayFormatter={(v) => v > 0 ? formatCurrency(v) : 'Not Specified'} />
                                    <EditableField label="Submission Deadline" name="deadline" value={tenderForDisplay.deadline} isEditing={isEditing} onChange={handleTenderDataChange} type="datetime-local" displayFormatter={(v) => new Date(v).toLocaleString('en-IN', {dateStyle: 'short', timeStyle: 'short', hour12: false})} editFormatter={(v) => toDatetimeLocal(v)} />
                                    <EditableField label="Opening Date" name="openingDate" value={tenderForDisplay.openingDate} isEditing={isEditing} onChange={handleTenderDataChange} type="datetime-local" displayFormatter={(v) => v ? new Date(v).toLocaleString('en-IN', {dateStyle: 'short', timeStyle: 'short', hour12: false}) : 'N/A'} editFormatter={(v) => toDatetimeLocal(v)}/>
                                    <EditableField label="Tender ID" name="tenderNumber" value={tenderForDisplay.tenderNumber} isEditing={isEditing} onChange={handleTenderDataChange} displayFormatter={(v) => <span className="font-mono">{v || tenderForDisplay.id}</span>} />
                                    <EditableField label="Total Quantity" name="totalQuantity" value={tenderForDisplay.totalQuantity} isEditing={isEditing} onChange={handleTenderDataChange} type="number" />
                                    <EditableField label="Item Category" name="itemCategory" value={tenderForDisplay.itemCategory} isEditing={isEditing} onChange={handleTenderDataChange} />
                                    <EditableField label="Past Performance" name="pastPerformance" value={tenderForDisplay.pastPerformance} isEditing={isEditing} onChange={handleTenderDataChange} />
                                    <EditableField label="Bid to RA Enabled" name="isBidToRaEnabled" value={tenderForDisplay.isBidToRaEnabled} isEditing={isEditing} onChange={handleTenderDataChange} displayFormatter={(v) => v === true ? 'Yes' : v === false ? 'No' : 'N/A'} options={[{label: 'Yes', value: 'true'}, {label: 'No', value: 'false'}]} />
                                    <EditableField label="Type of Bid" name="bidType" value={tenderForDisplay.bidType} isEditing={isEditing} onChange={handleTenderDataChange} options={[{label: 'Open', value: 'Open'}, {label: 'Limited', value: 'Limited'}, {label: 'Single', value: 'Single'}]} />
                                    <EditableField label="MSE Exemption" name="mseExemption" value={tenderForDisplay.mseExemption} isEditing={isEditing} onChange={handleTenderDataChange} displayFormatter={(v) => v === true ? 'Yes' : v === false ? 'No' : 'N/A'} options={[{label: 'Yes', value: 'true'}, {label: 'No', value: 'false'}]} />
                                    <EditableField label="Startup Exemption" name="startupExemption" value={tenderForDisplay.startupExemption} isEditing={isEditing} onChange={handleTenderDataChange} displayFormatter={(v) => v === true ? 'Yes' : v === false ? 'No' : 'N/A'} options={[{label: 'Yes', value: 'false'}, {label: 'No', value: 'false'}]} />
                                    <div className="md:col-span-3">
                                        <EditableField label="Description" name="description" value={tenderForDisplay.description} isEditing={isEditing} onChange={handleTenderDataChange} type="textarea" displayFormatter={(v) => <p className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">{v}</p>} />
                                    </div>
                                    <div className="md:col-span-3">
                                         <EditableField label="Documents Required from Seller" name="documentsRequired" value={tenderForDisplay.documentsRequired} isEditing={isEditing} onChange={handleTenderDataChange} type="textarea" displayFormatter={(v) => <ul className="list-disc list-inside space-y-1">{v?.split('\n').map((line: string, i: number) => line.trim() ? <li key={i}>{line}</li> : null)}</ul>} />
                                    </div>
                                </div>
                            </div>
                        </div>

                         {/* Financials */}
                        <div className="bg-white dark:bg-[#161b22] border dark:border-[#30363d] rounded-2xl shadow-lg shadow-black/10 dark:shadow-black/20">
                            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-[#30363d]">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Financials</h3>
                                {currentUser.role !== 'Viewer' && <button onClick={() => onFinancialRequest(tender.id)} className="flex items-center space-x-2 text-sm bg-green-500/10 text-green-400 font-semibold px-3 py-1 rounded-lg hover:bg-green-500/20"><CurrencyDollarIcon className="w-4 h-4" /><span>Request Funds</span></button>}
                            </div>
                            <div className="p-6 space-y-4">
                                {financialCards.length > 0 ? financialCards : (
                                    <p className="text-sm text-center text-gray-500 dark:text-gray-400 py-4">No financial items for this tender.</p>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Actions & Checklist */}
                    <div className="space-y-8">
                        {/* AI Actions */}
                        <div className="bg-white dark:bg-[#161b22] border dark:border-[#30363d] rounded-2xl shadow-lg shadow-black/10 dark:shadow-black/20 p-6 space-y-3">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">AI Assistant</h3>
                            <button onClick={() => onAnalyze(tender)} className="w-full flex items-center space-x-3 p-3 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 transition-colors">
                                <SparklesIcon className="w-6 h-6 text-blue-400" />
                                <div>
                                    <span className="font-semibold text-blue-400">Analyze Tender</span>
                                    <p className="text-xs text-blue-400/80">Get AI-powered summary, risks, and success factors.</p>
                                </div>
                            </button>
                            <button onClick={() => onEligibilityCheck(tender)} className="w-full flex items-center space-x-3 p-3 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 transition-colors">
                                <CheckCircleIcon className="w-6 h-6 text-blue-400" />
                                <div>
                                    <span className="font-semibold text-blue-400">Check Eligibility</span>
                                    <p className="text-xs text-blue-400/80">AI checks requirements against company profile.</p>
                                </div>
                            </button>
                        </div>
                        
                        {/* Actions */}
                        <div className="bg-white dark:bg-[#161b22] border dark:border-[#30363d] rounded-2xl shadow-lg shadow-black/10 dark:shadow-black/20 p-6 space-y-3">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Actions</h3>
                             <button onClick={() => onGenerateDocument(tender)} className="w-full flex items-center space-x-3 p-3 bg-gray-500/10 rounded-lg hover:bg-gray-500/20 transition-colors">
                                <FileTextIcon className="w-6 h-6 text-gray-400" />
                                <div>
                                    <span className="font-semibold text-gray-400">Generate Document</span>
                                    <p className="text-xs text-gray-400/80">Create bidding documents from templates.</p>
                                </div>
                            </button>
                             <button onClick={() => onPrepareBidPacket(tender)} className="w-full flex items-center space-x-3 p-3 bg-gray-500/10 rounded-lg hover:bg-gray-500/20 transition-colors">
                                <PackageIcon className="w-6 h-6 text-gray-400" />
                                <div>
                                    <span className="font-semibold text-gray-400">Prepare Bid Packet</span>
                                    <p className="text-xs text-gray-400/80">Consolidate all required documents.</p>
                                </div>
                            </button>
                        </div>

                        {/* Stage Checklist */}
                        <div className="bg-white dark:bg-[#161b22] border dark:border-[#30363d] rounded-2xl shadow-lg shadow-black/10 dark:shadow-black/20 p-6">
                            <WorkflowChecklist tender={tender} currentUser={currentUser} onUpdateTender={onUpdateTender} />
                        </div>
                    </div>
                </div>

                {/* Document Management */}
                <div className="bg-white dark:bg-[#161b22] border dark:border-[#30363d] rounded-2xl shadow-lg shadow-black/10 dark:shadow-black/20">
                     <div className="p-6 border-b border-gray-200 dark:border-[#30363d]">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Tender Documents</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
                        <div className="lg:col-span-3 p-6 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-[#30363d]">
                            <div className="h-[600px] overflow-y-auto bg-gray-100 dark:bg-[#0d1117] rounded-lg" ref={pdfContainerRef}>
                               {renderDocumentPreview()}
                            </div>
                        </div>
                        <div className="lg:col-span-2 p-6">
                             {tenderNotices.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-3">Tender Notice</h4>
                                    <div className="space-y-2">{tenderNotices.map(renderDocItem)}</div>
                                </div>
                            )}

                             {otherDocuments.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-3">Available Documents</h4>
                                    <div className="space-y-2">{otherDocuments.map(renderDocItem)}</div>
                                </div>
                            )}
                            
                            <div className="pt-6 border-t border-gray-200 dark:border-[#30363d]">
                                <h4 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-3">Upload New Document</h4>
                                <div className="space-y-3">
                                    <select value={newDocumentType} onChange={(e) => setNewDocumentType(e.target.value as TenderDocumentType)} className="w-full bg-gray-100 dark:bg-slate-700 rounded-md p-2 text-sm">
                                        {Object.values(TenderDocumentType).map(type => <option key={type} value={type}>{type}</option>)}
                                    </select>
                                    <div className="flex items-center space-x-2">
                                        <label htmlFor="file-upload-detail" className="flex-grow cursor-pointer bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600">
                                            {newDocumentFile ? newDocumentFile.name : 'Choose File'}
                                        </label>
                                        <input id="file-upload-detail" type="file" className="sr-only" onChange={handleFileUploadChange} />
                                    </div>
                                    <button onClick={handleAddDocument} disabled={!newDocumentFile} className="w-full bg-cyan-500 text-white font-semibold py-2 rounded-lg hover:bg-cyan-600 disabled:bg-gray-400 dark:disabled:bg-slate-600">
                                        <UploadCloudIcon className="w-5 h-5 inline-block mr-2"/>
                                        Upload Document
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                 {/* Assignment Section */}
                <div ref={assignmentSectionRef} className="bg-white dark:bg-[#161b22] border dark:border-[#30363d] rounded-2xl shadow-lg shadow-black/10 dark:shadow-black/20 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Team Assignment</h3>
                        {canManageAssignments && !isEditingAssignment && <button onClick={() => setIsEditingAssignment(true)} className="flex items-center space-x-2 text-sm bg-blue-500/10 text-blue-400 font-semibold px-3 py-1 rounded-lg hover:bg-blue-500/20"><PencilIcon className="w-4 h-4" /><span>Edit Assignment</span></button>}
                        {isEditingAssignment && (
                             <div className="flex items-center space-x-2">
                                <button onClick={() => {setIsEditingAssignment(false); setSelectedUserIds(tender.assignedTo || [])}} className="text-sm bg-gray-200 dark:bg-slate-700 font-semibold px-3 py-1 rounded-md">Cancel</button>
                                <button onClick={handleAssignmentSave} className="text-sm bg-cyan-500 text-white font-semibold px-3 py-1 rounded-md">Save Assignment</button>
                            </div>
                        )}
                    </div>
                    {isEditingAssignment ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {users.filter(u => u.role === Role.Sales).map(user => (
                                <label key={user.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-slate-700">
                                    <input
                                        type="checkbox"
                                        checked={selectedUserIds.includes(user.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedUserIds([...selectedUserIds, user.id]);
                                            } else {
                                                setSelectedUserIds(selectedUserIds.filter(id => id !== user.id));
                                            }
                                        }}
                                        className="h-4 w-4 rounded border-gray-300 text-cyan-500 focus:ring-cyan-500"
                                    />
                                    <span className="font-medium text-sm text-gray-800 dark:text-gray-200">{user.name}</span>
                                </label>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {(tender.assignedTo || []).length > 0 ? (tender.assignedTo || []).map(id => {
                                const user = userMap.get(id);
                                const response = tender.assignmentResponses?.[id];
                                if (!user) return null;
                                return (
                                    <div key={id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full" />
                                            <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{user.name}</span>
                                        </div>
                                        {response && <span className={getAssignmentStatusBadgeClass(response.status)}>{response.status}</span>}
                                    </div>
                                );
                            }) : <p className="text-sm text-center py-4 text-gray-500">Not assigned to any user.</p>}
                        </div>
                    )}
                </div>

            </div>

             {deletingDoc && (
                 <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={() => setDeletingDoc(null)}>
                    <div className="bg-white dark:bg-[#161b22] rounded-2xl shadow-2xl w-full max-w-md border border-[#30363d]" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Delete Document</h3>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Are you sure you want to delete "{deletingDoc.name}"? This action cannot be undone.</p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-[#0d1117] flex justify-end space-x-3 rounded-b-2xl">
                        <button onClick={() => setDeletingDoc(null)} className="bg-gray-200 dark:bg-[#30363d] text-gray-800 dark:text-gray-200 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-[#444c56]">Cancel</button>
                        <button onClick={confirmDelete} className="bg-red-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-700 shadow-sm">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {assignmentResponseData && (
                <AssignmentResponseModal 
                    initialStatus={assignmentResponseData.status}
                    onClose={() => setAssignmentResponseData(null)}
                    onConfirm={handleAssignmentResponseClick}
                />
            )}
        </>
    );
};

export default TenderDetailView;
