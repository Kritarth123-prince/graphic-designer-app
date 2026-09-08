const { body } = require('express-validator');

const portfolioValidator = [
  body('title').trim().notEmpty().withMessage('Title is required.').isLength({ max: 150 }),
  body('client').optional().isString().trim(),
  body('year').optional().isInt({ min: 1990, max: 2100 }),
  body('category').optional().isString().trim(),
  body('description').optional().isString(),
  body('brief').optional().isString(),
  body('creativeDirection').optional().isString(),
  body('process').optional().isString(),
  body('finalResult').optional().isString(),
  body('featured').optional().isBoolean(),
];

module.exports = { portfolioValidator };
