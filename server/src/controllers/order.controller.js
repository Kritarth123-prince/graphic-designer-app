const { Order, Product } = require('../models');
const { generateOrderId } = require('../services/orderId.service');

// Escapes regex metacharacters so user-supplied search text is matched
// literally, preventing catastrophic-backtracking (ReDoS) patterns.
// req.query.q can be a non-string (e.g. ?q[x]=1 parses to an object),
// so this only treats actual strings as search text.
function escapeRegExp(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ---------- Public ----------

// Created when the customer clicks "Order via WhatsApp" on the product
// page — a lightweight tracking record, not a checkout. Customer contact
// fields are optional since the spec keeps the buyer flow account-free;
// the designer fills in what she learns from the WhatsApp conversation.
async function create(req, res) {
  const product = await Product.findOne({ _id: req.body.productId, status: 'published', published: true });
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found or not available.' });
  }

  const orderId = await generateOrderId();

  const order = await Order.create({
    orderId,
    product: product._id,
    productId: product.productId,
    productName: product.title,
    price: product.price,
    currency: product.currency,
    customerName: req.body.customerName || '',
    customerEmail: req.body.customerEmail || '',
    customerPhone: req.body.customerPhone || '',
    whatsappNumber: req.body.whatsappNumber || '',
    status: 'PENDING',
  });

  return res.status(201).json({
    success: true,
    order: { orderId: order.orderId, id: order._id },
  });
}

// ---------- Admin ----------

async function listAdmin(req, res) {
  const { q, status, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (q) {
    const safeQ = new RegExp(escapeRegExp(q), 'i');
    filter.$or = [
      { orderId: safeQ },
      { productName: safeQ },
      { customerName: safeQ },
      { customerEmail: safeQ },
      { customerPhone: safeQ },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Order.countDocuments(filter),
  ]);

  return res.json({ success: true, orders, total, page: pageNum, pages: Math.ceil(total / limitNum) });
}

async function getAdminById(req, res) {
  const order = await Order.findById(req.params.id).populate('product', 'title slug thumbnail');
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }
  return res.json({ success: true, order });
}

// Editable admin fields that aren't the status workflow — e.g. filling in
// customer contact details learned over WhatsApp, or adding a note.
async function update(req, res) {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }

  const editableFields = ['customerName', 'customerEmail', 'customerPhone', 'notes'];
  for (const field of editableFields) {
    if (req.body[field] !== undefined) order[field] = req.body[field];
  }

  await order.save();
  return res.json({ success: true, order });
}

async function updateStatus(req, res) {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }

  const { status, notes } = req.body;
  order.status = status;
  if (notes !== undefined) order.notes = notes;

  if (status === 'PAYMENT_VERIFIED' && !order.verifiedAt) {
    order.verifiedAt = new Date();
  }
  if (status === 'DELIVERED' && !order.deliveredAt) {
    order.deliveredAt = new Date();
  }

  await order.save();
  return res.json({ success: true, order });
}

module.exports = { create, listAdmin, getAdminById, update, updateStatus };
