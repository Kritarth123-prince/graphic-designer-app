const { body } = require('express-validator');

const categoryValidator = [
  body('name').trim().notEmpty().withMessage('Name is required.').isLength({ max: 80 }),
  body('description').optional().isString().trim().isLength({ max: 300 }),
  body('enabled').optional().isBoolean(),
  body('sortOrder').optional().isInt(),
];

module.exports = { categoryValidator };
