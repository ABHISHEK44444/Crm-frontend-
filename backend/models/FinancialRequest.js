import mongoose from 'mongoose';

const financialRequestSchema = new mongoose.Schema({
    id: { type: String, unique: true, required: true },
    tenderId: { type: String, required: true },
    type: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, required: true },
    requestedById: { type: String, required: true },
    requestDate: { type: Date, default: Date.now },
    notes: { type: String },
    approverId: { type: String },
    approvalDate: { type: Date },
    rejectionReason: { type: String },
    expiryDate: { type: Date },
    instrumentDetails: {
        mode: String,
        processedDate: Date,
        expiryDate: Date,
        issuingBank: String,
        documentUrl: String,
    },
}, { timestamps: true });

const FinancialRequest = mongoose.model('FinancialRequest', financialRequestSchema);
export default FinancialRequest;