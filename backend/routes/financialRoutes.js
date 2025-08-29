import express from 'express';
import { getFinancialRequests, createFinancialRequest, updateFinancialRequest } from '../controllers/financialController.js';
const router = express.Router();

router.route('/')
    .get(getFinancialRequests)
    .post(createFinancialRequest);

router.route('/:id')
    .put(updateFinancialRequest);

export default router;
