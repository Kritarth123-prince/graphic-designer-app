const STYLES = {
  // Orders
  PENDING: 'bg-amber-100 text-amber-800',
  SCREENSHOT_RECEIVED: 'bg-blue-100 text-blue-800',
  PAYMENT_VERIFIED: 'bg-emerald-100 text-emerald-800',
  DELIVERED: 'bg-neutral-900 text-white',
  CANCELLED: 'bg-red-100 text-red-800',
  // Products
  draft: 'bg-neutral-100 text-neutral-700',
  published: 'bg-emerald-100 text-emerald-800',
  archived: 'bg-amber-100 text-amber-800',
};

export default function StatusBadge({ status }) {
  const style = STYLES[status] || 'bg-neutral-100 text-neutral-700';
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${style}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}
