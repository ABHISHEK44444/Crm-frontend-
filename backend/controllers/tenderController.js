import Tender from '../models/Tender.js';
import Client from '../models/Client.js';

// @desc    Fetch all tenders
// @route   GET /api/tenders
// @access  Public (for now)
const getTenders = async (req, res) => {
    try {
        const tenders = await Tender.find({}).sort({ createdAt: -1 });
        res.json(tenders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a new tender
// @route   POST /api/tenders
// @access  Private
const createTender = async (req, res) => {
    try {
        const { clientId, ...tenderData } = req.body;

        if (!clientId) {
            return res.status(400).json({ message: 'Client ID is required.' });
        }

        const client = await Client.findOne({ id: clientId });
        if (!client) {
            return res.status(404).json({ message: `Client not found for ID: ${clientId}` });
        }

        const newTender = new Tender({
            ...tenderData,
            id: `ten${Date.now()}`,
            clientId: client.id,
            clientName: client.name,
            status: tenderData.status || 'Drafting',
            workflowStage: tenderData.workflowStage || 'Tender Identification',
            history: [{
                userId: 'user1', // TODO: Replace with authenticated user ID
                user: 'Admin User', // TODO: Replace with authenticated user name
                action: 'Created Tender',
                timestamp: new Date(),
            }],
        });

        const createdTender = await newTender.save();
        res.status(201).json(createdTender);
    } catch (error) {
        console.error('Tender Creation Error:', error);
        // Provide a more detailed error response
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: `Validation Error: ${messages.join(', ')}` });
        }
        res.status(400).json({ message: 'Invalid tender data', error: error.message });
    }
};

// @desc    Update a tender
// @route   PUT /api/tenders/:id
// @access  Private
const updateTender = async (req, res) => {
    try {
        const tender = await Tender.findOne({ id: req.params.id });

        if (tender) {
            Object.assign(tender, req.body);
            
            const updatedTender = await tender.save();
            res.json(updatedTender);
        } else {
            res.status(404).json({ message: 'Tender not found' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Invalid tender data' });
    }
};

// @desc    Delete a tender
// @route   DELETE /api/tenders/:id
// @access  Private
const deleteTender = async (req, res) => {
    try {
        const tender = await Tender.findOne({ id: req.params.id });

        if (tender) {
            await tender.deleteOne();
            res.json({ message: 'Tender removed' });
        } else {
            res.status(404).json({ message: 'Tender not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Respond to an assignment
// @route   POST /api/tenders/:id/respond
// @access  Private
const respondToAssignment = async (req, res) => {
    try {
        const { status, notes } = req.body;
        // In a real app, userId and userName would come from a decoded JWT token
        const userId = 'user2'; 
        const userName = 'Sales User';

        const tender = await Tender.findOne({ id: req.params.id });

        if (tender) {
            if (!tender.assignmentResponses) {
                tender.assignmentResponses = new Map();
            }
            tender.assignmentResponses.set(userId, {
                status,
                notes,
                respondedAt: new Date(),
            });

            tender.history.push({
                userId,
                user: userName,
                action: `Responded to Assignment`,
                timestamp: new Date(),
                details: `Set status to ${status}.`
            });

            const updatedTender = await tender.save();
            res.json(updatedTender);
        } else {
            res.status(404).json({ message: 'Tender not found' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Error responding to assignment' });
    }
};


export { getTenders, createTender, updateTender, respondToAssignment, deleteTender };