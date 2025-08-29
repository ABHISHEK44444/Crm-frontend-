import FinancialRequest from '../models/FinancialRequest.js';
import Tender from '../models/Tender.js';

// @desc    Get all financial requests
// @route   GET /api/financials
const getFinancialRequests = async (req, res) => {
    const requests = await FinancialRequest.find({}).sort({ requestDate: -1 });
    res.json(requests);
};

// @desc    Create a financial request
// @route   POST /api/financials
const createFinancialRequest = async (req, res) => {
    // Assuming user is authenticated and ID is available
    const requestedById = 'user2'; // Placeholder
    const { tenderId, type, amount, notes, expiryDate } = req.body;

    const request = new FinancialRequest({
        id: `fin${Date.now()}`,
        tenderId,
        type,
        amount,
        notes,
        expiryDate,
        requestedById,
        status: 'Pending Approval',
    });

    const createdRequest = await request.save();
    res.status(201).json(createdRequest);
};

// @desc    Update a financial request
// @route   PUT /api/financials/:id
const updateFinancialRequest = async (req, res) => {
    const request = await FinancialRequest.findOne({ id: req.params.id });
    if (request) {
        const { status, reason, instrument } = req.body;
        request.status = status;
        if(reason) request.rejectionReason = reason;
        
        if (status === 'Approved') {
            request.approverId = 'user1'; // Placeholder for admin user
            request.approvalDate = new Date();
        }

        if (status === 'Processed' && instrument) {
            request.instrumentDetails = instrument;
            // Also update the related tender
            const tender = await Tender.findOne({ id: request.tenderId });
            if (tender) {
                const instrumentType = request.type === 'EMD' ? 'emd' : (request.type === 'PBG' ? 'pbg' : 'sd');
                if (instrumentType !== 'Other') {
                    tender[instrumentType] = {
                        amount: request.amount,
                        ...instrument,
                    };
                    if(instrumentType === 'emd') tender.emd.refundStatus = 'Pending';
                    if(instrumentType === 'pbg') tender.pbg.status = 'Active';
                    await tender.save();
                }
            }
        }
        
        const updatedRequest = await request.save();
        res.json(updatedRequest);
    } else {
        res.status(404).json({ message: 'Request not found' });
    }
};

export { getFinancialRequests, createFinancialRequest, updateFinancialRequest };