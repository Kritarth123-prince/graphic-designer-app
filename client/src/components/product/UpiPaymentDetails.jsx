import { useState } from 'react';

export default function UpiPaymentDetails({ upi }) {
  const [copied, setCopied] = useState(false);
  const [qrExpanded, setQrExpanded] = useState(false);

  if (!upi?.id) return null;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(upi.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API can fail (permissions, non-secure context) — the
      // UPI ID is still shown as plain text either way, so this isn't
      // a dead end for the customer, just a lost convenience.
    }
  }

  return (
    <div className="mt-4 border border-ink/10 p-4 text-sm">
      <p className="text-xs text-ink/40 uppercase tracking-wide">Pay via UPI</p>

      <div className="mt-2 flex items-center justify-between gap-3">
        <span className="font-mono truncate min-w-0">{upi.id}</span>
        <button
          onClick={handleCopy}
          className="text-xs border-b border-gold pb-0.5 shrink-0"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      {upi.qrImageUrl && (
        <button
          onClick={() => setQrExpanded(true)}
          className="mt-3 block cursor-zoom-in"
          aria-label="Expand UPI QR code"
        >
          <img src={upi.qrImageUrl} alt="UPI QR code" className="w-32 h-32 object-contain" />
        </button>
      )}

      {upi.instructions && (
        <p className="mt-3 text-xs text-ink/60 leading-relaxed">{upi.instructions}</p>
      )}

      {qrExpanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4"
          onClick={() => setQrExpanded(false)}
        >
          <div
            className="relative bg-ivory w-full max-w-xs p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setQrExpanded(false)}
              aria-label="Close"
              className="absolute top-3 right-3 text-ink/40 hover:text-ink text-lg leading-none"
            >
              ✕
            </button>
            <p className="text-xs text-ink/40 uppercase tracking-wide">Scan to pay</p>
            <img
              src={upi.qrImageUrl}
              alt="UPI QR code"
              className="mt-4 w-full max-w-[240px] aspect-square object-contain mx-auto"
            />
            <p className="mt-4 font-mono text-sm">{upi.id}</p>
          </div>
        </div>
      )}
    </div>
  );
}
