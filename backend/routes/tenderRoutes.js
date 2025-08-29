import express from 'express';
const router = express.Router();
import { getTenders, createTender, updateTender, respondToAssignment, deleteTender } from '../controllers/tenderController.js';

router.route('/')
    .get(getTenders)
    .post(createTender);

router.route('/:id')
    .put(updateTender)
    .delete(deleteTender);

router.route('/:id/respond').post(respondToAssignment);

export default router;