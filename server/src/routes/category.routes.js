const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/category.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { categoryValidator } = require('../validators/category.validator');
const { handleValidation } = require('../middleware/validate.middleware');
const { asyncHandler } = require('../utils/asyncHandler');

router.get('/', asyncHandler(ctrl.listPublic));

router.get('/admin', requireAuth, asyncHandler(ctrl.listAdmin));
router.post('/admin', requireAuth, categoryValidator, handleValidation, asyncHandler(ctrl.create));
router.put('/admin/reorder', requireAuth, asyncHandler(ctrl.reorder));
router.put('/admin/:id', requireAuth, categoryValidator, handleValidation, asyncHandler(ctrl.update));
router.delete('/admin/:id', requireAuth, asyncHandler(ctrl.remove));

module.exports = router;
