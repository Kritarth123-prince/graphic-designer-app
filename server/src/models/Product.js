const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      // e.g. POSTER-001
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    shortDescription: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    // Publicly servable preview images (watermarked as needed)
    previewImages: [
      {
        url: { type: String, required: true },
        storageKey: { type: String, required: true }, // needed to delete the file later; url alone isn't enough
        alt: { type: String, default: '' },
      },
    ],
    // Auto-populated from the first uploaded preview image — never
    // required at creation, since a product has no images until after
    // it already exists. Enforced instead at publish time (see
    // product.controller.js) so a draft can exist without one.
    thumbnail: {
      type: String,
      default: '',
    },
    // Original design file — never exposed via public API; resolved
    // server-side only, after manual order verification.
    file: {
      storageKey: { type: String, default: null }, // private object-storage key, not a public URL
      originalName: { type: String, default: null },
      mimeType: { type: String, default: null },
      size: { type: Number, default: null },
    },
    dimensions: {
      type: String, // e.g. "18in x 24in"
      trim: true,
    },
    format: {
      type: String, // e.g. "PSD, PNG, PDF"
      trim: true,
    },
    includedFiles: [{ type: String }],
    tags: [{ type: String, lowercase: true, trim: true }],
    featured: {
      type: Boolean,
      default: false,
    },
    published: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    seo: {
      title: { type: String, default: '' },
      metaDescription: { type: String, default: '' },
      ogImage: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

ProductSchema.index({ title: 'text', description: 'text', tags: 'text', productId: 'text' });

module.exports = mongoose.model('Product', ProductSchema);
