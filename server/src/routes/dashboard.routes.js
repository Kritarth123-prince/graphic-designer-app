const express = require('express');
const router = express.Router();

const { getDashboard } = require('../controllers/dashboard.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { asyncHandler } = require('../utils/asyncHandler');

router.get('/', requireAuth, asyncHandler(getDashboard));

module.exports = router;
