const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/product.controller');
const filesCtrl = require('../controllers/productFiles.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { productValidator } = require('../validators/product.validator');
const { handleValidation } = require('../middleware/validate.middleware');
const { asyncHandler } = require('../utils/asyncHandler');
const {
  uploadPreviewImages,
  uploadOriginalFile,
  handleUploadErrors,
} = require('../middleware/upload.middleware');

// ---- Public ----
router.get('/', asyncHandler(ctrl.listPublic));
router.get('/:slug', asyncHandler(ctrl.getPublicBySlug));

// ---- Admin ----
router.get('/admin/all', requireAuth, asyncHandler(ctrl.listAdmin));
router.get('/admin/:id', requireAuth, asyncHandler(ctrl.getAdminById));
router.post('/admin', requireAuth, productValidator, handleValidation, asyncHandler(ctrl.create));
router.put('/admin/:id', requireAuth, asyncHandler(ctrl.update));
router.delete('/admin/:id', requireAuth, asyncHandler(ctrl.remove));

router.put('/admin/:id/publish', requireAuth, asyncHandler(ctrl.publish));
router.put('/admin/:id/unpublish', requireAuth, asyncHandler(ctrl.unpublish));
router.put('/admin/:id/archive', requireAuth, asyncHandler(ctrl.archive));

router.post(
  '/admin/:id/preview-images',
  requireAuth,
  uploadPreviewImages.array('images', 10),
  handleUploadErrors,
  asyncHandler(filesCtrl.addPreviewImages)
);
router.delete(
  '/admin/:id/preview-images/:imageId',
  requireAuth,
  asyncHandler(filesCtrl.removePreviewImage)
);

router.post(
  '/admin/:id/file',
  requireAuth,
  uploadOriginalFile.single('file'),
  handleUploadErrors,
  asyncHandler(filesCtrl.uploadOriginalFile)
);
router.get('/admin/:id/file', requireAuth, asyncHandler(filesCtrl.downloadOriginalFile));

module.exports = router;
