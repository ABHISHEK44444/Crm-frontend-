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

        const tender = await Tender.findOne({ id: request.tenderId });

        if (tender) {
            if (status === 'Processed' && instrument) {
                request.instrumentDetails = instrument;
                // Map frontend's processedDate to backend's submittedDate schema field
                const instrumentForTender = { 
                    ...instrument,
                    submittedDate: instrument.processedDate
                };
                delete instrumentForTender.processedDate;

                if (request.type.startsWith('EMD')) {
                    if (!tender.emds) tender.emds = [];
                    const emdMode = request.type.replace('EMD ', ''); // 'EMD BG' -> 'BG'
                    tender.emds.push({
                        ...instrumentForTender,
                        amount: request.amount,
                        refundStatus: 'Pending',
                        mode: emdMode,
                        requestId: request.id,
                    });
                } else if (request.type === 'PBG') {
                    if (!tender.pbgs) tender.pbgs = [];
                    tender.pbgs.push({
                        ...instrumentForTender,
                        amount: request.amount,
                        status: 'Active',
                        requestId: request.id,
                    });
                } else if (request.type === 'Tender Fee') {
                    tender.tenderFee = {
                        amount: request.amount,
                        ...instrumentForTender
                    };
                }
            } else if (status === 'Refunded' && request.type.startsWith('EMD')) {
                const emdToUpdate = tender.emds.find(e => e.requestId === request.id);
                if (emdToUpdate) {
                    emdToUpdate.refundStatus = 'Refunded';
                }
            } else if (status === 'Released' && request.type === 'PBG') {
                 const pbgToUpdate = tender.pbgs.find(p => p.requestId === request.id);
                if (pbgToUpdate) {
                    pbgToUpdate.status = 'Released';
                }
            }

            await tender.save();
        }
        
        const updatedRequest = await request.save();
        res.json(updatedRequest);
    } else {
        res.status(404).json({ message: 'Request not found' });
    }
};

export { getFinancialRequests, createFinancialRequest, updateFinancialRequest };
