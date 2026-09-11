const { getOrCreateSettings, updateSettings } = require('../services/settings.service');
const { savePreviewImage, previewFilePath } = require('../services/fileStorage.service');
const { isValidImage } = require('../utils/fileSignature');

// Most fields on SiteSettings are meant to be publicly displayed (hero
// copy, about text, WhatsApp number, socials, UPI payment details — the
// product page shows UPI info directly, so it's a deliberate public
// field, not an oversight). Nothing here is a login credential or API
// secret; if that ever changes, exclude the new field the same way.
// _id/createdAt/updatedAt are internal Mongo bookkeeping the frontend
// never reads — no reason to hand them to every visitor.
const PUBLIC_EXCLUDED_FIELDS = ['__v', '_id', 'createdAt', 'updatedAt'];

function toPublicSettings(settings) {
  const obj = settings.toObject ? settings.toObject() : { ...settings };
  for (const field of PUBLIC_EXCLUDED_FIELDS) {
    delete obj[field];
  }
  return obj;
}

async function getSettings(req, res) {
  const settings = await getOrCreateSettings();
  return res.json({ success: true, settings: toPublicSettings(settings) });
}

// Admin-only — the full document, including `upi`, for the settings
// form itself to read and edit.
async function getSettingsAdmin(req, res) {
  const settings = await getOrCreateSettings();
  return res.json({ success: true, settings });
}

// Whitelist what a PUT can touch, so a stray field in the body can't
// clobber _id/timestamps or add junk keys outside the schema.
const ALLOWED_FIELDS = [
  'designerName',
  'logoUrl',
  'faviconUrl',
  'heroTitle',
  'heroSubtitle',
  'heroImageUrl',
  'aboutText',
  'profileImageUrl',
  'whatsappNumber',
  'email',
  'upi',
  'social',
  'footerText',
];

async function putSettings(req, res) {
  const patch = {};
  for (const key of ALLOWED_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(req.body, key)) {
      patch[key] = req.body[key];
    }
  }

  const settings = await updateSettings(patch);
  return res.json({ success: true, settings });
}

// Generic image upload for any settings image field (logo, favicon, hero
// image, profile image, UPI QR) — one endpoint, the frontend decides
// which field to drop the returned URL into. Same public Cloudinary
// storage and magic-byte verification as product/portfolio previews.
async function uploadSettingsImage(req, res) {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded.' });
  }
  if (!isValidImage(req.file.buffer)) {
    return res.status(400).json({
      success: false,
      message: 'File content does not match a valid JPEG, PNG, or WebP image.',
    });
  }

  const key = await savePreviewImage(req.file.buffer, req.file.originalname);
  return res.status(201).json({ success: true, url: previewFilePath(key) });
}

module.exports = { getSettings, getSettingsAdmin, putSettings, uploadSettingsImage };
