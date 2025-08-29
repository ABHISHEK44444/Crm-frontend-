import Client from '../models/Client.js';

// @desc    Fetch all clients
// @route   GET /api/clients
// @access  Public (for now)
const getClients = async (req, res) => {
    const clients = await Client.find({}).sort({ name: 1 });
    res.json(clients);
};

// @desc    Create a new client
// @route   POST /api/clients
// @access  Private
const createClient = async (req, res) => {
    const { name, industry, gstin, category, status, notes, potentialValue, source } = req.body;
    
    const client = new Client({
        id: `cli${Date.now()}`,
        name,
        industry,
        gstin,
        category,
        status,
        notes,
        potentialValue,
        source,
        revenue: 0,
        joinedDate: new Date(),
        contacts: [],
        history: [{
             userId: 'user1', // Replace with authenticated user ID
             user: 'Admin User', // Replace with authenticated user name
             action: 'Created Client',
             timestamp: new Date(),
        }]
    });

    const createdClient = await client.save();
    res.status(201).json(createdClient);
};

// @desc    Update a client
// @route   PUT /api/clients/:id
// @access  Private
const updateClient = async (req, res) => {
    const client = await Client.findOne({ id: req.params.id });

    if (client) {
        Object.assign(client, req.body);
        const updatedClient = await client.save();
        res.json(updatedClient);
    } else {
        res.status(404);
        throw new Error('Client not found');
    }
};

export { getClients, createClient, updateClient };
