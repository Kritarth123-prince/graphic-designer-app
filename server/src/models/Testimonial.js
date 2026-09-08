const mongoose = require('mongoose');

const TestimonialSchema = new mongoose.Schema(
  {
    clientName: { type: String, required: true, trim: true },
    clientTitle: { type: String, trim: true, default: '' },
    quote: { type: String, required: true },
    avatarUrl: { type: String, default: '' },
    published: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Testimonial', TestimonialSchema);
