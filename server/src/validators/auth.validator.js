const { body } = require('express-validator');

const loginValidator = [
  body('email').isEmail().withMessage('Valid email required.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password required.'),
];

module.exports = { loginValidator };
