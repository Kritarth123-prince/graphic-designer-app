import ProsePage from '../../components/common/ProsePage';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';

export default function TermsPage() {
  useDocumentMeta({ title: 'Terms', path: '/terms' });

  return (
    <ProsePage title="Terms">
      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded px-3 py-2">
        Placeholder content — replace with wording reviewed for your jurisdiction before launch.
      </p>

      <h2>Use of designs</h2>
      <p>
        Digital designs purchased through this site are for the license/usage terms stated on
        each product page. Reselling, redistributing, or claiming original authorship of
        purchased designs is not permitted unless explicitly stated.
      </p>

      <h2>Custom work</h2>
      <p>
        Custom design requests are quoted individually. Scope, pricing, and delivery timelines
        for custom work are agreed directly over WhatsApp or email before work begins.
      </p>

      <h2>Payments</h2>
      <p>
        All payments are made via UPI and verified manually. Orders are not confirmed or
        fulfilled until payment has been verified.
      </p>

      <h2>Changes</h2>
      <p>These terms may be updated from time to time; the current version always applies.</p>
    </ProsePage>
  );
}
