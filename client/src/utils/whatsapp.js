/**
 * Builds a WhatsApp click-to-chat URL pre-filled with order details.
 * The number comes from SiteSettings — never hard-code it in a component.
 *
 * Pass orderId (from POST /api/orders) when available so the designer
 * can match the WhatsApp conversation back to the tracked order record.
 * The link still works without one — order-record creation should never
 * block the actual ordering action if it fails.
 */
export function buildWhatsAppOrderUrl({ whatsappNumber, product, orderId, customerName }) {
  if (!whatsappNumber || !product) return null;

  const digits = whatsappNumber.replace(/[^\d]/g, '');
  const lines = ['Hello, I would like to purchase:', ''];
  if (customerName) lines.push(`My name is ${customerName}.`, '');
  lines.push(
    `Product: ${product.title}`,
    `Product ID: ${product.productId}`,
    `Price: ${product.currency || 'INR'} ${product.price}`
  );
  if (orderId) lines.push(`Order Reference: ${orderId}`);
  lines.push('', 'I found this design on your website.', 'Please share the payment details.');

  return `https://wa.me/${digits}?text=${encodeURIComponent(lines.join('\n'))}`;
}
