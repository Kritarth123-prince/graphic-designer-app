const { body } = require('express-validator');
const { Order } = require('../models');

const createOrderValidator = [
  body('productId').isMongoId().withMessage('A valid product is required.'),
  body('customerName').optional().isString().trim().isLength({ max: 120 }),
  body('customerEmail').optional().isEmail().withMessage('Invalid email address.').normalizeEmail(),
  body('customerPhone').optional().isString().trim().isLength({ max: 30 }),
];

const updateStatusValidator = [
  body('status').isIn(Order.STATUSES).withMessage(`Status must be one of: ${Order.STATUSES.join(', ')}`),
  body('notes').optional().isString().trim().isLength({ max: 1000 }),
];

const updateOrderValidator = [
  body('customerName').optional().isString().trim().isLength({ max: 120 }),
  body('customerEmail').optional().isEmail().withMessage('Invalid email address.').normalizeEmail(),
  body('customerPhone').optional().isString().trim().isLength({ max: 30 }),
  body('notes').optional().isString().trim().isLength({ max: 1000 }),
];

module.exports = { createOrderValidator, updateStatusValidator, updateOrderValidator };
