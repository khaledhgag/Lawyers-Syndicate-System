import mongoose from 'mongoose';

// الدرجات الشائعة (حر - يمكن للأدمن إضافة غيرها)
export const COURT_DEGREES = ['جزئية', 'ابتدائية', 'استئناف', 'النقض', 'إدارية', 'مجلس الدولة', 'الأسرة', 'اقتصادية'];

const courtSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'اسم المحكمة مطلوب'], trim: true },
    degree: { type: String, required: [true, 'الدرجة مطلوبة'], trim: true },
    governorate: { type: String, required: [true, 'المحافظة مطلوبة'], trim: true },
    address: { type: String, default: '', trim: true },
    mapEmbed: { type: String, default: '', trim: true }, // Google Maps iframe src
    mapLink: { type: String, default: '', trim: true }, // رابط الفتح في خرائط جوجل
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

courtSchema.index({ degree: 1, governorate: 1 });

export default mongoose.model('Court', courtSchema);
