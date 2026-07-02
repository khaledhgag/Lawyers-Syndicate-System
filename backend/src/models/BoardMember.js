import mongoose from 'mongoose';

const boardMemberSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: [true, 'الاسم الكامل مطلوب'], trim: true },
    position: { type: String, required: [true, 'المنصب مطلوب'], trim: true },
    bio: { type: String, trim: true, default: '' },
    photo: { type: String, default: '' },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

boardMemberSchema.index({ order: 1 });

export default mongoose.model('BoardMember', boardMemberSchema);
