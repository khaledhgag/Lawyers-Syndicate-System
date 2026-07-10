import mongoose from 'mongoose';

const contractSchema = new mongoose.Schema(
  {
    organizationName: { type: String, required: [true, 'اسم الجهة مطلوب'], trim: true },
    description: { type: String, required: [true, 'الوصف مطلوب'], trim: true },
    benefits: { type: String, default: '', trim: true },
    contactInfo: { type: String, default: '', trim: true },
    image: { type: String, default: '' },
    date: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

contractSchema.index({ date: -1, createdAt: -1 });

export default mongoose.model('Contract', contractSchema);
