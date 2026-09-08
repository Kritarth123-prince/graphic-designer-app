const express = require('express');
const router = express.Router();

const { getSettings, putSettings } = require('../controllers/settings.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { settingsValidator } = require('../validators/settings.validator');
const { handleValidation } = require('../middleware/validate.middleware');
const { asyncHandler } = require('../utils/asyncHandler');

router.get('/', asyncHandler(getSettings));
router.put('/', requireAuth, settingsValidator, handleValidation, asyncHandler(putSettings));

module.exports = router;
