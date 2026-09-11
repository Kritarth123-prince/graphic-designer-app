import { useState } from 'react';

export default function OrderDetailsModal({ open, onClose, onSubmit, submitting }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  if (!open) return null;

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ customerName: name, customerEmail: email, customerPhone: phone });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4" onClick={onClose}>
      <div
        className="bg-ivory w-full max-w-sm p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-modal-title"
      >
        <h2 id="order-modal-title" className="font-serif text-2xl">
          A few details first
        </h2>
        <p className="mt-2 text-sm text-ink/60">
          So I know who I'm chatting with on WhatsApp.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block text-sm">
            Name *
            <input
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full bg-transparent border-b border-ink/20 py-2 focus:border-gold outline-none"
            />
          </label>

          <label className="block text-sm">
            Email *
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full bg-transparent border-b border-ink/20 py-2 focus:border-gold outline-none"
            />
          </label>

          <label className="block text-sm">
            Phone (optional)
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Only if different from your WhatsApp number"
              className="mt-1 w-full bg-transparent border-b border-ink/20 py-2 focus:border-gold outline-none"
            />
          </label>

          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-ink/20 py-3 text-sm hover:border-ink/40 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-ink text-ivory py-3 text-sm tracking-wide hover:bg-charcoal transition-colors disabled:opacity-60"
            >
              {submitting ? 'Continuing…' : 'Continue to WhatsApp'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
