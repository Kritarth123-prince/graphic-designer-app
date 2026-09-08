const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/order.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { orderCreateLimiter } = require('../middleware/rateLimit.middleware');
const {
  createOrderValidator,
  updateStatusValidator,
  updateOrderValidator,
} = require('../validators/order.validator');
const { handleValidation } = require('../middleware/validate.middleware');
const { asyncHandler } = require('../utils/asyncHandler');

// ---- Public ----
router.post('/', orderCreateLimiter, createOrderValidator, handleValidation, asyncHandler(ctrl.create));

// ---- Admin ----
router.get('/admin/all', requireAuth, asyncHandler(ctrl.listAdmin));
router.get('/admin/:id', requireAuth, asyncHandler(ctrl.getAdminById));
router.put('/admin/:id', requireAuth, updateOrderValidator, handleValidation, asyncHandler(ctrl.update));
router.put(
  '/admin/:id/status',
  requireAuth,
  updateStatusValidator,
  handleValidation,
  asyncHandler(ctrl.updateStatus)
);

module.exports = router;
