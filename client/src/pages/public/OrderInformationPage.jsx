import ProsePage from '../../components/common/ProsePage';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';

export default function OrderInformationPage() {
  useDocumentMeta({ title: 'Order Information', path: '/order-information' });

  return (
    <ProsePage title="Order Information">
      <h2>What you receive</h2>
      <p>
        Each product page lists exactly what's included — file formats, dimensions, and any
        bundled files. You receive the final, unwatermarked design files after payment is
        verified.
      </p>

      <h2>How ordering works</h2>
      <p>
        There are no accounts and no in-app checkout. Click "Order via WhatsApp" on any product,
        and I'll share UPI payment details directly in the chat.
      </p>

      <h2>Payment</h2>
      <p>
        Payment is made by UPI transfer to the ID shared in WhatsApp. After paying, send a
        screenshot of the payment in the same chat.
      </p>

      <h2>Verification &amp; delivery</h2>
      <p>
        I verify every payment personally before delivering files — there is no automatic
        payment confirmation. Once verified, files are sent to you directly, usually the same
        day.
      </p>
    </ProsePage>
  );
}
