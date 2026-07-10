import Service from '../models/Service.js';
import { asyncHandler } from '../middleware/error.js';
import { filePublicPath, deleteFile } from '../utils/fileHelper.js';

export const getAll = asyncHandler(async (req, res) => {
  const filter = req.query.all === 'true' ? {} : { isActive: true };
  const items = await Service.find(filter).sort({ order: 1, createdAt: -1 });
  res.json({ success: true, count: items.length, data: items });
});

export const getOne = asyncHandler(async (req, res) => {
  const item = await Service.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'الخدمة غير موجودة' });
  res.json({ success: true, data: item });
});

export const create = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  if (req.file) body.image = filePublicPath(req.file);
  const item = await Service.create(body);
  res.status(201).json({ success: true, data: item });
});

export const update = asyncHandler(async (req, res) => {
  const item = await Service.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'الخدمة غير موجودة' });
  const body = { ...req.body };
  if (req.file) {
    deleteFile(item.image);
    body.image = filePublicPath(req.file);
  } else if (body.image === '' && item.image) {
    deleteFile(item.image); // explicit removal
  }
  Object.assign(item, body);
  await item.save();
  res.json({ success: true, data: item });
});

export const remove = asyncHandler(async (req, res) => {
  const item = await Service.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'الخدمة غير موجودة' });
  deleteFile(item.image);
  await item.deleteOne();
  res.json({ success: true, message: 'تم الحذف بنجاح' });
});
