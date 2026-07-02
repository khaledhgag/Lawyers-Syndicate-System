import express from 'express';
import { login, getMe, changePassword, register } from '../controllers/auth.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/password', protect, changePassword);
router.post('/register', protect, authorize('superadmin'), register);

export default router;
