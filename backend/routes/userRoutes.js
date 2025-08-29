import express from 'express';
const router = express.Router();
import { authUser, getUsers, createUser, updateUser, deleteUser } from '../controllers/userController.js';

router.post('/login', authUser);
router.route('/').get(getUsers).post(createUser);
router.route('/:id').put(updateUser).delete(deleteUser);

export default router;