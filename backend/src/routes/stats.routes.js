import express from 'express';
import { getStats, getUploadConfig } from '../controllers/stats.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getStats);
router.get('/upload-config', protect, getUploadConfig);

export default router;
