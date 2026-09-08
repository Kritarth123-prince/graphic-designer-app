const { Order } = require('../models');

function todayPrefix() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `ORD-${y}${m}${d}-`;
}

/**
 * Same caveat as generateProductId: sufficient for a single-admin
 * storefront's order volume, not a hardened atomic counter.
 */
async function generateOrderId() {
  const prefix = todayPrefix();
  const last = await Order.findOne({ orderId: new RegExp(`^${prefix}\\d+$`) })
    .sort({ createdAt: -1 })
    .select('orderId');

  let next = 1;
  if (last) {
    const match = last.orderId.match(/(\d+)$/);
    if (match) next = parseInt(match[1], 10) + 1;
  }

  return `${prefix}${String(next).padStart(4, '0')}`;
}

module.exports = { generateOrderId };
