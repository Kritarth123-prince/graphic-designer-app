import { useState } from 'react';
import { submitContact } from '../../services/contact.service';
import { useToast } from '../../context/ToastContext';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';

const emptyForm = { name: '', email: '', phone: '', subject: '', message: '' };

export default function ContactPage() {
  useDocumentMeta({
    title: 'Contact',
    description: 'Get in touch about a project, a question, or anything else.',
    path: '/contact',
  });

  const { showToast } = useToast();
  const [form, setForm] = useState(emptyForm);
  const [attachment, setAttachment] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitContact({ ...form, attachment });
      setSubmitted(true);
      showToast('Your message has been sent successfully.');
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
          Your message has been received — I'll get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 md:px-10 py-16">
      <h1 className="font-serif text-4xl md:text-5xl">Have a project in mind?</h1>
      <p className="mt-4 text-ink/60">
        Tell me what you're building, and let's turn the idea into something visual.
      </p>

      <form onSubmit={handleSubmit} className="mt-12 space-y-6">
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
          WhatsApp / Phone
          <input
            value={form.phone}
            onChange={(e) => setField('phone', e.target.value)}
            className="mt-1 w-full bg-transparent border-b border-ink/20 py-2 focus:border-gold outline-none"
          />
        </label>

        <label className="block text-sm">
          Subject *
          <input
            required
            value={form.subject}
            onChange={(e) => setField('subject', e.target.value)}
            className="mt-1 w-full bg-transparent border-b border-ink/20 py-2 focus:border-gold outline-none"
          />
        </label>

        <label className="block text-sm">
          Message *
          <textarea
            required
            rows={5}
            value={form.message}
            onChange={(e) => setField('message', e.target.value)}
            className="mt-1 w-full bg-transparent border-b border-ink/20 py-2 focus:border-gold outline-none"
          />
        </label>

        <label className="block text-sm">
          Attachment (optional)
          <input
            type="file"
            onChange={(e) => setAttachment(e.target.files?.[0] || null)}
            className="mt-2 block text-xs text-ink/50"
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="bg-ink text-ivory px-8 py-3 text-sm tracking-wide hover:bg-charcoal transition-colors disabled:opacity-60"
        >
          {submitting ? 'Sending…' : 'Send Message'}
        </button>
      </form>
    </div>
  );
}
