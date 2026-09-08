const mongoose = require('mongoose');

const ORDER_STATUSES = [
  'PENDING',
  'SCREENSHOT_RECEIVED',
  'PAYMENT_VERIFIED',
  'DELIVERED',
  'CANCELLED',
];

const OrderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      // generated server-side, e.g. ORD-20260902-0001
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    price: { type: Number, required: true },
    currency: { type: String, default: 'INR' },

    customerName: { type: String, trim: true, default: '' },
    customerEmail: { type: String, trim: true, lowercase: true, default: '' },
    customerPhone: { type: String, trim: true, default: '' },
    whatsappNumber: { type: String, trim: true, default: '' },

    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: 'PENDING',
    },
    notes: { type: String, default: '' },

    verifiedAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
  },
  { timestamps: true }
);

OrderSchema.statics.STATUSES = ORDER_STATUSES;

module.exports = mongoose.model('Order', OrderSchema);
