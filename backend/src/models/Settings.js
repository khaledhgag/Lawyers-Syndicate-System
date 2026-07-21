import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    // singleton document
    key: { type: String, default: 'main', unique: true },
    unionName: { type: String, default: 'نقابة محامين جنوب القليوبية' },
    logo: { type: String, default: '' },
    banner: { type: String, default: '' },
    aboutTitle: { type: String, default: 'عن النقابة' },
    aboutText: { type: String, default: '' },
    address: { type: String, default: '' },
    googleMapsLink: { type: String, default: '' },
    googleMapsEmbed: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    workingHours: { type: String, default: '' },
    // Floating WhatsApp button
    whatsappNumber: { type: String, default: '' },
    whatsappMessage: {
      type: String,
      default: 'السلام عليكم، تواصلت معكم من خلال الموقع الإلكتروني لنقابة محامين جنوب القليوبية 🌐',
    },
    social: {
      facebook: { type: String, default: '' },
      twitter: { type: String, default: '' },
      youtube: { type: String, default: '' },
      instagram: { type: String, default: '' },
      whatsapp: { type: String, default: '' },
      telegram: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

// Get or create the singleton
settingsSchema.statics.getSingleton = async function () {
  let doc = await this.findOne({ key: 'main' });
  if (!doc) doc = await this.create({ key: 'main' });
  return doc;
};

export default mongoose.model('Settings', settingsSchema);
