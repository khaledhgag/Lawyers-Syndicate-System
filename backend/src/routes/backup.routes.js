import express from 'express';
import * as ctrl from '../controllers/backup.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Every backup route is superadmin-only.
router.use(protect, authorize('superadmin'));

// NOTE: static/literal paths must be declared before the ':filename' param route.
router.get('/progress', ctrl.progress);
router.get('/', ctrl.list);
router.post('/create', ctrl.create);
router.get('/:filename', ctrl.download);
router.delete('/:filename', ctrl.remove);

export default router;
