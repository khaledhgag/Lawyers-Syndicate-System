import express from 'express';
import * as ctrl from '../controllers/complaint.controller.js';
import { protect } from '../middleware/auth.js';
import upload, { setUploadFolder } from '../middleware/upload.js';

const router = express.Router();

// Public submission
router.post(
  '/',
  setUploadFolder('complaints'),
  upload.fields([
    { name: 'attachments', maxCount: 5 },
    { name: 'video', maxCount: 1 },
    { name: 'attachment', maxCount: 1 },
  ]),
  ctrl.create
);

// Public tracking by ticket number
router.get('/track/:ticket', ctrl.track);

// Admin
router.get('/', protect, ctrl.getAll);
router.get('/:id', protect, ctrl.getOne);
router.put('/:id', protect, ctrl.update);
router.delete('/:id', protect, ctrl.remove);

export default router;
