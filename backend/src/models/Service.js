import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'عنوان الخدمة مطلوب'], trim: true },
    description: { type: String, required: [true, 'الوصف مطلوب'], trim: true },
    details: { type: String, default: '', trim: true },
    image: { type: String, default: '' },
    icon: { type: String, default: '' },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

serviceSchema.index({ order: 1 });

export default mongoose.model('Service', serviceSchema);
