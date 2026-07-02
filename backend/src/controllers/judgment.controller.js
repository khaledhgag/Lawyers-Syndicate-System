import Judgment, { JUDGMENT_CATEGORIES } from '../models/Judgment.js';
import { asyncHandler } from '../middleware/error.js';
import { filePublicPath, deleteFile } from '../utils/fileHelper.js';

// @desc List judgments with pagination/search/filter (optimized for large datasets)
// @route GET /api/judgments
export const getAll = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 12));
  const skip = (page - 1) * limit;

  const { category, year, appealNumber, search } = req.query;
  const filter = {};
  if (req.query.all !== 'true') filter.isActive = true;
  if (category && JUDGMENT_CATEGORIES.includes(category)) filter.category = category;
  if (year) filter.year = Number(year);
  if (appealNumber) filter.appealNumber = { $regex: appealNumber.trim(), $options: 'i' };

  let query;
  let sort = { createdAt: -1 };

  if (search && search.trim()) {
    const term = search.trim();
    // Use text index for performance; fallback regex on title if needed
    filter.$text = { $search: term };
    query = Judgment.find(filter, { score: { $meta: 'textScore' } });
    sort = { score: { $meta: 'textScore' } };
  } else {
    query = Judgment.find(filter);
  }

  // lean() for read performance, run count + data in parallel
  const [data, total] = await Promise.all([
    query.sort(sort).skip(skip).limit(limit).lean(),
    Judgment.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  });
});

// @desc Distinct years available (for filter dropdown)
// @route GET /api/judgments/meta
export const getMeta = asyncHandler(async (req, res) => {
  const years = await Judgment.distinct('year', { isActive: true });
  res.json({
    success: true,
    categories: JUDGMENT_CATEGORIES,
    years: years.sort((a, b) => b - a),
  });
});

export const getOne = asyncHandler(async (req, res) => {
  const item = await Judgment.findById(req.params.id).lean();
  if (!item) return res.status(404).json({ success: false, message: 'الحكم غير موجود' });
  res.json({ success: true, data: item });
});

export const create = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  if (!req.file) return res.status(400).json({ success: false, message: 'ملف PDF مطلوب' });
  body.pdf = filePublicPath(req.file);
  const item = await Judgment.create(body);
  res.status(201).json({ success: true, data: item });
});

export const update = asyncHandler(async (req, res) => {
  const item = await Judgment.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'الحكم غير موجود' });
  const body = { ...req.body };
  if (req.file) {
    deleteFile(item.pdf);
    body.pdf = filePublicPath(req.file);
  }
  Object.assign(item, body);
  await item.save();
  res.json({ success: true, data: item });
});

export const remove = asyncHandler(async (req, res) => {
  const item = await Judgment.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'الحكم غير موجود' });
  deleteFile(item.pdf);
  await item.deleteOne();
  res.json({ success: true, message: 'تم الحذف بنجاح' });
});

// Decode a possibly latin1-garbled multipart filename to UTF-8
const decodeName = (name) => {
  try {
    return Buffer.from(name, 'latin1').toString('utf8');
  } catch {
    return name;
  }
};

// @desc Bulk upload many judgment PDFs at once (each stored with its own name)
// @route POST /api/judgments/bulk
export const bulkCreate = asyncHandler(async (req, res) => {
  const { category } = req.body;
  if (!JUDGMENT_CATEGORIES.includes(category)) {
    return res.status(400).json({ success: false, message: 'اختر تصنيفاً صحيحاً (جنائي أو مدني)' });
  }
  if (!req.files || !req.files.length) {
    return res.status(400).json({ success: false, message: 'لم يتم رفع أي ملفات' });
  }

  // The file name is the judgment title (no appeal number / year parsing).
  const docs = req.files.map((f) => {
    const base = decodeName(f.originalname).replace(/\.pdf$/i, '').trim();
    return {
      title: base || 'حكم بدون عنوان',
      category,
      pdf: filePublicPath(f),
    };
  });

  const inserted = await Judgment.insertMany(docs, { ordered: false });
  res.status(201).json({ success: true, message: `تم رفع ${inserted.length} حكم`, count: inserted.length });
});

// @desc Bulk delete
// @route POST /api/judgments/bulk-delete
export const bulkRemove = asyncHandler(async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || !ids.length)
    return res.status(400).json({ success: false, message: 'لا توجد عناصر محددة' });
  const items = await Judgment.find({ _id: { $in: ids } });
  items.forEach((i) => deleteFile(i.pdf));
  await Judgment.deleteMany({ _id: { $in: ids } });
  res.json({ success: true, message: `تم حذف ${items.length} حكم` });
});
