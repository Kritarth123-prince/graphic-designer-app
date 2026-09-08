const { body } = require('express-validator');

const settingsValidator = [
  body('designerName').optional().isString().trim().isLength({ max: 120 }),
  body('logoUrl').optional().isString().trim(),
  body('faviconUrl').optional().isString().trim(),
  body('heroTitle').optional().isString().trim().isLength({ max: 200 }),
  body('heroSubtitle').optional().isString().trim().isLength({ max: 300 }),
  body('heroImageUrl').optional().isString().trim(),
  body('aboutText').optional().isString(),
  body('profileImageUrl').optional().isString().trim(),
  body('whatsappNumber')
    .optional()
    .matches(/^\+?[1-9]\d{7,14}$/)
    .withMessage('WhatsApp number should be in international format, e.g. +919999999999.'),
  body('email').optional().isEmail().withMessage('Invalid email address.').normalizeEmail(),
  body('footerText').optional().isString().trim().isLength({ max: 300 }),

  body('upi.id').optional().isString().trim(),
  body('upi.displayName').optional().isString().trim(),
  body('upi.qrImageUrl').optional().isString().trim(),
  body('upi.instructions').optional().isString(),

  body('social.instagram').optional().isString().trim(),
  body('social.behance').optional().isString().trim(),
  body('social.dribbble').optional().isString().trim(),
  body('social.linkedin').optional().isString().trim(),
  body('social.other').optional().isArray(),
];

module.exports = { settingsValidator };
