const mongoose = require('mongoose');

const PortfolioProjectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    client: { type: String, trim: true, default: '' },
    year: { type: Number },
    category: { type: String, trim: true, default: '' },
    description: { type: String, default: '' },
    brief: { type: String, default: '' },
    creativeDirection: { type: String, default: '' },
    process: { type: String, default: '' },
    finalResult: { type: String, default: '' },
    images: [
      {
        url: { type: String, required: true },
        storageKey: { type: String, required: true },
        alt: { type: String, default: '' },
      },
    ],
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: false },
    seo: {
      title: { type: String, default: '' },
      metaDescription: { type: String, default: '' },
      ogImage: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PortfolioProject', PortfolioProjectSchema);
