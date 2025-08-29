import mongoose from 'mongoose';

const designationSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true, unique: true },
});

const Designation = mongoose.model('Designation', designationSchema);
export default Designation;
