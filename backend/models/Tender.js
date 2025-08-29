import mongoose from 'mongoose';

const historyLogSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  user: { type: String, required: true },
  action: { type: String, required: true },
  timestamp: { type: Date, required: true },
  details: { type: String },
});

const financialRecordSchema = new mongoose.Schema({
    amount: { type: Number },
    mode: { type: String, enum: ['DD', 'BG', 'Online', 'Cash', 'N/A'] },
    submittedDate: { type: Date },
    documentUrl: { type: String },
});

const assignmentResponseSchema = new mongoose.Schema({
    status: { type: String, enum: ['Pending', 'Accepted', 'Declined'], required: true },
    notes: { type: String },
    respondedAt: { type: Date },
});

const checklistItemSchema = new mongoose.Schema({
    id: String,
    text: String,
    completed: Boolean,
});

const negotiationDetailsSchema = new mongoose.Schema({
    initialOffer: Number,
    counterOffer: Number,
    finalPrice: Number,
    notes: String,
    participatedInRA: Boolean,
    raNotes: String,
});

const competitorSchema = new mongoose.Schema({
    name: String,
    price: Number,
    notes: String,
});

const tenderDocumentSchema = new mongoose.Schema({
    id: String,
    name: String,
    url: String, 
    type: String,
    mimeType: String,
    uploadedAt: Date,
    uploadedById: String,
});

const processStageLogSchema = new mongoose.Schema({
    userId: String,
    userName: String,
    timestamp: Date,
    action: String,
});

const processStageSchema = new mongoose.Schema({
    status: String,
    notes: String,
    documents: [tenderDocumentSchema],
    history: [processStageLogSchema],
    updatedAt: Date,
    updatedById: String,
});

const tenderSchema = new mongoose.Schema({
    id: { type: String, unique: true }, 
    tenderNumber: { type: String },
    jurisdiction: { type: String },
    title: { type: String, required: true },
    department: { type: String, required: true },
    clientName: { type: String, required: true },
    clientId: { type: String, required: true },
    status: { type: String, required: true },
    workflowStage: { type: String, required: true },
    deadline: { type: Date, required: true },
    openingDate: { type: Date },
    value: { type: Number, required: true },
    description: { type: String },
    assignedTo: [{ type: String }],
    assignmentResponses: { type: Map, of: assignmentResponseSchema },
    history: [historyLogSchema],
    checklists: { type: Map, of: [checklistItemSchema] },
    tenderFee: financialRecordSchema,
    emd: {
        ...financialRecordSchema.obj,
        type: { type: String, default: 'EMD'},
        expiryDate: Date,
        refundStatus: String,
    },
    pbg: {
        ...financialRecordSchema.obj,
        type: { type: String, default: 'PBG'},
        issuingBank: String,
        expiryDate: Date,
        status: String,
    },
    sd: {
        ...financialRecordSchema.obj,
        type: { type: String, default: 'SD'},
        expiryDate: Date,
        status: String,
    },
    gemFee: {
        amount: Number,
        status: String,
    },
    totalQuantity: Number,
    itemCategory: String,
    minAvgTurnover: String,
    oemAvgTurnover: String,
    pastExperienceYears: Number,
    epbgPercentage: Number,
    epbgDuration: Number,
    emdAmount: Number,
    source: String,
    oemId: String,
    productId: String,
    preBidMeetingNotes: String,
    contractStatus: String,
    paymentStatus: String,
    negotiationDetails: negotiationDetailsSchema,
    competitors: [competitorSchema],
    cost: Number,
    amountPaid: Number,
    liquidatedDamages: Number,
    reasonForLoss: String,
    reasonForLossNotes: String,
    pdiStatus: String,
    documents: [tenderDocumentSchema],
    isLOAReceived: Boolean,
    pastPerformance: String,
    isBidToRaEnabled: Boolean,
    bidType: String,
    documentsRequired: String,
    postAwardProcess: { type: Map, of: processStageSchema },
    mseExemption: Boolean,
    startupExemption: Boolean,
}, {
    timestamps: true,
});

const Tender = mongoose.model('Tender', tenderSchema);

export default Tender;