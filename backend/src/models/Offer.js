import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'اسم العرض مطلوب'], trim: true },
    description: { type: String, required: [true, 'الوصف مطلوب'], trim: true },
    discount: { type: String, default: '', trim: true },
    image: { type: String, default: '' },
    date: { type: Date },
    expirationDate: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Virtual: is the offer still valid
offerSchema.virtual('isExpired').get(function () {
  return this.expirationDate ? this.expirationDate < new Date() : false;
});

offerSchema.set('toJSON', { virtuals: true });
offerSchema.set('toObject', { virtuals: true });
offerSchema.index({ date: -1, createdAt: -1 });

export default mongoose.model('Offer', offerSchema);
