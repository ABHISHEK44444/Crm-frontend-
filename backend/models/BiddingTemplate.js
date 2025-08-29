import mongoose from 'mongoose';

const biddingTemplateSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    content: { type: String, required: true },
});

const BiddingTemplate = mongoose.model('BiddingTemplate', biddingTemplateSchema);
export default BiddingTemplate;
