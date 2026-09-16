import { useState } from 'react';
import { submitCustomDesignRequest } from '../../services/customDesign.service';
import { useToast } from '../../context/ToastContext';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';

const SERVICES = [
  'Social media designs',
  'Business posters',
  'Event creatives',
  'Promotional artwork',
  'Branding graphics',
  'Custom campaigns',
];

const emptyForm = {
  name: '',
  email: '',
  whatsapp: '',
  designType: '',
  projectDescription: '',
  dimensions: '',
  quantity: 1,
  budget: '',
  deadline: '',
};

export default function CustomDesignPage() {
  useDocumentMeta({
    title: 'Custom Design Request',
    description: 'Commission a custom design — social posts, posters, branding, and more, made to your brief.',
    path: '/custom-design',
  });

  const { showToast } = useToast();
  const [form, setForm] = useState(emptyForm);
  const [referenceFile, setReferenceFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitCustomDesignRequest({ ...form, referenceFile });
      setSubmitted(true);
      showToast('Your custom design request has been sent successfully.');
    } catch (err) {
      showToast(err?.response?.data?.message || 'Something went wrong. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-32 text-center">
        <h1 className="font-serif text-3xl">Thank you.</h1>
        <p className="mt-4 text-ink/60">
          Your request has been received — I'll follow up with next steps soon.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 md:px-10 py-16">
      <h1 className="font-serif text-4xl md:text-5xl max-w-xl">
        Have something specific in mind?
      </h1>
      <p className="mt-4 text-ink/60 max-w-md">
        Let's create something made for you.
      </p>

      <div className="mt-10 flex flex-wrap gap-3">
        {SERVICES.map((service) => (
          <span key={service} className="text-xs border border-ink/15 rounded-full px-3 py-1.5 text-ink/60">
            {service}
          </span>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-14 space-y-6 max-w-2xl">
        <div className="grid md:grid-cols-2 gap-6">
          <label className="block text-sm">
            Name *
            <input
              required
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              className="mt-1 w-full bg-transparent border-b border-ink/20 py-2 focus:border-gold outline-none"
            />
          </label>
          <label className="block text-sm">
            Email *
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setField('email', e.target.value)}
              className="mt-1 w-full bg-transparent border-b border-ink/20 py-2 focus:border-gold outline-none"
            />
          </label>
        </div>

        <label className="block text-sm">
          WhatsApp *
          <input
            required
            value={form.whatsapp}
            onChange={(e) => setField('whatsapp', e.target.value)}
            placeholder="+91 99999 99999"
            className="mt-1 w-full bg-transparent border-b border-ink/20 py-2 focus:border-gold outline-none"
          />
        </label>

        <label className="block text-sm">
          Design Type *
          <input
            required
            value={form.designType}
            onChange={(e) => setField('designType', e.target.value)}
            placeholder="e.g. Event poster, brand identity, social media set"
            className="mt-1 w-full bg-transparent border-b border-ink/20 py-2 focus:border-gold outline-none"
          />
        </label>

        <label className="block text-sm">
          Project Description *
          <textarea
            required
            rows={5}
            value={form.projectDescription}
            onChange={(e) => setField('projectDescription', e.target.value)}
            className="mt-1 w-full bg-transparent border-b border-ink/20 py-2 focus:border-gold outline-none"
          />
        </label>

        <div className="grid md:grid-cols-3 gap-6">
          <label className="block text-sm">
            Dimensions
            <input
              value={form.dimensions}
              onChange={(e) => setField('dimensions', e.target.value)}
              className="mt-1 w-full bg-transparent border-b border-ink/20 py-2 focus:border-gold outline-none"
            />
          </label>
          <label className="block text-sm">
            Quantity
            <input
              type="number"
              min="1"
              value={form.quantity}
              onChange={(e) => setField('quantity', e.target.value)}
              className="mt-1 w-full bg-transparent border-b border-ink/20 py-2 focus:border-gold outline-none"
            />
          </label>
          <label className="block text-sm">
            Budget
            <input
              value={form.budget}
              onChange={(e) => setField('budget', e.target.value)}
              className="mt-1 w-full bg-transparent border-b border-ink/20 py-2 focus:border-gold outline-none"
            />
          </label>
        </div>

        <label className="block text-sm">
          Deadline
          <input
            type="date"
            value={form.deadline}
            onChange={(e) => setField('deadline', e.target.value)}
            className="mt-1 w-full bg-transparent border-b border-ink/20 py-2 focus:border-gold outline-none"
          />
        </label>

        <label className="block text-sm">
          Reference File (optional)
          <input
            type="file"
            onChange={(e) => setReferenceFile(e.target.files?.[0] || null)}
            className="mt-2 block text-xs text-ink/50"
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="bg-ink text-ivory px-8 py-3 text-sm tracking-wide hover:bg-charcoal transition-colors disabled:opacity-60"
        >
          {submitting ? 'Sending…' : 'Start a Project'}
        </button>
      </form>
    </div>
  );
}
