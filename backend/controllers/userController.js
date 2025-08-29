import User from '../models/User.js';

// @desc    Auth user & get token (simplified)
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
    const { username, password } = req.body;

    // In a real app, you would compare a hashed password.
    // For this demo, we check the plaintext password from the seeder.
    const user = await User.findOne({ username });

    if (user && password === 'password123') {
        res.json({
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            role: user.role,
            avatarUrl: user.avatarUrl,
            status: user.status,
            department: user.department,
            designation: user.designation,
            specializations: user.specializations,
        });
    } else {
        res.status(401).json({ message: 'Invalid username or password' });
    }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    const users = await User.find({}).sort({ name: 1 });
    res.json(users);
};

// @desc    Create a user
// @route   POST /api/users
// @access  Private/Admin
const createUser = async (req, res) => {
    const { name, role, avatarUrl, department, designation, specializations } = req.body;
    const username = name.toLowerCase().replace(/\s+/g, '.'); // e.g. "Sales User" -> "sales.user"
    const email = `${username}@mintergraph.com`;

    const userExists = await User.findOne({ $or: [{ username }, { email }] });
    if (userExists) {
        return res.status(400).json({ message: `A user with the name '${name}' already exists.` });
    }
    
    const user = new User({
        id: `user${Date.now()}`,
        name,
        username,
        email,
        password: 'password123', // Default password for new users
        role,
        avatarUrl: avatarUrl || `https://ui-avatars.com/api/?name=${name.replace(' ', '+')}`,
        status: 'Active',
        department,
        designation,
        specializations: Array.isArray(specializations) ? specializations : [],
    });

    try {
        await user.save();
        const allUsers = await User.find({}).sort({ name: 1 });
        res.status(201).json(allUsers);
    } catch (error) {
        res.status(400).json({ message: 'Invalid user data.', details: error.message });
    }
};

// @desc    Update a user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
    const user = await User.findOne({ id: req.params.id });
    if(user) {
        const { specializations, ...restOfBody } = req.body;

        Object.assign(user, restOfBody);

        if (specializations !== undefined) {
            user.specializations = Array.isArray(specializations) ? specializations : [];
        }

        await user.save();
        const allUsers = await User.find({}).sort({ name: 1 });
        res.json(allUsers);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    const user = await User.findOne({ id: req.params.id });

    if (user) {
        if (user.username === 'admin') {
            return res.status(400).json({ message: 'Cannot delete the primary admin user.' });
        }
        await user.deleteOne();
        res.json({ message: 'User removed' });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};


export { authUser, getUsers, createUser, updateUser, deleteUser };