import { Fragment, useEffect, useState } from 'react';
import * as ordersApi from '../../services/adminOrders.service';
import { useToast } from '../../context/ToastContext';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import StatusBadge from '../../components/admin/StatusBadge';

const STATUS_OPTIONS = ['PENDING', 'SCREENSHOT_RECEIVED', 'PAYMENT_VERIFIED', 'DELIVERED', 'CANCELLED'];

// Client-facing message drafts per status, so the admin can copy/paste
// an update into WhatsApp/email instead of writing one from scratch.
const MESSAGE_TEMPLATES = {
  SCREENSHOT_RECEIVED: (o) =>
    `Hi ${o.customerName || 'there'}, your order ${o.orderId} for "${o.productName}" has been accepted. We've received your payment screenshot and are verifying it now.`,
  PAYMENT_VERIFIED: (o) =>
    `Hi ${o.customerName || 'there'}, your payment for order ${o.orderId} ("${o.productName}") has been verified. We're preparing your design and will deliver it soon.`,
  DELIVERED: (o) =>
    `Hi ${o.customerName || 'there'}, your order ${o.orderId} ("${o.productName}") has been delivered. Thank you for choosing us!`,
  CANCELLED: (o) =>
    `Hi ${o.customerName || 'there'}, your order ${o.orderId} ("${o.productName}") has been cancelled. Please reach out if you have any questions.`,
};

export default function OrdersPage() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [notesDraft, setNotesDraft] = useState('');
  const [phoneDraft, setPhoneDraft] = useState('');
  const [phoneEditingId, setPhoneEditingId] = useState(null);
  const [copiedStatus, setCopiedStatus] = useState(null);
  const [messagePrompt, setMessagePrompt] = useState(null); // { orderId, statusKey } | null
  const [cancelTarget, setCancelTarget] = useState(null);

  function load() {
    setLoading(true);
    ordersApi
      .listAdmin({ q: q || undefined, status: status || undefined })
      .then((data) => setOrders(data.orders))
      .finally(() => setLoading(false));
  }
  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status]);

  async function handleStatusChange(order, newStatus) {
    if (newStatus === 'CANCELLED') {
      setCancelTarget(order);
      return;
    }
    try {
      await ordersApi.updateStatus(order._id, newStatus);
      showToast('Order status updated.');
      setMessagePrompt(MESSAGE_TEMPLATES[newStatus] ? { orderId: order._id, statusKey: newStatus } : null);
      load();
    } catch {
      showToast('Something went wrong. Please try again.', 'error');
    }
  }

  async function confirmCancel() {
    try {
      await ordersApi.updateStatus(cancelTarget._id, 'CANCELLED');
      showToast('Order cancelled.');
      setMessagePrompt({ orderId: cancelTarget._id, statusKey: 'CANCELLED' });
      setCancelTarget(null);
      load();
    } catch {
      showToast('Something went wrong. Please try again.', 'error');
      setCancelTarget(null);
    }
  }

  function toggleExpand(order) {
    if (expandedId === order._id) {
      setExpandedId(null);
    } else {
      setExpandedId(order._id);
      setNotesDraft(order.notes || '');
      setPhoneDraft(order.customerPhone || '');
      setPhoneEditingId(null);
    }
  }

  async function handleSaveNotes(order) {
    try {
      await ordersApi.update(order._id, { notes: notesDraft, customerPhone: phoneDraft });
      showToast('Order updated.');
      setPhoneEditingId(null);
      load();
    } catch {
      showToast('Something went wrong. Please try again.', 'error');
    }
  }

  // navigator.clipboard needs a secure context (HTTPS/localhost) — on a
  // plain HTTP admin panel it's unavailable, so fall back to the
  // long-supported execCommand approach via a hidden textarea.
  async function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const succeeded = document.execCommand('copy');
    document.body.removeChild(textarea);
    if (!succeeded) throw new Error('execCommand copy failed');
  }

  async function handleCopyMessage(order, statusKey) {
    const message = MESSAGE_TEMPLATES[statusKey](order);
    try {
      await copyToClipboard(message);
      setCopiedStatus(statusKey);
      setMessagePrompt(null);
      setTimeout(() => setCopiedStatus(null), 2000);
    } catch {
      showToast('Could not copy — clipboard access is blocked.', 'error');
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold">Orders</h1>

      <div className="mt-6 flex flex-wrap gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search order ID, product, or customer…"
          className="rounded border border-neutral-300 px-3 py-2 text-sm w-full sm:w-80 focus:outline-none focus:ring-2 focus:ring-neutral-900"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 bg-white border border-neutral-200 rounded-lg overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Order ID</th>
              <th className="text-left px-5 py-3 font-medium">Product</th>
              <th className="text-left px-5 py-3 font-medium">Customer</th>
              <th className="text-left px-5 py-3 font-medium">Amount</th>
              <th className="text-left px-5 py-3 font-medium">Date</th>
              <th className="text-left px-5 py-3 font-medium">Status</th>
              <th className="text-right px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {loading && (
              <tr>
                <td colSpan={7} className="px-5 py-6 text-neutral-400">Loading…</td>
              </tr>
            )}
            {!loading && orders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-6 text-neutral-400">No orders found.</td>
              </tr>
            )}
            {orders.map((o) => (
              <Fragment key={o._id}>
                <tr className="cursor-pointer hover:bg-neutral-50" onClick={() => toggleExpand(o)}>
                  <td className="px-5 py-3 font-mono text-xs whitespace-nowrap">{o.orderId}</td>
                  <td className="px-5 py-3">{o.productName}</td>
                  <td className="px-5 py-3">{o.customerName || <span className="text-neutral-400">—</span>}</td>
                  <td className="px-5 py-3">
                    {o.currency} {o.price}
                  </td>
                  <td className="px-5 py-3 text-neutral-500">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="px-5 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={o.status}
                      onChange={(e) => handleStatusChange(o, e.target.value)}
                      className="text-xs rounded border border-neutral-300 px-2 py-1"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s.replace(/_/g, ' ')}
                        </option>
                      ))}
                    </select>
                    {messagePrompt?.orderId === o._id && (
                      <div className="mt-2 flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleCopyMessage(o, messagePrompt.statusKey)}
                          className="text-xs rounded bg-neutral-900 text-white px-2 py-1"
                        >
                          {copiedStatus === messagePrompt.statusKey ? 'Copied!' : 'Copy message to client'}
                        </button>
                        <button
                          onClick={() => setMessagePrompt(null)}
                          aria-label="Dismiss"
                          className="text-neutral-400 hover:text-neutral-900 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
                {expandedId === o._id && (
                  <tr>
                    <td colSpan={7} className="px-5 py-4 bg-neutral-50">
                      <div className="grid grid-cols-2 gap-6 text-xs">
                        <div>
                          <p className="text-neutral-500">Customer email</p>
                          <p>{o.customerEmail || '—'}</p>
                          <p className="text-neutral-500 mt-2">Customer phone</p>
                          {phoneEditingId === o._id ? (
                            <input
                              autoFocus
                              value={phoneDraft}
                              onChange={(e) => setPhoneDraft(e.target.value)}
                              placeholder="Add phone number"
                              className="w-full rounded border border-neutral-300 px-2 py-1 text-xs"
                            />
                          ) : (
                            <div className="flex items-center gap-2">
                              <p>{o.customerPhone || '—'}</p>
                              <button
                                onClick={() => {
                                  setPhoneDraft(o.customerPhone || '');
                                  setPhoneEditingId(o._id);
                                }}
                                aria-label="Edit phone number"
                                className="text-neutral-400 hover:text-neutral-900"
                              >
                                ✎
                              </button>
                            </div>
                          )}
                          {o.verifiedAt && (
                            <p className="mt-2 text-neutral-500">
                              Verified: {new Date(o.verifiedAt).toLocaleString()}
                            </p>
                          )}
                          {o.deliveredAt && (
                            <p className="text-neutral-500">
                              Delivered: {new Date(o.deliveredAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                        <div>
                          <p className="text-neutral-500 mb-1">Notes</p>
                          <textarea
                            rows={3}
                            value={notesDraft}
                            onChange={(e) => setNotesDraft(e.target.value)}
                            className="w-full rounded border border-neutral-300 px-2 py-1.5 text-xs"
                          />
                          <button
                            onClick={() => handleSaveNotes(o)}
                            className="mt-2 text-xs bg-neutral-900 text-white rounded px-3 py-1.5"
                          >
                            Save Changes
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!cancelTarget}
        title={`Cancel order ${cancelTarget?.orderId}?`}
        message="This marks the order as cancelled. This can be reversed later by changing the status again."
        confirmLabel="Cancel Order"
        onConfirm={confirmCancel}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
}
