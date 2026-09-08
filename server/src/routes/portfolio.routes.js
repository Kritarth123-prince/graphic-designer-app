const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/portfolio.controller');
const filesCtrl = require('../controllers/portfolioFiles.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { portfolioValidator } = require('../validators/portfolio.validator');
const { handleValidation } = require('../middleware/validate.middleware');
const { asyncHandler } = require('../utils/asyncHandler');
const { uploadPreviewImages, handleUploadErrors } = require('../middleware/upload.middleware');

// ---- Public ----
router.get('/', asyncHandler(ctrl.listPublic));
router.get('/:slug', asyncHandler(ctrl.getPublicBySlug));

// ---- Admin ----
router.get('/admin/all', requireAuth, asyncHandler(ctrl.listAdmin));
router.get('/admin/:id', requireAuth, asyncHandler(ctrl.getAdminById));
router.post('/admin', requireAuth, portfolioValidator, handleValidation, asyncHandler(ctrl.create));
router.put('/admin/:id', requireAuth, portfolioValidator, handleValidation, asyncHandler(ctrl.update));
router.delete('/admin/:id', requireAuth, asyncHandler(ctrl.remove));

router.put('/admin/:id/publish', requireAuth, asyncHandler(ctrl.publish));
router.put('/admin/:id/unpublish', requireAuth, asyncHandler(ctrl.unpublish));

router.post(
  '/admin/:id/images',
  requireAuth,
  uploadPreviewImages.array('images', 10),
  handleUploadErrors,
  asyncHandler(filesCtrl.addImages)
);
router.delete('/admin/:id/images/:imageId', requireAuth, asyncHandler(filesCtrl.removeImage));

module.exports = router;
