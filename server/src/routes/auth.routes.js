const express = require('express');
const router = express.Router();

const { login, logout, me } = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { loginLimiter } = require('../middleware/rateLimit.middleware');
const { loginValidator } = require('../validators/auth.validator');
const { handleValidation } = require('../middleware/validate.middleware');
const { asyncHandler } = require('../utils/asyncHandler');

router.post('/login', loginLimiter, loginValidator, handleValidation, asyncHandler(login));
router.post('/logout', asyncHandler(logout));
router.get('/me', requireAuth, asyncHandler(me));

module.exports = router;
