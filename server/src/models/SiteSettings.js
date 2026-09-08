const mongoose = require('mongoose');

// Only one document of this collection should ever exist.
// Enforced in the settings service (findOne + upsert), not by a unique
// field, since there's nothing natural to index on.
const SiteSettingsSchema = new mongoose.Schema(
  {
    designerName: { type: String, default: '' },
    logoUrl: { type: String, default: '' },
    faviconUrl: { type: String, default: '' },

    heroTitle: { type: String, default: '' },
    heroSubtitle: { type: String, default: '' },
    heroImageUrl: { type: String, default: '' },

    aboutText: { type: String, default: '' },
    profileImageUrl: { type: String, default: '' },

    whatsappNumber: { type: String, default: '' }, // E.164, e.g. +919999999999
    email: { type: String, default: '' },

    upi: {
      id: { type: String, default: '' },
      displayName: { type: String, default: '' },
      qrImageUrl: { type: String, default: '' },
      instructions: { type: String, default: '' },
    },

    social: {
      instagram: { type: String, default: '' },
      behance: { type: String, default: '' },
      dribbble: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      other: [
        {
          label: { type: String },
          url: { type: String },
        },
      ],
    },

    footerText: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SiteSettings', SiteSettingsSchema);
