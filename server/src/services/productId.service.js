const { Product } = require('../models');

const PREFIX = 'POSTER-';
const PAD_LENGTH = 3;

/**
 * Finds the highest existing POSTER-NNN id and returns the next one.
 * Does not guarantee atomicity under heavy concurrent writes (a proper
 * counter collection would be needed at real scale), but for a single-
 * admin storefront creating products one at a time this is sufficient.
 */
async function generateProductId() {
  const last = await Product.findOne({ productId: new RegExp(`^${PREFIX}\\d+$`) })
    .sort({ createdAt: -1 })
    .select('productId');

  let nextNumber = 1;
  if (last) {
    const match = last.productId.match(/(\d+)$/);
    if (match) nextNumber = parseInt(match[1], 10) + 1;
  }

  return `${PREFIX}${String(nextNumber).padStart(PAD_LENGTH, '0')}`;
}

module.exports = { generateProductId };
