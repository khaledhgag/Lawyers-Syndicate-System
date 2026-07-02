import Court from '../models/Court.js';
import { asyncHandler } from '../middleware/error.js';

// @desc List courts (public: active only, with optional degree/governorate filter)
// @route GET /api/courts
export const getAll = asyncHandler(async (req, res) => {
  const filter = req.query.all === 'true' ? {} : { isActive: true };
  if (req.query.degree) filter.degree = req.query.degree;
  if (req.query.governorate) filter.governorate = req.query.governorate;
  const items = await Court.find(filter).sort({ governorate: 1, name: 1 });
  res.json({ success: true, count: items.length, data: items });
});

// @desc Distinct degrees + governorates for filter dropdowns
// @route GET /api/courts/meta
export const getMeta = asyncHandler(async (req, res) => {
  const [degrees, governorates] = await Promise.all([
    Court.distinct('degree', { isActive: true }),
    Court.distinct('governorate', { isActive: true }),
  ]);
  res.json({ success: true, degrees: degrees.sort(), governorates: governorates.sort() });
});

export const getOne = asyncHandler(async (req, res) => {
  const item = await Court.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'المحكمة غير موجودة' });
  res.json({ success: true, data: item });
});

export const create = asyncHandler(async (req, res) => {
  const item = await Court.create(req.body);
  res.status(201).json({ success: true, data: item });
});

export const update = asyncHandler(async (req, res) => {
  const item = await Court.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!item) return res.status(404).json({ success: false, message: 'المحكمة غير موجودة' });
  res.json({ success: true, data: item });
});

export const remove = asyncHandler(async (req, res) => {
  const item = await Court.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'المحكمة غير موجودة' });
  res.json({ success: true, message: 'تم الحذف بنجاح' });
});
