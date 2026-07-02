import express from 'express';
import * as ctrl from '../controllers/judgment.controller.js';
import { protect } from '../middleware/auth.js';
import upload, { setUploadFolder } from '../middleware/upload.js';

const router = express.Router();

router.get('/', ctrl.getAll);
router.get('/meta', ctrl.getMeta);
router.get('/:id', ctrl.getOne);
router.post('/', protect, setUploadFolder('judgments'), upload.single('pdf'), ctrl.create);
router.post('/bulk', protect, setUploadFolder('judgments'), upload.array('files', 500), ctrl.bulkCreate);
router.post('/bulk-delete', protect, ctrl.bulkRemove);
router.put('/:id', protect, setUploadFolder('judgments'), upload.single('pdf'), ctrl.update);
router.delete('/:id', protect, ctrl.remove);

export default router;
