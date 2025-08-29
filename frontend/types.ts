

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

export enum SDStatus {
    Paid = 'Paid',
    RefundPending = 'Refund Pending',
    Refunded = 'Refunded',
    Forfeited = 'Forfeited',
}

export enum PaymentStatus {
    Pending = 'Pending',
    PartiallyPaid = 'Partially Paid',
    Paid = 'Paid',
}

export type FinancialInstrumentStatus = EMDStatus | PBGStatus | SDStatus;

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

export interface SecurityDeposit extends FinancialRecord {
    type: 'SD';
    expiryDate?: string;
    status: SDStatus;
}

export interface TenderFee extends FinancialRecord {
    type: 'TenderFee';
}

export enum TenderDocumentType {
    TenderNotice = 'Tender Notice',
    TechnicalCompliance = 'Technical Compliance',
    AuthorizationCertificate = 'Authorization Certificate',
    TechnicalBid = 'Technical Bid',
    CommercialBid = 'Commercial Bid',
    LetterOfAcceptance = 'Letter of Acceptance (LOA/LOI)',
    PBGDocument = 'Performance Bank Guarantee (PBG)',
    Contract = 'Contract / Agreement',
    DeliverySchedule = 'Delivery Schedule',
    InstallationCertificate = 'Installation Certificate',
    Invoice = 'Invoice',
    EMDRefundLetter = 'EMD Refund Letter',
    ProductBrochure = 'Product Brochure',
    Other = 'Other',
}

export interface TenderDocument {
    id: string;
    name: string;
    url: string; // Can be a standard URL or a data URL for previews
    type: TenderDocumentType;
    mimeType: string;
    uploadedAt: string;
    uploadedById: string;
}

export interface ChecklistItem {
    id: string;
    text: string;
    completed: boolean;
}

export enum AssignmentStatus {
  Pending = 'Pending',
  Accepted = 'Accepted',
  Declined = 'Declined'
}

export interface AssignmentResponse {
    status: AssignmentStatus;
    notes: string;
    respondedAt: string;
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

export enum PDIStatus {
    Pending = 'Pending',
    Scheduled = 'Scheduled',
    Completed = 'Completed',
    Failed = 'Failed',
}

export interface ProcessStageLog {
    userId: string;
    userName: string;
    timestamp: string;
    action: string;
}
export interface ProcessStage {
    status: ProcessStageStatus;
    notes: string;
    documents: TenderDocument[];
    history: ProcessStageLog[];
    updatedAt?: string;
    updatedById?: string;
}
export type PostAwardProcess = {
    [key in PostAwardStage]?: ProcessStage
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
  assignmentResponses?: Record<string, AssignmentResponse>;
  history?: TenderHistoryLog[];
  checklists?: Record<BidWorkflowStage, ChecklistItem[]>;
  tenderFee?: TenderFee;
  emd?: EMD;
  pbg?: PBG;
  sd?: SecurityDeposit;
  gemFee?: { amount: number, status: 'Paid' | 'Unpaid' };
  totalQuantity?: number;
  itemCategory?: string;
  minAvgTurnover?: string;
  oemAvgTurnover?: string;
  pastExperienceYears?: number;
  epbgPercentage?: number;
  epbgDuration?: number;
  emdAmount?: number;
  source?: string;
  oemId?: string;
  productId?: string;
  preBidMeetingNotes?: string;
  contractStatus?: string;
  paymentStatus?: PaymentStatus;
  negotiationDetails?: NegotiationDetails;
  competitors?: Competitor[];
  cost?: number; // Internal cost for profitability calculation
  amountPaid?: number;
  liquidatedDamages?: number;
  reasonForLoss?: 'Price' | 'Technical' | 'Timeline' | 'Relationship' | 'Other';
  reasonForLossNotes?: string;
  pdiStatus?: PDIStatus;
  documents?: TenderDocument[];
  isLOAReceived?: boolean;
  pastPerformance?: string;
  isBidToRaEnabled?: boolean;
  bidType?: 'Open' | 'Limited';
  documentsRequired?: string;
  postAwardProcess?: PostAwardProcess;
  mseExemption?: boolean;
  startupExemption?: boolean;
}

export type TenderHistoryLog = {
    userId: string;
    user: string;
    action: string;
    timestamp: string;
    details?: string;
};

export interface NewTenderData {
  title: string;
  department: string;
  clientId: string;
  value: number;
  deadline: string;
  description: string;
  source: string;
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

export interface ImportedTenderData {
    tenderNumber?: string;
    jurisdiction?: string;
    title?: string;
    department?: string;
    clientName?: string;
    deadline?: string;
    openingDate?: string;
    value?: number;
    totalQuantity?: number;
    itemCategory?: string;
    minAvgTurnover?: string;
    oemAvgTurnover?: string;
    pastExperienceYears?: number;
    emdAmount?: number;
    tenderFeeAmount?: number;
    epbgPercentage?: number;
    epbgDuration?: number;
    pastPerformance?: string;
    isBidToRaEnabled?: boolean;
    mseExemption?: boolean;
    startupExemption?: boolean;
    bidType?: 'Open' | 'Limited';
    documentsRequired?: string[];
    description?: string;
}

export interface ContactData {
    name: string;
    role: string;
    email: string;
    phone: string;
    isPrimary?: boolean;
}

export interface NewUserData {
    name: string;
    role: Role;
    avatarUrl?: string;
    department?: string;
    designation?: string;
    specializations?: string[];
}

export interface NavItem {
    name: string;
    icon: JSX.Element;
    view: string;
    roles?: Role[];
}

export interface FunnelData {
    name: string;
    count: number;
}

export interface SalesLeaderboardData {
    userId: string;
    userName: string;
    avatarUrl: string;
    valueWon: number;
    tendersWon: number;
    winRate: number;
}

export interface AppNotification {
    id: string;
    message: string;
    type: 'assignment' | 'deadline' | 'reassignment' | 'expiry' | 'approval' | 'system';
    relatedTenderId: string;
    timestamp: string;
    recipientId?: string; // If null/undefined, it's for everyone
    isRead: boolean;
}

export enum FinancialRequestType {
    EMD = 'EMD',
    PBG = 'PBG',
    SD = 'Security Deposit',
    TenderFee = 'Tender Fee',
    Other = 'Other',
}

export enum FinancialRequestStatus {
    PendingApproval = 'Pending Approval',
    Approved = 'Approved',
    Processed = 'Processed',
    Declined = 'Declined',
    Refunded = 'Refunded', // For EMD/SD
    Released = 'Released', // For PBG
}

export interface FinancialRequest {
    id: string;
    tenderId: string;
    type: FinancialRequestType;
    amount: number;
    status: FinancialRequestStatus;
    requestedById: string;
    requestDate: string;
    notes?: string;
    approverId?: string;
    approvalDate?: string;
    rejectionReason?: string;
    expiryDate?: string; // For EMDs/PBGs that require it
    instrumentDetails?: {
        mode: 'DD' | 'BG' | 'Online' | 'Cash' | 'N/A';
        processedDate: string;
        expiryDate?: string;
        issuingBank?: string;
        documentUrl?: string;
    };
}

export interface SystemActivityLog extends ClientHistoryLog {
    id: string;
    entityType: 'Tender' | 'Client' | 'User';
    entityName: string;
    entityId: string;
}

export interface BiddingTemplate {
    id: string;
    name: string;
    content: string;
}

export interface Product {
    id: string;
    name: string;
    documents: TenderDocument[];
}

export enum PostAwardStage {
    OrderAcknowledgement = 'Order Acknowledgement',
    PDI = 'Pre-Dispatch Inspection (PDI)',
    Dispatch = 'Dispatch',
    Delivery = 'Delivery & Receipt',
    Installation = 'Installation & Commissioning',
    Training = 'User Training',
    Acceptance = 'Final Acceptance & Sign-off',
    PaymentProcessing = 'Payment Processing',
    PBGReturn = 'PBG Return',
    ProjectClosure = 'Project Closure',
}

export type ProcessStageStatus = 'Pending' | 'In Progress' | 'Completed' | 'Skipped';

export type StandardProcessState = {
    [key in BidWorkflowStage]?: string[]; // Array of completed checklist item IDs
};

export type NewOemData = Omit<OEM, 'id'>;