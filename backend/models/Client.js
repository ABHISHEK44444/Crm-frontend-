import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String },
    email: { type: String },
    phone: { type: String },
    isPrimary: { type: Boolean, default: false },
});

const historyLogSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    user: { type: String, required: true },
    action: { type: String, required: true },
    timestamp: { type: Date, required: true },
    details: { type: String },
});

const interactionLogSchema = new mongoose.Schema({
    id: { type: String, required: true },
    type: { type: String, enum: ['Call', 'Email', 'Meeting'] },
    notes: { type: String },
    userId: { type: String },
    user: { type: String },
    timestamp: { type: Date },
});

const clientSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    name: { type: String, required: true },
    industry: { type: String },
    gstin: { type: String },
    revenue: { type: Number },
    joinedDate: { type: Date },
    contacts: [contactSchema],
    status: { type: String },
    category: { type: String },
    source: { type: String },
    notes: { type: String },
    history: [historyLogSchema],
    potentialValue: { type: Number },
    interactions: [interactionLogSchema],
}, {
    timestamps: true,
});

const Client = mongoose.model('Client', clientSchema);

export default Client;
