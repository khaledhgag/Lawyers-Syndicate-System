import express from 'express';
import * as ctrl from '../controllers/court.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', ctrl.getAll);
router.get('/meta', ctrl.getMeta);
router.get('/:id', ctrl.getOne);
router.post('/', protect, ctrl.create);
router.put('/:id', protect, ctrl.update);
router.delete('/:id', protect, ctrl.remove);

export default router;
