import Lecture from '../models/Lecture.js';
import { asyncHandler } from '../middleware/error.js';
import { filePublicPath, deleteFile } from '../utils/fileHelper.js';

export const getAll = asyncHandler(async (req, res) => {
  const filter = req.query.all === 'true' ? {} : { isActive: true };
  const items = await Lecture.find(filter).sort({ date: -1 });
  res.json({ success: true, count: items.length, data: items });
});

export const getOne = asyncHandler(async (req, res) => {
  const item = await Lecture.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'الندوة غير موجودة' });
  res.json({ success: true, data: item });
});

export const create = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  if (req.files?.image) body.image = filePublicPath(req.files.image[0]);
  if (req.files?.pdf) body.pdf = filePublicPath(req.files.pdf[0]);
  const item = await Lecture.create(body);
  res.status(201).json({ success: true, data: item });
});

export const update = asyncHandler(async (req, res) => {
  const item = await Lecture.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'الندوة غير موجودة' });
  const body = { ...req.body };
  if (req.files?.image) {
    deleteFile(item.image);
    body.image = filePublicPath(req.files.image[0]);
  }
  if (req.files?.pdf) {
    deleteFile(item.pdf);
    body.pdf = filePublicPath(req.files.pdf[0]);
  }
  Object.assign(item, body);
  await item.save();
  res.json({ success: true, data: item });
});

export const remove = asyncHandler(async (req, res) => {
  const item = await Lecture.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'الندوة غير موجودة' });
  deleteFile(item.image);
  deleteFile(item.pdf);
  await item.deleteOne();
  res.json({ success: true, message: 'تم الحذف بنجاح' });
});
