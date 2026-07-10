import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'عنوان الكتاب مطلوب'], trim: true },
    appealNumber: { type: String, default: '', trim: true },
    year: { type: Number, min: 1900, max: 2200 },
    pdf: { type: String, required: [true, 'ملف PDF مطلوب'] },
    summary: { type: String, default: '', trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Indexes optimized for large datasets: filtering + sorting + text search
bookSchema.index({ appealNumber: 1 });
bookSchema.index({ year: -1 });
bookSchema.index({ createdAt: -1 });
// Text index for full-text search on title/appealNumber/summary
bookSchema.index(
  { title: 'text', appealNumber: 'text', summary: 'text' },
  { weights: { title: 5, appealNumber: 3, summary: 1 }, default_language: 'none' }
);

export default mongoose.model('Book', bookSchema);
