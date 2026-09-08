import { Fragment, useEffect, useState } from 'react';
import * as inquiriesApi from '../../services/adminInquiries.service';
import { useToast } from '../../context/ToastContext';
import ConfirmDialog from '../../components/admin/ConfirmDialog';

export default function InquiriesPage() {
  const { showToast } = useToast();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  function load() {
    setLoading(true);
    inquiriesApi
      .listAdmin({ read: filter || undefined })
      .then((data) => setInquiries(data.inquiries))
      .finally(() => setLoading(false));
  }
  useEffect(load, [filter]);

  async function toggleExpand(inquiry) {
    if (expandedId === inquiry._id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(inquiry._id);
    if (!inquiry.read) {
      await inquiriesApi.markRead(inquiry._id);
      load();
    }
  }

  async function handleToggleRead(inquiry) {
    try {
      if (inquiry.read) await inquiriesApi.markUnread(inquiry._id);
      else await inquiriesApi.markRead(inquiry._id);
      load();
    } catch {
      showToast('Something went wrong. Please try again.', 'error');
    }
  }

  async function handleDelete() {
    try {
      await inquiriesApi.remove(deleteTarget._id);
      showToast('Inquiry deleted.');
      setDeleteTarget(null);
      load();
    } catch {
      showToast('Something went wrong. Please try again.', 'error');
      setDeleteTarget(null);
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold">Inquiries</h1>

      <div className="mt-6 flex gap-3">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
        >
          <option value="">All</option>
          <option value="false">Unread</option>
          <option value="true">Read</option>
        </select>
      </div>

      <div className="mt-6 bg-white border border-neutral-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Sender</th>
              <th className="text-left px-5 py-3 font-medium">Subject</th>
              <th className="text-left px-5 py-3 font-medium">Date</th>
              <th className="text-left px-5 py-3 font-medium">Status</th>
              <th className="text-right px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {loading && (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-neutral-400">Loading…</td>
              </tr>
            )}
            {!loading && inquiries.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-neutral-400">No inquiries yet.</td>
              </tr>
            )}
            {inquiries.map((i) => (
              <Fragment key={i._id}>
                <tr
                  className={`cursor-pointer hover:bg-neutral-50 ${!i.read ? 'font-medium' : ''}`}
                  onClick={() => toggleExpand(i)}
                >
                  <td className="px-5 py-3">
                    {i.name}
                    <p className="text-xs text-neutral-400 font-normal">{i.email}</p>
                  </td>
                  <td className="px-5 py-3">{i.subject}</td>
                  <td className="px-5 py-3 text-neutral-500 font-normal">
                    {new Date(i.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3">
                    {!i.read && <span className="text-xs text-blue-600">New</span>}
                  </td>
                  <td className="px-5 py-3 text-right space-x-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => handleToggleRead(i)} className="text-xs text-neutral-600 hover:underline">
                      Mark {i.read ? 'Unread' : 'Read'}
                    </button>
                    <button onClick={() => setDeleteTarget(i)} className="text-xs text-red-600 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
                {expandedId === i._id && (
                  <tr>
                    <td colSpan={5} className="px-5 py-4 bg-neutral-50 font-normal">
                      <p className="text-xs text-neutral-500">Phone/WhatsApp: {i.phone || '—'}</p>
                      <p className="mt-3 text-sm whitespace-pre-line">{i.message}</p>
                      {i.attachment?.storageKey && (
                        <a
                          href={inquiriesApi.attachmentDownloadUrl(i._id)}
                          className="mt-3 inline-block text-xs text-neutral-600 underline"
                        >
                          Download attachment ({i.attachment.originalName})
                        </a>
                      )}
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Delete inquiry from "${deleteTarget?.name}"?`}
        message="This can't be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
