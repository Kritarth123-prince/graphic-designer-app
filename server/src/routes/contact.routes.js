const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/contact.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { contactSubmitLimiter } = require('../middleware/rateLimit.middleware');
const { contactValidator } = require('../validators/contact.validator');
const { handleValidation } = require('../middleware/validate.middleware');
const { asyncHandler } = require('../utils/asyncHandler');
const { uploadContactAttachment, handleUploadErrors } = require('../middleware/upload.middleware');

// ---- Public ----
router.post(
  '/',
  contactSubmitLimiter,
  uploadContactAttachment.single('attachment'),
  handleUploadErrors,
  contactValidator,
  handleValidation,
  asyncHandler(ctrl.submit)
);

// ---- Admin ----
router.get('/admin/all', requireAuth, asyncHandler(ctrl.listAdmin));
router.get('/admin/:id', requireAuth, asyncHandler(ctrl.getAdminById));
router.put('/admin/:id/read', requireAuth, asyncHandler(ctrl.markRead));
router.put('/admin/:id/unread', requireAuth, asyncHandler(ctrl.markUnread));
router.delete('/admin/:id', requireAuth, asyncHandler(ctrl.remove));
router.get('/admin/:id/attachment', requireAuth, asyncHandler(ctrl.downloadAttachment));

module.exports = router;
