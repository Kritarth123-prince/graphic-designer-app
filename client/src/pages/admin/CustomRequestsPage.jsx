import { Fragment, useEffect, useState } from 'react';
import * as requestsApi from '../../services/adminCustomRequests.service';
import { useToast } from '../../context/ToastContext';
import ConfirmDialog from '../../components/admin/ConfirmDialog';

const STATUS_OPTIONS = ['NEW', 'IN_REVIEW', 'QUOTED', 'ACCEPTED', 'CLOSED'];
const STATUS_STYLES = {
  NEW: 'bg-blue-100 text-blue-800',
  IN_REVIEW: 'bg-amber-100 text-amber-800',
  QUOTED: 'bg-purple-100 text-purple-800',
  ACCEPTED: 'bg-emerald-100 text-emerald-800',
  CLOSED: 'bg-neutral-100 text-neutral-500',
};

export default function CustomRequestsPage() {
  const { showToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  function load() {
    setLoading(true);
    requestsApi
      .listAdmin({ status: status || undefined })
      .then((data) => setRequests(data.requests))
      .finally(() => setLoading(false));
  }
  useEffect(load, [status]);

  async function handleStatusChange(request, newStatus) {
    try {
      await requestsApi.updateStatus(request._id, newStatus);
      showToast('Request status updated.');
      load();
    } catch {
      showToast('Something went wrong. Please try again.', 'error');
    }
  }

  async function handleDelete() {
    try {
      await requestsApi.remove(deleteTarget._id);
      showToast('Request deleted.');
      setDeleteTarget(null);
      load();
    } catch {
      showToast('Something went wrong. Please try again.', 'error');
      setDeleteTarget(null);
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold">Custom Design Requests</h1>

      <div className="mt-6 flex gap-3">
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
        <table className="w-full min-w-[560px] text-sm">
          <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Name</th>
              <th className="text-left px-5 py-3 font-medium">Design Type</th>
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
            {!loading && requests.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-neutral-400">No requests yet.</td>
              </tr>
            )}
            {requests.map((r) => (
              <Fragment key={r._id}>
                <tr className="cursor-pointer hover:bg-neutral-50" onClick={() => setExpandedId(expandedId === r._id ? null : r._id)}>
                  <td className="px-5 py-3">
                    {r.name}
                    <p className="text-xs text-neutral-400">{r.email}</p>
                  </td>
                  <td className="px-5 py-3">{r.designType}</td>
                  <td className="px-5 py-3 text-neutral-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[r.status]}`}>
                      {r.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right space-x-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={r.status}
                      onChange={(e) => handleStatusChange(r, e.target.value)}
                      className="text-xs rounded border border-neutral-300 px-2 py-1"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s.replace(/_/g, ' ')}
                        </option>
                      ))}
                    </select>
                    <button onClick={() => setDeleteTarget(r)} className="text-xs text-red-600 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
                {expandedId === r._id && (
                  <tr>
                    <td colSpan={5} className="px-5 py-4 bg-neutral-50">
                      <div className="grid grid-cols-2 gap-6 text-xs">
                        <div>
                          <p className="text-neutral-500">WhatsApp</p>
                          <p>{r.whatsapp}</p>
                          <p className="text-neutral-500 mt-2">Dimensions</p>
                          <p>{r.dimensions || '—'}</p>
                          <p className="text-neutral-500 mt-2">Quantity</p>
                          <p>{r.quantity}</p>
                        </div>
                        <div>
                          <p className="text-neutral-500">Budget</p>
                          <p>{r.budget || '—'}</p>
                          <p className="text-neutral-500 mt-2">Deadline</p>
                          <p>{r.deadline ? new Date(r.deadline).toLocaleDateString() : '—'}</p>
                          {r.referenceFile?.storageKey && (
                            <a
                              href={requestsApi.referenceFileDownloadUrl(r._id)}
                              className="mt-2 inline-block text-neutral-600 underline"
                            >
                              Download reference file
                            </a>
                          )}
                        </div>
                        <div className="col-span-2">
                          <p className="text-neutral-500">Project Description</p>
                          <p className="mt-1 whitespace-pre-line">{r.projectDescription}</p>
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
        open={!!deleteTarget}
        title={`Delete request from "${deleteTarget?.name}"?`}
        message="This can't be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
