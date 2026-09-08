const { body } = require('express-validator');

const contactValidator = [
  body('name').trim().notEmpty().withMessage('Name is required.').isLength({ max: 120 }),
  body('email').isEmail().withMessage('A valid email is required.').normalizeEmail(),
  body('phone').optional().isString().trim().isLength({ max: 30 }),
  body('subject').trim().notEmpty().withMessage('Subject is required.').isLength({ max: 150 }),
  body('message').trim().notEmpty().withMessage('Message is required.').isLength({ max: 5000 }),
];

module.exports = { contactValidator };
