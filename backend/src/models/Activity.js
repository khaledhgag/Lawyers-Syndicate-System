import mongoose from 'mongoose';

// Default suggestions only — admins may add any category freely.
export const ACTIVITY_TYPES = ['رحلات النقابة', 'الأنشطة الاجتماعية'];

const activitySchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'العنوان مطلوب'], trim: true },
    description: { type: String, required: [true, 'الوصف مطلوب'], trim: true },
    date: { type: Date, required: [true, 'التاريخ مطلوب'] },
    type: {
      type: String,
      required: [true, 'نوع النشاط مطلوب'],
      trim: true,
    },
    gallery: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

activitySchema.index({ type: 1, date: -1 });

export default mongoose.model('Activity', activitySchema);
