import mongoose from 'mongoose';

const oemSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    contactPerson: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    website: String,
    area: String,
    region: String,
    accountManager: String,
    accountManagerStatus: String,
}, { timestamps: true });

const OEM = mongoose.model('OEM', oemSchema);
export default OEM;
