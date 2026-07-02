import mongoose from 'mongoose';

const governmentLinkSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'اسم الموقع مطلوب'], trim: true },
    description: { type: String, default: '', trim: true },
    url: { type: String, required: [true, 'الرابط مطلوب'], trim: true },
    icon: { type: String, default: '' },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('GovernmentLink', governmentLinkSchema);
