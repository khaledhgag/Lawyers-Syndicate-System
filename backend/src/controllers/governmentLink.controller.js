import GovernmentLink from '../models/GovernmentLink.js';
import { asyncHandler } from '../middleware/error.js';

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
  const item = await GovernmentLink.create(req.body);
  res.status(201).json({ success: true, data: item });
});

export const update = asyncHandler(async (req, res) => {
  const item = await GovernmentLink.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!item) return res.status(404).json({ success: false, message: 'الرابط غير موجود' });
  res.json({ success: true, data: item });
});

export const remove = asyncHandler(async (req, res) => {
  const item = await GovernmentLink.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'الرابط غير موجود' });
  res.json({ success: true, message: 'تم الحذف بنجاح' });
});
