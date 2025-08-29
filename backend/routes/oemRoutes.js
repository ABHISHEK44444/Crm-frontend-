import express from 'express';
import { getOems, createOem, updateOem } from '../controllers/oemController.js';
const router = express.Router();

router.route('/').get(getOems).post(createOem);
router.route('/:id').put(updateOem);

export default router;
