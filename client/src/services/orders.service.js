import api from './api';

// Fire-and-forget-friendly: the caller should still let the customer
// through to WhatsApp even if this fails (tracking, not gatekeeping).
export async function createOrder({ productId, customerName, customerEmail, customerPhone }) {
  const { data } = await api.post('/orders', { productId, customerName, customerEmail, customerPhone });
  return data.order; // { orderId, id }
}
