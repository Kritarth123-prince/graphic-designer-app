const { body } = require('express-validator');
const { CustomDesignRequest } = require('../models');

const customDesignValidator = [
  body('name').trim().notEmpty().withMessage('Name is required.').isLength({ max: 120 }),
  body('email').isEmail().withMessage('A valid email is required.').normalizeEmail(),
  body('whatsapp').trim().notEmpty().withMessage('WhatsApp number is required.').isLength({ max: 30 }),
  body('designType').trim().notEmpty().withMessage('Design type is required.').isLength({ max: 120 }),
  body('projectDescription').trim().notEmpty().withMessage('Project description is required.'),
  body('dimensions').optional().isString().trim(),
  body('quantity').optional().isInt({ min: 1 }),
  body('budget').optional().isString().trim(),
  body('deadline').optional().isISO8601().withMessage('Deadline must be a valid date.'),
];

const customDesignStatusValidator = [
  body('status')
    .isIn(CustomDesignRequest.STATUSES)
    .withMessage(`Status must be one of: ${CustomDesignRequest.STATUSES.join(', ')}`),
];

module.exports = { customDesignValidator, customDesignStatusValidator };
