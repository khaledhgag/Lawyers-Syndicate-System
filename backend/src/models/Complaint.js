import mongoose from 'mongoose';

export const REQUEST_TYPES = ['مقترح', 'شكوى', 'استفسار', 'طلب تطوير خدمة'];
export const COMPLAINT_STATUSES = ['جديد', 'جاري المراجعة', 'تم الرد', 'مغلق'];

const complaintSchema = new mongoose.Schema(
  {
    // Human-readable tracking number, e.g. SQ-2026-00042
    ticketNumber: { type: String, unique: true, sparse: true, index: true },
    requestType: {
      type: String,
      required: [true, 'نوع الطلب مطلوب'],
      enum: { values: REQUEST_TYPES, message: 'نوع الطلب غير صالح' },
    },
    fullName: { type: String, required: [true, 'الاسم رباعي مطلوب'], trim: true },
    membershipNumber: { type: String, required: [true, 'رقم القيد مطلوب'], trim: true },
    center: { type: String, required: [true, 'الجزئية / المركز مطلوب'], trim: true },
    phone: { type: String, required: [true, 'رقم الهاتف مطلوب'], trim: true },
    subject: { type: String, required: [true, 'عنوان الطلب مطلوب'], trim: true },
    details: { type: String, required: [true, 'تفاصيل الطلب مطلوبة'], trim: true },
    attachment: { type: String, default: '' },
    attachments: [{ type: String }],
    video: { type: String, default: '' },
    wantsContact: { type: Boolean, default: false },
    agreed: { type: Boolean, required: true },
    status: {
      type: String,
      enum: COMPLAINT_STATUSES,
      default: 'جديد',
    },
    adminNotes: { type: String, default: '' },
  },
  { timestamps: true }
);

complaintSchema.index({ status: 1, createdAt: -1 });
complaintSchema.index({ requestType: 1 });

export default mongoose.model('Complaint', complaintSchema);
