import mongoose from 'mongoose';

const tenderDocumentSchema = new mongoose.Schema({
    id: String,
    name: String,
    url: String, 
    type: String,
    mimeType: String,
    uploadedAt: Date,
    uploadedById: String,
});

const productSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    documents: [tenderDocumentSchema],
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
export default Product;
