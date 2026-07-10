import Book from '../models/Book.js';
import { asyncHandler } from '../middleware/error.js';
import { filePublicPath, deleteFile } from '../utils/fileHelper.js';

// @desc List books with pagination/search/filter (optimized for large datasets)
// @route GET /api/books
export const getAll = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 12));
  const skip = (page - 1) * limit;

  const { year, appealNumber, search } = req.query;
  const filter = {};
  if (req.query.all !== 'true') filter.isActive = true;
  if (year) filter.year = Number(year);
  if (appealNumber) filter.appealNumber = { $regex: appealNumber.trim(), $options: 'i' };

  let query;
  let sort = { createdAt: -1 };

  if (search && search.trim()) {
    const term = search.trim();
    // Use text index for performance; fallback regex on title if needed
    filter.$text = { $search: term };
    query = Book.find(filter, { score: { $meta: 'textScore' } });
    sort = { score: { $meta: 'textScore' } };
  } else {
    query = Book.find(filter);
  }

  // lean() for read performance, run count + data in parallel
  const [data, total] = await Promise.all([
    query.sort(sort).skip(skip).limit(limit).lean(),
    Book.countDocuments(filter),
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
// @route GET /api/books/meta
export const getMeta = asyncHandler(async (req, res) => {
  const years = await Book.distinct('year', { isActive: true });
  res.json({
    success: true,
    years: years.filter(Boolean).sort((a, b) => b - a),
  });
});

export const getOne = asyncHandler(async (req, res) => {
  const item = await Book.findById(req.params.id).lean();
  if (!item) return res.status(404).json({ success: false, message: 'الكتاب غير موجود' });
  res.json({ success: true, data: item });
});

export const create = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  if (!req.file) return res.status(400).json({ success: false, message: 'ملف PDF مطلوب' });
  body.pdf = filePublicPath(req.file);
  const item = await Book.create(body);
  res.status(201).json({ success: true, data: item });
});

export const update = asyncHandler(async (req, res) => {
  const item = await Book.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'الكتاب غير موجود' });
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
  const item = await Book.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'الكتاب غير موجود' });
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

// @desc Bulk upload many book PDFs at once (each stored with its own name)
// @route POST /api/books/bulk
export const bulkCreate = asyncHandler(async (req, res) => {
  if (!req.files || !req.files.length) {
    return res.status(400).json({ success: false, message: 'لم يتم رفع أي ملفات' });
  }

  // The file name is the book title (no appeal number / year parsing).
  const docs = req.files.map((f) => {
    const base = decodeName(f.originalname).replace(/\.pdf$/i, '').trim();
    return {
      title: base || 'كتاب بدون عنوان',
      pdf: filePublicPath(f),
    };
  });

  const inserted = await Book.insertMany(docs, { ordered: false });
  res.status(201).json({ success: true, message: `تم رفع ${inserted.length} كتاب`, count: inserted.length });
});

// @desc Delete ALL books and their files
// @route POST /api/books/delete-all
export const removeAll = asyncHandler(async (req, res) => {
  const items = await Book.find({}, 'pdf').lean();
  items.forEach((i) => deleteFile(i.pdf));
  const result = await Book.deleteMany({});
  res.json({ success: true, message: `تم حذف كل الكتب (${result.deletedCount})`, count: result.deletedCount });
});

// @desc Bulk delete
// @route POST /api/books/bulk-delete
export const bulkRemove = asyncHandler(async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || !ids.length)
    return res.status(400).json({ success: false, message: 'لا توجد عناصر محددة' });
  const items = await Book.find({ _id: { $in: ids } });
  items.forEach((i) => deleteFile(i.pdf));
  await Book.deleteMany({ _id: { $in: ids } });
  res.json({ success: true, message: `تم حذف ${items.length} كتاب` });
});
