const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/customDesign.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { customDesignLimiter } = require('../middleware/rateLimit.middleware');
const { customDesignValidator, customDesignStatusValidator } = require('../validators/customDesign.validator');
const { handleValidation } = require('../middleware/validate.middleware');
const { asyncHandler } = require('../utils/asyncHandler');
const { uploadContactAttachment, handleUploadErrors } = require('../middleware/upload.middleware');

// ---- Public ----
router.post(
  '/',
  customDesignLimiter,
  uploadContactAttachment.single('referenceFile'),
  handleUploadErrors,
  customDesignValidator,
  handleValidation,
  asyncHandler(ctrl.submit)
);

// ---- Admin ----
router.get('/admin/all', requireAuth, asyncHandler(ctrl.listAdmin));
router.get('/admin/:id', requireAuth, asyncHandler(ctrl.getAdminById));
router.put(
  '/admin/:id/status',
  requireAuth,
  customDesignStatusValidator,
  handleValidation,
  asyncHandler(ctrl.updateStatus)
);
router.delete('/admin/:id', requireAuth, asyncHandler(ctrl.remove));
router.get('/admin/:id/reference-file', requireAuth, asyncHandler(ctrl.downloadReferenceFile));

module.exports = router;
