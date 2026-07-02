import express from 'express';
import * as ctrl from '../controllers/boardMember.controller.js';
import { protect } from '../middleware/auth.js';
import upload, { setUploadFolder } from '../middleware/upload.js';

const router = express.Router();

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.post('/', protect, setUploadFolder('board'), upload.single('photo'), ctrl.create);
router.put('/:id', protect, setUploadFolder('board'), upload.single('photo'), ctrl.update);
router.delete('/:id', protect, ctrl.remove);

export default router;
