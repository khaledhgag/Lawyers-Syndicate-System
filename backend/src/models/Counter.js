import mongoose from 'mongoose';

// Atomic per-key sequence (e.g. 'complaint-2026') for human-readable numbers.
const counterSchema = new mongoose.Schema({
  _id: { type: String },
  seq: { type: Number, default: 0 },
});

counterSchema.statics.next = async function (key) {
  const doc = await this.findByIdAndUpdate(
    key,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return doc.seq;
};

export default mongoose.model('Counter', counterSchema);
