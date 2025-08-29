import express from 'express';
const router = express.Router();
import { getClients, createClient, updateClient } from '../controllers/clientController.js';

router.route('/')
    .get(getClients)
    .post(createClient);

router.route('/:id')
    .put(updateClient);

export default router;
