const { Category, Product } = require('../models');
const { generateUniqueSlug } = require('../services/slug.service');

// Public: enabled categories only, for shop filters/nav.
async function listPublic(req, res) {
  const categories = await Category.find({ enabled: true }).sort({ sortOrder: 1, name: 1 });
  return res.json({ success: true, categories });
}

// Admin: every category regardless of enabled state.
async function listAdmin(req, res) {
  const categories = await Category.find({}).sort({ sortOrder: 1, name: 1 });
  return res.json({ success: true, categories });
}

async function create(req, res) {
  const { name, description = '', enabled = true, sortOrder = 0 } = req.body;
  const slug = await generateUniqueSlug(Category, name);

  const category = await Category.create({ name, slug, description, enabled, sortOrder });
  return res.status(201).json({ success: true, category });
}

async function update(req, res) {
  const { id } = req.params;
  const category = await Category.findById(id);
  if (!category) {
    return res.status(404).json({ success: false, message: 'Category not found.' });
  }

  const { name, description, enabled, sortOrder } = req.body;

  if (name && name !== category.name) {
    category.name = name;
    category.slug = await generateUniqueSlug(Category, name, category._id);
  }
  if (description !== undefined) category.description = description;
  if (enabled !== undefined) category.enabled = enabled;
  if (sortOrder !== undefined) category.sortOrder = sortOrder;

  await category.save();
  return res.json({ success: true, category });
}

async function remove(req, res) {
  const { id } = req.params;

  const inUse = await Product.countDocuments({ category: id });
  if (inUse > 0) {
    return res.status(409).json({
      success: false,
      message: `Cannot delete: ${inUse} product(s) still reference this category. Reassign or delete them first.`,
    });
  }

  const category = await Category.findByIdAndDelete(id);
  if (!category) {
    return res.status(404).json({ success: false, message: 'Category not found.' });
  }
  return res.json({ success: true, message: 'Category deleted.' });
}

// Bulk reorder: [{ id, sortOrder }, ...]
async function reorder(req, res) {
  const { order } = req.body;
  if (!Array.isArray(order)) {
    return res.status(400).json({ success: false, message: '"order" must be an array.' });
  }

  await Promise.all(
    order.map(({ id, sortOrder }) => Category.findByIdAndUpdate(id, { sortOrder }))
  );

  const categories = await Category.find({}).sort({ sortOrder: 1, name: 1 });
  return res.json({ success: true, categories });
}

module.exports = { listPublic, listAdmin, create, update, remove, reorder };
