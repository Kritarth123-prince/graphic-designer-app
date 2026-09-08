const mongoose = require('mongoose');

const STATUSES = ['NEW', 'IN_REVIEW', 'QUOTED', 'ACCEPTED', 'CLOSED'];

const CustomDesignRequestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    whatsapp: { type: String, required: true, trim: true },
    designType: { type: String, required: true, trim: true },
    projectDescription: { type: String, required: true },
    dimensions: { type: String, trim: true, default: '' },
    quantity: { type: Number, default: 1 },
    budget: { type: String, trim: true, default: '' },
    deadline: { type: Date, default: null },
    referenceFile: {
      storageKey: { type: String, default: null },
      originalName: { type: String, default: null },
    },
    status: {
      type: String,
      enum: STATUSES,
      default: 'NEW',
    },
  },
  { timestamps: true }
);

CustomDesignRequestSchema.statics.STATUSES = STATUSES;

module.exports = mongoose.model('CustomDesignRequest', CustomDesignRequestSchema);
