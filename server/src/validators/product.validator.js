const { body } = require('express-validator');

const productValidator = [
  body('title').trim().notEmpty().withMessage('Title is required.').isLength({ max: 150 }),
  body('description').trim().notEmpty().withMessage('Description is required.'),
  body('shortDescription').optional().isString().trim().isLength({ max: 200 }),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number.'),
  body('currency').optional().isString().trim().isLength({ min: 3, max: 3 }),
  body('category').isMongoId().withMessage('A valid category is required.'),
  body('dimensions').optional().isString().trim(),
  body('format').optional().isString().trim(),
  body('includedFiles').optional().isArray(),
  body('tags').optional().isArray(),
  body('featured').optional().isBoolean(),
  body('productId').optional().isString().trim().matches(/^[A-Z0-9-]+$/i),
];

module.exports = { productValidator };
