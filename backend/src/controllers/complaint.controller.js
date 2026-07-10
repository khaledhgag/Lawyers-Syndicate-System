import Complaint, { COMPLAINT_STATUSES } from '../models/Complaint.js';
import Counter from '../models/Counter.js';
import { asyncHandler } from '../middleware/error.js';
import { filePublicPath, deleteFile } from '../utils/fileHelper.js';

// @desc Public: submit a complaint/request
// @route POST /api/complaints
export const create = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  // normalize booleans from multipart strings
  body.wantsContact = body.wantsContact === 'true' || body.wantsContact === true;
  body.agreed = body.agreed === 'true' || body.agreed === true;
  if (!body.agreed) {
    return res.status(400).json({ success: false, message: 'يجب الموافقة على الشروط قبل الإرسال' });
  }

  const uploadedAttachments = [
    ...(req.files?.attachments || []),
    ...(req.files?.attachment || []),
  ];
  if (uploadedAttachments.length > 5) {
    return res.status(400).json({ success: false, message: 'الحد الأقصى للمرفقات هو 5 ملفات' });
  }
  if (uploadedAttachments.length) {
    body.attachments = uploadedAttachments.map((file) => filePublicPath(file));
    body.attachment = body.attachments[0] || '';
  }
  if (req.files?.video?.length) {
    body.video = filePublicPath(req.files.video[0]);
  }

  // Human-readable tracking number: SQ-YYYY-NNNNN
  const year = new Date().getFullYear();
  const seq = await Counter.next(`complaint-${year}`);
  body.ticketNumber = `SQ-${year}-${String(seq).padStart(5, '0')}`;

  const item = await Complaint.create(body);
  res.status(201).json({
    success: true,
    message: 'تم إرسال طلبك بنجاح وسيتم مراجعته',
    data: { id: item._id, ticketNumber: item.ticketNumber },
  });
});

// @desc Public: track a request by its ticket number
// @route GET /api/complaints/track/:ticket
export const track = asyncHandler(async (req, res) => {
  const ticket = String(req.params.ticket || '').trim().toUpperCase();
  const item = await Complaint.findOne({ ticketNumber: ticket }).lean();
  if (!item) return res.status(404).json({ success: false, message: 'لا يوجد طلب بهذا الرقم المرجعي' });
  res.json({
    success: true,
    data: {
      ticketNumber: item.ticketNumber,
      fullName: item.fullName,
      requestType: item.requestType,
      subject: item.subject,
      status: item.status,
      adminNotes: item.adminNotes || '',
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    },
  });
});

// @desc Admin: list complaints with filter + pagination
// @route GET /api/complaints
export const getAll = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 15);
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.requestType) filter.requestType = req.query.requestType;
  if (req.query.search) {
    const t = req.query.search.trim();
    filter.$or = [
      { ticketNumber: { $regex: t, $options: 'i' } },
      { fullName: { $regex: t, $options: 'i' } },
      { membershipNumber: { $regex: t, $options: 'i' } },
      { subject: { $regex: t, $options: 'i' } },
      { phone: { $regex: t, $options: 'i' } },
    ];
  }

  const [data, total] = await Promise.all([
    Complaint.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Complaint.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  });
});

export const getOne = asyncHandler(async (req, res) => {
  const item = await Complaint.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'الطلب غير موجود' });
  res.json({ success: true, data: item });
});

// @desc Admin: update status / notes
// @route PUT /api/complaints/:id
export const update = asyncHandler(async (req, res) => {
  const { status, adminNotes } = req.body;
  if (status && !COMPLAINT_STATUSES.includes(status)) {
    return res.status(400).json({ success: false, message: 'حالة غير صالحة' });
  }
  const item = await Complaint.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'الطلب غير موجود' });
  if (status) item.status = status;
  if (adminNotes !== undefined) item.adminNotes = adminNotes;
  await item.save();
  res.json({ success: true, data: item });
});

export const remove = asyncHandler(async (req, res) => {
  const item = await Complaint.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'الطلب غير موجود' });
  deleteFile(item.attachment);
  (item.attachments || []).forEach((file) => deleteFile(file));
  deleteFile(item.video);
  await item.deleteOne();
  res.json({ success: true, message: 'تم الحذف بنجاح' });
});
