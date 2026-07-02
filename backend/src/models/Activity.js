import mongoose from 'mongoose';

export const ACTIVITY_TYPES = ['رحلات', 'اجتماعية'];

const activitySchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'العنوان مطلوب'], trim: true },
    description: { type: String, required: [true, 'الوصف مطلوب'], trim: true },
    date: { type: Date, required: [true, 'التاريخ مطلوب'] },
    type: {
      type: String,
      enum: { values: ACTIVITY_TYPES, message: 'نوع النشاط غير صالح' },
      required: [true, 'نوع النشاط مطلوب'],
    },
    gallery: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

activitySchema.index({ type: 1, date: -1 });

export default mongoose.model('Activity', activitySchema);
