import mongoose from 'mongoose';

export const JUDGMENT_CATEGORIES = ['جنائي', 'مدني'];

const judgmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'عنوان الحكم مطلوب'], trim: true },
    appealNumber: { type: String, default: '', trim: true },
    year: { type: Number, min: 1900, max: 2200 },
    category: {
      type: String,
      required: [true, 'التصنيف مطلوب'],
      enum: { values: JUDGMENT_CATEGORIES, message: 'تصنيف غير صالح' },
    },
    pdf: { type: String, required: [true, 'ملف PDF مطلوب'] },
    summary: { type: String, default: '', trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Indexes optimized for 30k+ records: filtering + sorting + text search
judgmentSchema.index({ category: 1, year: -1 });
judgmentSchema.index({ appealNumber: 1 });
judgmentSchema.index({ year: -1 });
judgmentSchema.index({ createdAt: -1 });
// Text index for full-text search on title/appealNumber/summary
judgmentSchema.index(
  { title: 'text', appealNumber: 'text', summary: 'text' },
  { weights: { title: 5, appealNumber: 3, summary: 1 }, default_language: 'none' }
);

export default mongoose.model('Judgment', judgmentSchema);
