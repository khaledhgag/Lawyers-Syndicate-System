import Settings from '../models/Settings.js';
import { asyncHandler } from '../middleware/error.js';
import { filePublicPath, deleteFile } from '../utils/fileHelper.js';

// @desc Get site settings (public)
// @route GET /api/settings
export const getSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getSingleton();
  res.json({ success: true, data: settings });
});

// @desc Update settings (admin)
// @route PUT /api/settings
export const updateSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getSingleton();
  const body = { ...req.body };

  // social may arrive as flat keys (social.facebook) from multipart
  const social = {};
  Object.keys(body).forEach((k) => {
    if (k.startsWith('social.')) {
      social[k.split('.')[1]] = body[k];
      delete body[k];
    }
  });
  if (body.social && typeof body.social === 'string') {
    try { Object.assign(social, JSON.parse(body.social)); } catch { /* ignore */ }
    delete body.social;
  }

  // files: logo, banner
  if (req.files?.logo) {
    deleteFile(settings.logo);
    body.logo = filePublicPath(req.files.logo[0]);
  }
  if (req.files?.banner) {
    deleteFile(settings.banner);
    body.banner = filePublicPath(req.files.banner[0]);
  }

  Object.assign(settings, body);
  if (Object.keys(social).length) settings.social = { ...settings.social.toObject?.() ?? settings.social, ...social };
  await settings.save();
  res.json({ success: true, data: settings });
});
