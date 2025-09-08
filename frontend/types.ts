

import React from 'react';

export enum TenderStatus {
  Drafting = 'Drafting',
  Submitted = 'Submitted',
  UnderReview = 'Under Review',
  Won = 'Won',
  Lost = 'Lost',
  Archived = 'Archived',
  Dropped = 'Dropped',
}

export enum Role {
  Admin = 'Admin',
  Sales = 'Sales',
  Finance = 'Finance',
  Viewer = 'Viewer',
}

export enum ClientStatus {
    Active = 'Active',
    Lead = 'Lead',
    Dormant = 'Dormant',
    Lost = 'Lost',
}

export enum BidWorkflowStage {
  Identification = 'Tender Identification',
  Review = 'Tender Review and Shortlisting',
  Preparation = 'Bid Preparation',
  PreBidMeeting = 'Pre-Bid Meeting',
  Submission = 'Bid Submission',
  UnderTechnicalEvaluation = 'Under Technical Evaluation',
  UnderFinancialEvaluation = 'Under Financial Evaluation',
  FollowUp = 'Follow-Up and Clarifications',
  Negotiation = 'Negotiation and Counter Offer',
  LOI_PO = 'Letter of Intent (LOI) / Purchase Order (PO)',
  DeliveryPlanning = 'Project Delivery Planning',
  Delivery = 'Delivery',
  Installation = 'Proof of Testing (POT) / Installation',
  Payment = 'Payment Collection',
  Warranty = 'Warranty Support',
  Complete = 'Complete',
}

export enum ClientAcquisitionSource {
    ColdCalling = 'Cold Calling',
    ExistingCustomer = 'Existing Customer New Enquiries',
    Referral = 'Referrals',
    Telephonic = 'Telephonic Outreach',
    Social = 'Social Platforms',
    Other = 'Other',
}

export type UserStatus = 'Active' | 'Inactive';

export interface Department {
    id: string;
    name: string;
}

export interface Designation {
    id: string;
    name: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: Role;
  avatarUrl: string;
  status: UserStatus;
  department?: string;
  designation?: string;
  specializations?: string[];
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  isPrimary?: boolean;
}

export interface OEM {
    id: string;
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    website?: string;
    area?: string;
    region?: string;
    accountManager?: string;
    accountManagerStatus?: 'Active' | 'Inactive';
}

export interface ClientHistoryLog {
    userId: string;
    user: string;
    action: string;
    timestamp: string;
    details?: string;
}

export interface InteractionLog {
    id: string;
    type: 'Call' | 'Email' | 'Meeting';
    notes: string;
    userId: string;
    user: string;
    timestamp: string;
}

export interface Client {
  id: string;
  name: string;
  industry: string;
  gstin: string;
  revenue: number;
  joinedDate: string;
  contacts: Contact[];
  status: ClientStatus;
  category: string;
  source?: ClientAcquisitionSource;
  notes?: string;
  history?: ClientHistoryLog[];
  potentialValue?: number;
  clientHealth?: 'Excellent' | 'Good' | 'At-Risk';
  interactions?: InteractionLog[];
}

export interface FinancialRecord {
    amount: number;
    mode?: 'DD' | 'BG' | 'Online' | 'Cash' | 'N/A';
    submittedDate?: string;
    documentUrl?: string;
    requestId?: string; // Link back to the FinancialRequest
}

export enum EMDStatus {
    Pending = 'Pending',
    Requested = 'Requested',
    UnderProcess = 'Under Process',
    Refunded = 'Refunded',
    Forfeited = 'Forfeited',
    Expired = 'Expired',
}

export enum PBGStatus {
    Active = 'Active',
    Expired = 'Expired',
    Released = 'Released',
}

export enum PaymentStatus {
    Pending = 'Pending',
    PartiallyPaid = 'Partially Paid',
    Paid = 'Paid',
}

export type FinancialInstrumentStatus = EMDStatus | PBGStatus;

export interface EMD extends FinancialRecord {
    type: 'EMD';
    expiryDate?: string;
    refundStatus: EMDStatus;
}

export interface PBG extends FinancialRecord {
    type: 'PBG';
    issuingBank: string;
    expiryDate: string;
    status: PBGStatus;
}

export interface TenderFee extends FinancialRecord {}

export type FinancialInstrument = EMD | PBG;
export type FinancialInstrumentType = 'emd' | 'pbg' | 'tenderFee';

export interface ChecklistItem {
    id: string;
    text: string;
    completed: boolean;
}

export interface TenderHistoryLog {
    userId: string;
    user: string;
    action: string;
    timestamp: string;
    details?: string;
}

export interface NegotiationDetails {
    initialOffer?: number;
    counterOffer?: number;
    finalPrice?: number;
    notes?: string;
    participatedInRA?: boolean;
    raNotes?: string;
}

export interface Competitor {
    name: string;
    price?: number;
    notes?: string;
}

export interface AppNotification {
    id: string;
    message: string;
    type: 'deadline' | 'expiry' | 'approval' | 'reassignment' | 'assignment';
    relatedTenderId: string;
    timestamp: string;
    recipientId?: string;
    isRead: boolean;
}

export type PDIStatus = 'Not Required' | 'Pending' | 'Complete';

export enum TenderDocumentType {
    TenderNotice = 'Tender Notice',
    Corrigendum = 'Corrigendum',
    TechnicalBid = 'Technical Bid',
    CommercialBid = 'Commercial Bid',
    PurchaseOrder = 'Purchase Order',
    Contract = 'Contract',
    DeliverySchedule = 'Delivery Schedule',
    WarrantyCertificate = 'OEM Warranty Certificate',
    InstallationCertificate = 'Installation Certificate',
    Invoice = 'Invoice',
    ClientSatisfactoryReport = 'Client Satisfactory Report',
    Other = 'Other',
    FinancialRequestAttachment = 'Financial Request Attachment',
    ProductBrochure = 'Product Brochure',
    AuthorizationCertificate = 'Authorization Certificate',
    TechnicalCompliance = 'Technical Compliance',
    CaseStudy = 'Case Study',
    LetterOfAcceptance = 'Letter of Acceptance',
    PBGDocument = 'PBG Document',
    EMDRefundLetter = 'EMD Refund Letter',
}

export interface TenderDocument {
    id: string;
    name: string;
    url: string;
    type: TenderDocumentType;
    mimeType: string;
    uploadedAt: string;
    uploadedById: string; // userId
}

export interface Product {
    id: string;
    name: string;
    documents: TenderDocument[];
}

export enum AssignmentStatus {
    Pending = 'Pending',
    Accepted = 'Accepted',
    Declined = 'Declined',
}

export interface AssignmentResponse {
    status: AssignmentStatus;
    notes?: string;
    respondedAt?: string;
}

export enum PostAwardStage {
    LOI = 'LOI/PO Acknowledgement',
    PBG = 'PBG Submission',
    Contract = 'Contract Signing',
    Kickoff = 'Kick-off Meeting',
    Delivery = 'Delivery & Installation',
    Acceptance = 'Final Acceptance & Sign-off',
    Invoicing = 'Invoicing & Payment',
    Warranty = 'Warranty & Support',
}

export type ProcessStageStatus = 'Pending' | 'In Progress' | 'Completed' | 'Skipped';

export interface ProcessStageLog {
    userId: string;
    userName: string;
    timestamp: string;
    action: string; // e.g., "Status changed to Completed", "Uploaded document: contract.pdf"
}

export interface ProcessStage {
    status: ProcessStageStatus;
    notes: string;
    documents: TenderDocument[];
    history: ProcessStageLog[];
    updatedAt?: string;
    updatedById?: string; // userId
}

export type PostAwardProcess = {
    [key in PostAwardStage]?: ProcessStage;
};


export interface Tender {
  id: string;
  tenderNumber?: string;
  jurisdiction?: string;
  title: string;
  department: string;
  clientName: string;
  clientId: string;
  status: TenderStatus;
  workflowStage: BidWorkflowStage;
  deadline: string;
  openingDate?: string;
  value: number;
  description: string;
  assignedTo?: string[];
  assignmentResponses?: { [userId: string]: AssignmentResponse };
  history?: TenderHistoryLog[];
  checklists?: { [key in BidWorkflowStage]?: ChecklistItem[] };
  tenderFee?: TenderFee;
  emd?: EMD; // Legacy, for backward compatibility
  pbg?: PBG; // Legacy, for backward compatibility
  emds?: EMD[];
  pbgs?: PBG[];
  gemFee?: {
    amount: number;
    status: 'Pending Indent' | 'Indent Raised' | 'Paid';
  };
  totalQuantity?: number;
  itemCategory?: string;
  minAvgTurnover?: string;
  oemAvgTurnover?: string;
  pastExperienceYears?: number;
  epbgPercentage?: number;
  epbgDuration?: number; // in months
  emdAmount?: number;
  source?: string;
  oemId?: string;
  productId?: string;
  // Workflow-specific data
  preBidMeetingNotes?: string;
  contractStatus?: 'Drafting' | 'Signed' | 'Expired';
  paymentStatus?: PaymentStatus;
  negotiationDetails?: NegotiationDetails;
  competitors?: Competitor[];
  cost?: number;
  amountPaid?: number;
  liquidatedDamages?: number;
  reasonForLoss?: 'Price' | 'Technical' | 'Timeline' | 'Relationship' | 'Other';
  reasonForLossNotes?: string;
  pdiStatus?: PDIStatus;
  documents?: TenderDocument[];
  isLOAReceived?: boolean;
  pastPerformance?: string;
  isBidToRaEnabled?: boolean;
  bidType?: 'Open' | 'Limited' | 'Single';
  documentsRequired?: string;
  postAwardProcess?: PostAwardProcess;
  mseExemption?: boolean;
  startupExemption?: boolean;
}

export interface NavItem {
    name: string;
    icon: React.ReactNode;
    view: string;
    roles?: Role[];
}

export interface NewTenderData {
  title: string;
  department: string;
  clientId: string;
  value: number;
  deadline: string;
  description: string;
  source?: string;
}

export interface ImportedTenderData {
  tenderNumber?: string;
  jurisdiction?: string;
  title?: string;
  department?: string;
  clientName?: string;
  deadline?: string;
  openingDate?: string;
  value?: number;
  description?: string;
  emdAmount?: number;
  pbgPercentage?: number;
  totalQuantity?: number;
  itemCategory?: string;
  minAvgTurnover?: string;
  oemAvgTurnover?: string;
  pastExperienceYears?: number;
  epbgPercentage?: number;
  epbgDuration?: number; // in months
  pastPerformance?: string;
  isBidToRaEnabled?: boolean;
  bidType?: 'Open' | 'Limited' | 'Single';
  documentsRequired?: string[];
  mseExemption?: boolean;
  startupExemption?: boolean;
}

export interface NewClientData {
  name: string;
  industry: string;
  gstin: string;
  category: string;
  status: ClientStatus;
  notes?: string;
  potentialValue?: number;
  source?: ClientAcquisitionSource;
}

export interface NewOemData {
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    website?: string;
    area?: string;
    region?: string;
    accountManager?: string;
    accountManagerStatus?: 'Active' | 'Inactive';
}


export interface ContactData {
    name: string;
    role: string;
    email: string;
    phone: string;
    isPrimary: boolean;
}

export interface NewUserData {
    name: string;
    role: Role;
    avatarUrl: string;
    department?: string;
    designation?: string;
    specializations?: string[];
    password?: string;
}

export enum FinancialRequestType {
    EMD_BG = 'EMD BG',
    EMD_DD = 'EMD DD',
    EMD_Online = 'EMD Online',
    PBG = 'PBG',
    TenderFee = 'Tender Fee',
    Other = 'Other',
}

export enum FinancialRequestStatus {
    PendingApproval = 'Pending Approval',
    Approved = 'Approved',
    Declined = 'Declined',
    Processed = 'Processed',
    Refunded = 'Refunded', // For EMD/SD
    Released = 'Released', // For PBG
    Forfeited = 'Forfeited',
    Expired = 'Expired',
}

export interface FinancialRequest {
    id: string;
    tenderId: string;
    type: FinancialRequestType;
    amount: number;
    status: FinancialRequestStatus;
    requestedById: string;
    requestDate: string;
    expiryDate?: string;
    notes?: string;
    approverId?: string;
    approvalDate?: string;
    rejectionReason?: string;
    // Details for the actual instrument once processed
    instrumentDetails?: {
        mode?: 'DD' | 'BG' | 'Online' | 'Cash' | 'N/A';
        processedDate?: string;
        expiryDate?: string;
        issuingBank?: string;
        documentUrl?: string; // Scanned copy of DD/BG etc.
    };
}

// Analytics Types
export interface FunnelData {
  name: BidWorkflowStage;
  count: number;
}

export interface WinLossData {
    name: string; // Could be client name, user name, etc.
    won: number;
    lost: number;
    total: number;
}

export interface SalesLeaderboardData {
    userId: string;
    userName: string;
    avatarUrl: string;
    valueWon: number;
    tendersWon: number;
    winRate: number;
}

export interface BiddingTemplate {
    id: string;
    name: string;
    content: string; // Markdown/text content with placeholders like {{tender.title}}
}

export interface SystemActivityLog {
    id: string;
    timestamp: string;
    user: string; // user name
    userId: string;
    action: string;
    details?: string;
    entityType: 'Tender' | 'Client';
    entityName: string;
    entityId: string;
}

export type StandardProcessState = {
    [key in BidWorkflowStage]?: string[];
};
