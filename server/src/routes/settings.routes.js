const express = require('express');
const router = express.Router();

const { getSettings, getSettingsAdmin, putSettings, uploadSettingsImage } = require('../controllers/settings.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { settingsValidator } = require('../validators/settings.validator');
const { handleValidation } = require('../middleware/validate.middleware');
const { asyncHandler } = require('../utils/asyncHandler');
const { uploadPreviewImages, handleUploadErrors } = require('../middleware/upload.middleware');

router.get('/', asyncHandler(getSettings));
router.get('/admin', requireAuth, asyncHandler(getSettingsAdmin));
router.put('/', requireAuth, settingsValidator, handleValidation, asyncHandler(putSettings));
router.post(
  '/admin/image',
  requireAuth,
  uploadPreviewImages.single('image'),
  handleUploadErrors,
  asyncHandler(uploadSettingsImage)
);

module.exports = router;
