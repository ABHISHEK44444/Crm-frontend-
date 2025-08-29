


import React, { useState } from 'react';
import { Tender, BidWorkflowStage, User, PaymentStatus, NegotiationDetails, Competitor, OEM, PDIStatus, TenderDocumentType, TenderDocument, TenderStatus, EMDStatus, PBG, PBGStatus } from '../types';
import { generateStageChecklist } from '../services/geminiService';
import { SparklesIcon, UploadCloudIcon, PlusCircleIcon, TrashIcon, PackageIcon } from '../constants';
import { formatCurrency, openUrlInNewTab } from '../utils/formatting';

interface WorkflowStageActionsProps {
  tender: Tender;
  currentUser: User;
  onUpdateTender: (tender: Tender) => void;
  oems: OEM[];
  onPrepareBidPacket: (tender: Tender) => void;
}

const ActionCard: React.FC<{title: string, children: React.ReactNode}> = ({ title, children }) => (
    <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">{title}</h3>
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 space-y-4 border border-slate-200 dark:border-slate-700">
            {children}
        </div>
    </div>
);

const StageDocumentUploader: React.FC<{
    tender: Tender;
    currentUser: User;
    onUpdateTender: (tender: Tender) => void;
    documentType: TenderDocumentType;
    label: string;
    allowMultiple?: boolean;
}> = ({ tender, currentUser, onUpdateTender, documentType, label, allowMultiple = false }) => {
    const documents = (tender.documents || []).filter(d => d.type === documentType);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                const documentUrl = event.target?.result as string;
                const newDocument: TenderDocument = {
                    id: `doc${Date.now()}`,
                    name: file.name,
                    url: documentUrl,
                    type: documentType,
                    mimeType: file.type,
                    uploadedAt: new Date().toISOString(),
                    uploadedById: currentUser.id,
                };
    
                const newHistoryEntry = {
                    userId: currentUser.id,
                    user: currentUser.name,
                    action: `Uploaded ${documentType}`,
                    timestamp: new Date().toISOString(),
                    details: `File: ${file.name}`
                };
    
                const existingDocs = tender.documents || [];
                const updatedDocs = allowMultiple
                    ? [...existingDocs, newDocument]
                    : [...existingDocs.filter(d => d.type !== documentType), newDocument];
    
                onUpdateTender({
                    ...tender,
                    documents: updatedDocs,
                    history: [...(tender.history || []), newHistoryEntry]
                });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
            {documents.length > 0 && (
                <div className="space-y-1 mb-2">
                    {documents.map(doc => (
                        <div key={doc.id} className="flex items-center justify-between bg-white dark:bg-slate-600 p-2 rounded-md text-sm">
                            <span className="truncate pr-2">{doc.name}</span>
                            <button onClick={() => openUrlInNewTab(doc.url)} className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex-shrink-0 ml-2">View</button>
                        </div>
                    ))}
                </div>
            )}
            {(allowMultiple || documents.length === 0) && (
                 <label htmlFor={`file-upload-${documentType}`} className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-500">
                    <UploadCloudIcon className="w-5 h-5 text-slate-500 dark:text-slate-300"/>
                    <span className="text-sm text-slate-600 dark:text-slate-200">
                        {documents.length > 0 ? 'Upload New Version' : 'Upload Document'}
                    </span>
                    <input id={`file-upload-${documentType}`} type="file" className="sr-only" onChange={handleFileChange} />
                </label>
            )}
        </div>
    );
};


const WorkflowStageActions: React.FC<WorkflowStageActionsProps> = ({ tender, currentUser, onUpdateTender, oems, onPrepareBidPacket }) => {
  const [notes, setNotes] = useState(tender.preBidMeetingNotes || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [negotiationData, setNegotiationData] = useState<NegotiationDetails>(tender.negotiationDetails || {});
  const [competitors, setCompetitors] = useState<Competitor[]>(tender.competitors || []);
  const [projectCost, setProjectCost] = useState<number | undefined>(tender.cost);
  const [liquidatedDamages, setLiquidatedDamages] = useState<number | undefined>(tender.liquidatedDamages);
  const [pbgDetails, setPbgDetails] = useState<Partial<PBG>>({
      amount: tender.pbg?.amount || (tender.epbgPercentage ? (tender.value * (tender.epbgPercentage || 0) / 100) : undefined),
      expiryDate: tender.pbg?.expiryDate || '',
      issuingBank: tender.pbg?.issuingBank || '',
  });

  const handleSaveNotes = () => {
    const newHistoryEntry = {
        userId: currentUser.id,
        user: currentUser.name,
        action: 'Added Pre-Bid Meeting Notes',
        timestamp: new Date().toISOString(),
    };
    onUpdateTender({ ...tender, preBidMeetingNotes: notes, history: [...(tender.history || []), newHistoryEntry] });
  };
  
  const handleGenerateChecklist = async () => {
    setIsGenerating(true);
    const checklistItems = await generateStageChecklist(tender.description, tender.workflowStage);
    const updatedChecklists = {
        ...tender.checklists,
        [tender.workflowStage]: checklistItems
    };
    
    const newHistoryEntry = {
        userId: currentUser.id,
        user: currentUser.name,
        action: `Generated AI Checklist for ${tender.workflowStage}`,
        timestamp: new Date().toISOString(),
        details: `Generated ${checklistItems.length} items.`
    };
    onUpdateTender({ ...tender, checklists: updatedChecklists, history: [...(tender.history || []), newHistoryEntry] });
    setIsGenerating(false);
  };

  const handleNegotiationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setNegotiationData(prev => ({...prev, [name]: name === 'notes' || name === 'raNotes' ? value : Number(value) || undefined }));
  }

  const handleSaveNegotiation = () => {
      const newHistoryEntry = {
        userId: currentUser.id,
        user: currentUser.name,
        action: 'Updated Negotiation Details',
        timestamp: new Date().toISOString(),
    };
    onUpdateTender({ ...tender, negotiationDetails: negotiationData, history: [...(tender.history || []), newHistoryEntry] });
  }
  
  const handlePaymentStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const status = e.target.value as PaymentStatus;
      const newHistoryEntry = {
        userId: currentUser.id,
        user: currentUser.name,
        action: 'Updated Payment Status',
        timestamp: new Date().toISOString(),
        details: `Status changed to ${status}`
    };
    onUpdateTender({ ...tender, paymentStatus: status, history: [...(tender.history || []), newHistoryEntry] });
  };
  
  const handleCompetitorChange = (index: number, field: keyof Competitor, value: string | number) => {
      const newCompetitors = [...competitors];
      (newCompetitors[index] as any)[field] = value;
      setCompetitors(newCompetitors);
  };
  
  const handleAddCompetitor = () => {
      setCompetitors([...competitors, { name: '', price: undefined, notes: '' }]);
  };

  const handleRemoveCompetitor = (index: number) => {
      setCompetitors(competitors.filter((_, i) => i !== index));
  };
  
  const handleSaveCompetitors = () => {
      const newHistoryEntry = {
        userId: currentUser.id,
        user: currentUser.name,
        action: 'Updated Competitor Information',
        timestamp: new Date().toISOString(),
    };
    onUpdateTender({ ...tender, competitors: competitors, history: [...(tender.history || []), newHistoryEntry] });
  };

  const handleSaveCost = () => {
      const newHistoryEntry = {
        userId: currentUser.id,
        user: currentUser.name,
        action: 'Updated Project Cost',
        timestamp: new Date().toISOString(),
        details: `Cost set to ${formatCurrency(projectCost || 0)}`
    };
    onUpdateTender({ ...tender, cost: projectCost, history: [...(tender.history || []), newHistoryEntry] });
  };
  
  const handleSaveLiquidatedDamages = () => {
      const newHistoryEntry = {
        userId: currentUser.id,
        user: currentUser.name,
        action: 'Logged Liquidated Damages',
        timestamp: new Date().toISOString(),
        details: `Amount: ${formatCurrency(liquidatedDamages || 0)}`
    };
    onUpdateTender({ ...tender, liquidatedDamages, history: [...(tender.history || []), newHistoryEntry] });
  };

  const handleLinkOem = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const oemId = e.target.value;
    const oemName = oems.find(o => o.id === oemId)?.name || 'Unknown OEM';
    const newHistoryEntry = {
        userId: currentUser.id,
        user: currentUser.name,
        action: 'Linked OEM',
        timestamp: new Date().toISOString(),
        details: `Linked to ${oemName}.`
    };
    onUpdateTender({ ...tender, oemId, history: [...(tender.history || []), newHistoryEntry] });
  };

  const handleUpdateStatus = (status: TenderStatus) => {
    onUpdateTender({ ...tender, status });
  };
  
  const handleToggleLOA = (received: boolean) => {
      const newHistoryEntry = {
        userId: currentUser.id,
        user: currentUser.name,
        action: `Marked LOI/LOA as ${received ? 'Received' : 'Not Received'}`,
        timestamp: new Date().toISOString(),
      };
      onUpdateTender({ ...tender, isLOAReceived: received, history: [...(tender.history || []), newHistoryEntry] });
  }

  const handlePbgDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setPbgDetails(prev => ({...prev, [name]: name === 'amount' ? Number(value) : value}));
  }

  const handleSavePbg = () => {
    const newPbg: PBG = {
        type: 'PBG',
        status: PBGStatus.Active,
        mode: pbgDetails.mode ?? tender.pbg?.mode ?? 'BG',
        submittedDate: pbgDetails.submittedDate ?? tender.pbg?.submittedDate ?? new Date().toISOString(),
        documentUrl: pbgDetails.documentUrl ?? tender.pbg?.documentUrl,
        amount: pbgDetails.amount ?? tender.pbg?.amount ?? 0,
        issuingBank: pbgDetails.issuingBank ?? tender.pbg?.issuingBank ?? '',
        expiryDate: pbgDetails.expiryDate ?? tender.pbg?.expiryDate ?? '',
    };
     const newHistoryEntry = {
        userId: currentUser.id,
        user: currentUser.name,
        action: 'Updated PBG Details',
        timestamp: new Date().toISOString(),
    };
    onUpdateTender({ ...tender, pbg: newPbg, history: [...(tender.history || []), newHistoryEntry] });
  }

  const handleEmdRefundStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newStatus = e.target.value as EMDStatus;
      if (tender.emd) {
          const updatedEmd = { ...tender.emd, refundStatus: newStatus };
           const newHistoryEntry = {
              userId: currentUser.id,
              user: currentUser.name,
              action: 'Updated EMD Refund Status',
              timestamp: new Date().toISOString(),
              details: `Status changed to ${newStatus}`
          };
          onUpdateTender({ ...tender, emd: updatedEmd, history: [...(tender.history || []), newHistoryEntry] });
      }
  }
  
  const uploaderProps = { tender, currentUser, onUpdateTender };

  const renderActions = () => {
    const hasAiChecklistAction = [
        BidWorkflowStage.Preparation,
        BidWorkflowStage.Submission,
        BidWorkflowStage.DeliveryPlanning,
        BidWorkflowStage.Delivery,
        BidWorkflowStage.Installation,
        BidWorkflowStage.Payment,
        BidWorkflowStage.Warranty,
    ].includes(tender.workflowStage);

    return (
        <div className="space-y-6">
             {(() => {
                switch (tender.workflowStage) {
                    case BidWorkflowStage.Preparation:
                        return (
                            <ActionCard title="Stage Actions">
                                <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Link OEM Partner</label>
                                    <select onChange={handleLinkOem} value={tender.oemId || ''} className="w-full bg-white dark:bg-slate-600 rounded-md p-2">
                                        <option value="">Select OEM</option>
                                        {oems.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                                    </select>
                                </div>
                                <StageDocumentUploader {...uploaderProps} documentType={TenderDocumentType.TechnicalCompliance} label="Technical Compliance" allowMultiple />
                                <StageDocumentUploader {...uploaderProps} documentType={TenderDocumentType.AuthorizationCertificate} label="OEM Authorization Certificate" />
                                <button
                                    onClick={() => onPrepareBidPacket(tender)}
                                    className="w-full mt-2 flex items-center justify-center space-x-2 bg-indigo-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors"
                                >
                                    <PackageIcon className="w-5 h-5" />
                                    <span>Prepare Bid Packet</span>
                                </button>
                                </div>
                            </ActionCard>
                        );
                    case BidWorkflowStage.PreBidMeeting:
                        return (
                             <ActionCard title="Pre-Bid Meeting Notes">
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={5}
                                    className="w-full bg-white dark:bg-slate-600 rounded-md p-2 text-sm"
                                    placeholder="Log queries, clarifications, and key discussion points from the meeting..."
                                />
                                <button onClick={handleSaveNotes} className="w-full bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700">Save Notes</button>
                             </ActionCard>
                        );
                    case BidWorkflowStage.Submission:
                         return (
                            <ActionCard title="Bid Submission">
                                <StageDocumentUploader {...uploaderProps} documentType={TenderDocumentType.TechnicalBid} label="Final Technical Bid" />
                                <StageDocumentUploader {...uploaderProps} documentType={TenderDocumentType.CommercialBid} label="Final Commercial Bid" />
                                {tender.status !== TenderStatus.Submitted && (
                                    <button onClick={() => handleUpdateStatus(TenderStatus.Submitted)} className="w-full bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700">Mark as Submitted</button>
                                )}
                            </ActionCard>
                        );
                    case BidWorkflowStage.UnderTechnicalEvaluation:
                    case BidWorkflowStage.UnderFinancialEvaluation:
                    case BidWorkflowStage.FollowUp:
                    case BidWorkflowStage.Delivery:
                    case BidWorkflowStage.Warranty:
                        return <ActionCard title="Stage Actions"><p className="text-sm text-center text-slate-500">No specific actions for this stage. Please advance when ready.</p></ActionCard>;
                    
                    case BidWorkflowStage.Negotiation:
                         return (
                            <ActionCard title="Negotiation & Competitor Details">
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-slate-800 dark:text-slate-200">Negotiation Details</h4>
                                    <div className="grid grid-cols-3 gap-2">
                                        <input type="number" name="initialOffer" placeholder="Initial Offer" value={negotiationData.initialOffer || ''} onChange={handleNegotiationChange} className="w-full bg-white dark:bg-slate-600 rounded-md p-2 text-sm"/>
                                        <input type="number" name="counterOffer" placeholder="Counter Offer" value={negotiationData.counterOffer || ''} onChange={handleNegotiationChange} className="w-full bg-white dark:bg-slate-600 rounded-md p-2 text-sm"/>
                                        <input type="number" name="finalPrice" placeholder="Final Price" value={negotiationData.finalPrice || ''} onChange={handleNegotiationChange} className="w-full bg-white dark:bg-slate-600 rounded-md p-2 text-sm"/>
                                    </div>
                                    <textarea name="notes" placeholder="Negotiation Notes" value={negotiationData.notes || ''} onChange={handleNegotiationChange} rows={3} className="w-full bg-white dark:bg-slate-600 rounded-md p-2 text-sm" />
                                    <button onClick={handleSaveNegotiation} className="text-xs bg-indigo-600 text-white font-semibold px-3 py-1 rounded-md hover:bg-indigo-700">Save Negotiation</button>
                                </div>
                                 <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-600">
                                    <div className="flex justify-between items-center">
                                       <h4 className="font-semibold text-slate-800 dark:text-slate-200">Competitors</h4>
                                        <button onClick={handleAddCompetitor} className="text-xs font-semibold text-indigo-500 hover:underline"><PlusCircleIcon className="w-4 h-4 inline-block mr-1"/>Add</button>
                                    </div>
                                    {competitors.map((comp, index) => (
                                         <div key={index} className="grid grid-cols-12 gap-2 items-center">
                                            <input type="text" placeholder="Competitor Name" value={comp.name} onChange={(e) => handleCompetitorChange(index, 'name', e.target.value)} className="col-span-5 w-full bg-white dark:bg-slate-600 rounded-md p-2 text-sm"/>
                                            <input type="number" placeholder="Price" value={comp.price || ''} onChange={(e) => handleCompetitorChange(index, 'price', e.target.value)} className="col-span-3 w-full bg-white dark:bg-slate-600 rounded-md p-2 text-sm"/>
                                            <input type="text" placeholder="Notes" value={comp.notes || ''} onChange={(e) => handleCompetitorChange(index, 'notes', e.target.value)} className="col-span-3 w-full bg-white dark:bg-slate-600 rounded-md p-2 text-sm"/>
                                            <button onClick={() => handleRemoveCompetitor(index)} className="col-span-1 text-red-500 hover:text-red-700"><TrashIcon className="w-4 h-4"/></button>
                                         </div>
                                    ))}
                                    {competitors.length > 0 && <button onClick={handleSaveCompetitors} className="text-xs bg-indigo-600 text-white font-semibold px-3 py-1 rounded-md hover:bg-indigo-700">Save Competitors</button>}
                                </div>
                            </ActionCard>
                         );
                    case BidWorkflowStage.LOI_PO:
                        return (
                             <ActionCard title="LOI / PO and PBG">
                                 <div className="flex items-center space-x-4">
                                    <label className="font-medium text-sm">LOI/PO Received?</label>
                                    <button onClick={() => handleToggleLOA(true)} className={`px-3 py-1 text-sm rounded-md ${tender.isLOAReceived ? 'bg-green-600 text-white' : 'bg-slate-200 dark:bg-slate-600'}`}>Yes</button>
                                    <button onClick={() => handleToggleLOA(false)} className={`px-3 py-1 text-sm rounded-md ${!tender.isLOAReceived ? 'bg-red-600 text-white' : 'bg-slate-200 dark:bg-slate-600'}`}>No</button>
                                 </div>
                                <StageDocumentUploader {...uploaderProps} documentType={TenderDocumentType.LetterOfAcceptance} label="LOI / PO Document" />
                                <StageDocumentUploader {...uploaderProps} documentType={TenderDocumentType.Contract} label="Signed Contract" />
                                
                                <div className="pt-4 border-t border-slate-200 dark:border-slate-600 space-y-2">
                                     <h4 className="font-semibold text-slate-800 dark:text-slate-200">PBG Details</h4>
                                      <div className="grid grid-cols-3 gap-2">
                                        <input type="number" name="amount" placeholder="PBG Amount" value={pbgDetails.amount || ''} onChange={handlePbgDetailsChange} className="w-full bg-white dark:bg-slate-600 rounded-md p-2 text-sm"/>
                                        <input type="text" name="issuingBank" placeholder="Issuing Bank" value={pbgDetails.issuingBank || ''} onChange={handlePbgDetailsChange} className="w-full bg-white dark:bg-slate-600 rounded-md p-2 text-sm"/>
                                        <input type="date" name="expiryDate" placeholder="Expiry Date" value={pbgDetails.expiryDate?.split('T')[0] || ''} onChange={handlePbgDetailsChange} className="w-full bg-white dark:bg-slate-600 rounded-md p-2 text-sm"/>
                                     </div>
                                      <button onClick={handleSavePbg} className="text-xs bg-indigo-600 text-white font-semibold px-3 py-1 rounded-md hover:bg-indigo-700">Save PBG</button>
                                </div>
                             </ActionCard>
                        );
                    case BidWorkflowStage.DeliveryPlanning:
                        return (
                             <ActionCard title="Delivery Planning">
                                <StageDocumentUploader {...uploaderProps} documentType={TenderDocumentType.DeliverySchedule} label="Delivery Schedule" />
                             </ActionCard>
                        );
                    case BidWorkflowStage.Installation:
                         return (
                            <ActionCard title="Installation & Testing">
                                <StageDocumentUploader {...uploaderProps} documentType={TenderDocumentType.InstallationCertificate} label="Installation Certificate" />
                            </ActionCard>
                         );
                    case BidWorkflowStage.Payment:
                         return (
                            <ActionCard title="Payment Collection">
                                <StageDocumentUploader {...uploaderProps} documentType={TenderDocumentType.Invoice} label="Invoice" />
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Payment Status</label>
                                    <select value={tender.paymentStatus || ''} onChange={handlePaymentStatusChange} className="w-full bg-white dark:bg-slate-600 rounded-md p-2">
                                        <option value="">Select Status</option>
                                        {Object.values(PaymentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </ActionCard>
                         );
                    case BidWorkflowStage.Complete:
                        return (
                            <ActionCard title="Project Completion">
                                <div className="space-y-4">
                                     <h4 className="font-semibold text-slate-800 dark:text-slate-200">Final Costs</h4>
                                      <div className="grid grid-cols-2 gap-2">
                                        <div><label className="text-xs">Final Project Cost (₹)</label><input type="number" placeholder="Project Cost" value={projectCost || ''} onChange={(e) => setProjectCost(Number(e.target.value))} onBlur={handleSaveCost} className="w-full bg-white dark:bg-slate-600 rounded-md p-2 text-sm"/></div>
                                        <div><label className="text-xs">Liquidated Damages (₹)</label><input type="number" placeholder="LDs (if any)" value={liquidatedDamages || ''} onChange={(e) => setLiquidatedDamages(Number(e.target.value))} onBlur={handleSaveLiquidatedDamages} className="w-full bg-white dark:bg-slate-600 rounded-md p-2 text-sm"/></div>
                                     </div>
                                </div>
                                {tender.emd && (
                                     <div className="pt-4 border-t border-slate-200 dark:border-slate-600">
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">EMD Refund Status</label>
                                        <select value={tender.emd.refundStatus} onChange={handleEmdRefundStatusChange} className="w-full bg-white dark:bg-slate-600 rounded-md p-2">
                                            {Object.values(EMDStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                )}
                            </ActionCard>
                        );
                    default:
                        return null;
                }
            })()}
            {hasAiChecklistAction && (
                <div className="mt-6">
                    <button
                        onClick={handleGenerateChecklist}
                        disabled={isGenerating}
                        className="w-full flex items-center justify-center space-x-2 bg-blue-500/10 text-blue-400 font-semibold px-4 py-2 rounded-lg hover:bg-blue-500/20 transition-colors disabled:opacity-50"
                    >
                        {isGenerating ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div> : <SparklesIcon className="w-5 h-5" />}
                        <span>{isGenerating ? 'Generating...' : 'Generate AI Checklist for this Stage'}</span>
                    </button>
                </div>
            )}
        </div>
    );
  };

  return renderActions();
};

export default WorkflowStageActions;