/**
 * Canned client-facing messages for each order status, used by the admin
 * Orders page so the designer doesn't have to retype the same updates.
 * Editable in the UI before sending — these are just a starting draft.
 */
export function getOrderStatusMessage(order) {
  const name = order.customerName || 'there';
  const product = order.productName || 'your order';

  switch (order.status) {
    case 'PENDING':
      return `Hi ${name}, we've received your order ${order.orderId} for ${product}. Please complete the payment and share the screenshot so we can verify it.`;
    case 'SCREENSHOT_RECEIVED':
      return `Hi ${name}, we've received your payment screenshot for order ${order.orderId}. We're verifying it now and will confirm shortly.`;
    case 'PAYMENT_VERIFIED':
      return `Hi ${name}, good news — your payment for order ${order.orderId} (${product}) has been verified. We're preparing your files now.`;
    case 'DELIVERED':
      return `Hi ${name}, your order ${order.orderId} (${product}) has been delivered. Thank you for your purchase! Let us know if you have any questions.`;
    case 'CANCELLED':
      return `Hi ${name}, your order ${order.orderId} has been cancelled. If you have any questions or this was a mistake, please reach out.`;
    default:
      return `Hi ${name}, here's an update on your order ${order.orderId}.`;
  }
}

export function buildCustomerWhatsAppUrl(phone, message) {
  if (!phone) return null;
  const digits = phone.replace(/[^\d]/g, '');
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
