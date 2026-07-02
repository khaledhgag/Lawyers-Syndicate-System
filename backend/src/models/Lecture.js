import mongoose from 'mongoose';

const lectureSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'العنوان مطلوب'], trim: true },
    description: { type: String, required: [true, 'الوصف مطلوب'], trim: true },
    date: { type: Date, required: [true, 'التاريخ مطلوب'] },
    image: { type: String, default: '' },
    videoUrl: { type: String, default: '', trim: true }, // رابط فيديو يوتيوب
    externalLink: { type: String, default: '', trim: true },
    pdf: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

lectureSchema.index({ date: -1 });

export default mongoose.model('Lecture', lectureSchema);
