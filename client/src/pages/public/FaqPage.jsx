import { useDocumentMeta } from '../../hooks/useDocumentMeta';

const FAQS = [
  {
    q: 'How does ordering work?',
    a: "Choose a design in the shop and click \"Order via WhatsApp.\" I'll share UPI payment details in the chat — once you've paid, send a screenshot and I'll verify it personally before delivering your files.",
  },
  {
    q: 'How do I pay?',
    a: 'Payment is by UPI transfer, confirmed manually — there is no in-app checkout or card payment.',
  },
  {
    q: 'How long does delivery take?',
    a: 'Files are delivered by hand shortly after payment is verified, usually within the same day.',
  },
  {
    q: 'What file formats do I get?',
    a: "It depends on the design — check the \"File format\" and \"Included files\" details on each product page before ordering.",
  },
  {
    q: 'Can I get a refund?',
    a: 'See the Refund Policy page for the full digital-goods refund terms.',
  },
  {
    q: 'Can you design something custom for me?',
    a: 'Yes — use the Custom Design page to describe your project and I\'ll follow up with next steps.',
  },
];

export default function FaqPage() {
  useDocumentMeta({ title: 'FAQ', path: '/faq' });

  return (
    <div className="mx-auto max-w-2xl px-6 md:px-10 py-16">
      <h1 className="font-serif text-4xl">Frequently Asked Questions</h1>
      <div className="mt-10 divide-y divide-ink/10">
        {FAQS.map((item) => (
          <div key={item.q} className="py-6">
            <h2 className="font-serif text-lg">{item.q}</h2>
            <p className="mt-2 text-sm text-ink/70 leading-relaxed">{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
