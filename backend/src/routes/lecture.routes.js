import express from 'express';
import * as ctrl from '../controllers/lecture.controller.js';
import { protect } from '../middleware/auth.js';
import upload, { setUploadFolder } from '../middleware/upload.js';

const router = express.Router();

const fields = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'pdf', maxCount: 1 },
]);

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.post('/', protect, setUploadFolder('lectures'), fields, ctrl.create);
router.put('/:id', protect, setUploadFolder('lectures'), fields, ctrl.update);
router.delete('/:id', protect, ctrl.remove);

export default router;
