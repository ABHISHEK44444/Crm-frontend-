import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    id: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false }, // Add password for real auth
    role: { type: String, required: true },
    avatarUrl: { type: String },
    status: { type: String },
    department: { type: String },
    designation: { type: String },
    specializations: [{ type: String }],
}, {
    timestamps: true,
});

const User = mongoose.model('User', userSchema);

export default User;
