const { getOrCreateSettings, updateSettings } = require('../services/settings.service');

// Every field on SiteSettings is meant to be publicly displayed
// (hero copy, WhatsApp number, UPI ID, socials) — none of it is a secret,
// so the public and admin GET responses are the same document.
async function getSettings(req, res) {
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

module.exports = { getSettings, putSettings };
