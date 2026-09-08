const mongoose = require('mongoose');

const ContactInquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true, default: '' },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    attachment: {
      storageKey: { type: String, default: null },
      originalName: { type: String, default: null },
    },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ContactInquiry', ContactInquirySchema);
