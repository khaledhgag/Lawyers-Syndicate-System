import Activity from '../models/Activity.js';
import { asyncHandler } from '../middleware/error.js';
import { filePublicPath, deleteFile } from '../utils/fileHelper.js';

export const getAll = asyncHandler(async (req, res) => {
  const filter = req.query.all === 'true' ? {} : { isActive: true };
  if (req.query.type) filter.type = req.query.type;
  const items = await Activity.find(filter).sort({ date: -1 });
  res.json({ success: true, count: items.length, data: items });
});

export const getOne = asyncHandler(async (req, res) => {
  const item = await Activity.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'النشاط غير موجود' });
  res.json({ success: true, data: item });
});

export const create = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  if (req.files?.length) body.gallery = req.files.map((f) => filePublicPath(f));
  const item = await Activity.create(body);
  res.status(201).json({ success: true, data: item });
});

export const update = asyncHandler(async (req, res) => {
  const item = await Activity.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'النشاط غير موجود' });
  const { removeImages, ...body } = req.body;

  // Remove selected existing images
  if (removeImages) {
    const toRemove = Array.isArray(removeImages) ? removeImages : [removeImages];
    toRemove.forEach((img) => deleteFile(img));
    item.gallery = item.gallery.filter((g) => !toRemove.includes(g));
  }
  // Append newly uploaded images
  if (req.files?.length) {
    item.gallery.push(...req.files.map((f) => filePublicPath(f)));
  }
  Object.assign(item, body);
  await item.save();
  res.json({ success: true, data: item });
});

export const remove = asyncHandler(async (req, res) => {
  const item = await Activity.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'النشاط غير موجود' });
  item.gallery.forEach((g) => deleteFile(g));
  await item.deleteOne();
  res.json({ success: true, message: 'تم الحذف بنجاح' });
});
