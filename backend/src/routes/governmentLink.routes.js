import express from 'express';
import * as ctrl from '../controllers/governmentLink.controller.js';
import { protect } from '../middleware/auth.js';
import upload, { setUploadFolder } from '../middleware/upload.js';

const router = express.Router();

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.post('/', protect, setUploadFolder('government-links'), upload.single('icon'), ctrl.create);
router.put('/:id', protect, setUploadFolder('government-links'), upload.single('icon'), ctrl.update);
router.delete('/:id', protect, ctrl.remove);

export default router;
