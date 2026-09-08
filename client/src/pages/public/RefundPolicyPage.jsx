import ProsePage from '../../components/common/ProsePage';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';

export default function RefundPolicyPage() {
  useDocumentMeta({ title: 'Refund Policy', path: '/refund-policy' });

  return (
    <ProsePage title="Refund Policy">
      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded px-3 py-2">
        Placeholder content — replace with wording reviewed for your jurisdiction before launch.
      </p>

      <h2>Digital products</h2>
      <p>
        Because purchases are digital files delivered directly to you, all sales are final once
        files have been delivered. We're unable to offer refunds after delivery except as
        described below.
      </p>

      <h2>Before delivery</h2>
      <p>
        If payment has been verified but files haven't yet been delivered, contact us via
        WhatsApp and a refund can be arranged.
      </p>

      <h2>Errors on our end</h2>
      <p>
        If you receive the wrong file, a corrupted file, or a design that doesn't match its
        listing, let us know and we'll correct it or issue a refund.
      </p>

      <h2>Custom work</h2>
      <p>
        Refunds for custom design work depend on the stage of the project and are agreed on a
        case-by-case basis before work begins.
      </p>
    </ProsePage>
  );
}
