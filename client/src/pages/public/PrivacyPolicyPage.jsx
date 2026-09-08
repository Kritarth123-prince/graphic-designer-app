import ProsePage from '../../components/common/ProsePage';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';

export default function PrivacyPolicyPage() {
  useDocumentMeta({ title: 'Privacy Policy', path: '/privacy-policy' });

  return (
    <ProsePage title="Privacy Policy">
      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded px-3 py-2">
        Placeholder content — replace with wording reviewed for your jurisdiction before launch.
      </p>

      <h2>Information we collect</h2>
      <p>
        When you place an order or send a message, we collect the details you provide — name,
        email, and WhatsApp number — to fulfill your order or respond to your inquiry. We do not
        require an account to browse or order.
      </p>

      <h2>How it's used</h2>
      <p>
        Your information is used only to process orders, deliver files, and respond to inquiries
        or custom requests. We do not sell or share your information with third parties, other
        than the services that keep this site running (hosting, database, and email delivery).
      </p>

      <h2>Payment information</h2>
      <p>
        Payments are made directly via UPI outside this website. We do not process, store, or
        have access to your banking or payment credentials.
      </p>

      <h2>Contact</h2>
      <p>For any privacy questions, reach out via the Contact page.</p>
    </ProsePage>
  );
}
