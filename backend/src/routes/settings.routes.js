import express from 'express';
import * as ctrl from '../controllers/settings.controller.js';
import { protect } from '../middleware/auth.js';
import upload, { setUploadFolder } from '../middleware/upload.js';

const router = express.Router();

const fields = upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'banner', maxCount: 1 },
]);

router.get('/', ctrl.getSettings);
router.put('/', protect, setUploadFolder('settings'), fields, ctrl.updateSettings);

export default router;
