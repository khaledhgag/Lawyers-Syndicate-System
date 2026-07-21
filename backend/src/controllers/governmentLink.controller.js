import GovernmentLink from '../models/GovernmentLink.js';
import { asyncHandler } from '../middleware/error.js';
import { filePublicPath, deleteFile } from '../utils/fileHelper.js';

const deleteUploadedIcon = (icon) => {
  if (icon?.startsWith('/uploads/')) deleteFile(icon);
};

export const getAll = asyncHandler(async (req, res) => {
  const filter = req.query.all === 'true' ? {} : { isActive: true };
  const items = await GovernmentLink.find(filter).sort({ order: 1, createdAt: 1 });
  res.json({ success: true, count: items.length, data: items });
});

export const getOne = asyncHandler(async (req, res) => {
  const item = await GovernmentLink.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'الرابط غير موجود' });
  res.json({ success: true, data: item });
});

export const create = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  if (req.file) body.icon = filePublicPath(req.file);
  const item = await GovernmentLink.create(body);
  res.status(201).json({ success: true, data: item });
});

export const update = asyncHandler(async (req, res) => {
  const item = await GovernmentLink.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'الرابط غير موجود' });
  const body = { ...req.body };
  if (req.file) {
    deleteUploadedIcon(item.icon);
    body.icon = filePublicPath(req.file);
  } else if (body.icon === '' && item.icon) {
    deleteUploadedIcon(item.icon);
  }
  Object.assign(item, body);
  await item.save();
  res.json({ success: true, data: item });
});

export const remove = asyncHandler(async (req, res) => {
  const item = await GovernmentLink.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'الرابط غير موجود' });
  deleteUploadedIcon(item.icon);
  await item.deleteOne();
  res.json({ success: true, message: 'تم الحذف بنجاح' });
});
