import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as portfolioApi from '../../services/adminPortfolio.service';
import { useToast } from '../../context/ToastContext';
import ConfirmDialog from '../../components/admin/ConfirmDialog';

export default function AdminPortfolioPage() {
  const { showToast } = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmTarget, setConfirmTarget] = useState(null);

  function load() {
    setLoading(true);
    portfolioApi
      .listAdmin()
      .then(setProjects)
      .finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function handleToggle(project) {
    try {
      if (project.published) {
        await portfolioApi.unpublish(project._id);
      } else {
        await portfolioApi.publish(project._id);
      }
      load();
    } catch {
      showToast('Something went wrong. Please try again.', 'error');
    }
  }

  async function handleDelete() {
    try {
      await portfolioApi.remove(confirmTarget._id);
      showToast('Project deleted.');
      setConfirmTarget(null);
      load();
    } catch {
      showToast('Something went wrong. Please try again.', 'error');
      setConfirmTarget(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Portfolio</h1>
        <Link
          to="/admin/portfolio/new"
          className="bg-neutral-900 text-white rounded px-4 py-2 text-sm font-medium hover:bg-neutral-800"
        >
          Add Project
        </Link>
      </div>

      <div className="mt-6 bg-white border border-neutral-200 rounded-lg overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Project</th>
              <th className="text-left px-5 py-3 font-medium">Client / Year</th>
              <th className="text-left px-5 py-3 font-medium">Status</th>
              <th className="text-right px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {loading && (
              <tr>
                <td colSpan={4} className="px-5 py-6 text-neutral-400">Loading…</td>
              </tr>
            )}
            {!loading && projects.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-6 text-neutral-400">No projects yet.</td>
              </tr>
            )}
            {projects.map((p) => (
              <tr key={p._id}>
                <td className="px-5 py-3">
                  <Link to={`/admin/portfolio/${p._id}`} className="font-medium text-neutral-900 underline decoration-neutral-300 hover:decoration-neutral-900">
                    {p.title}
                  </Link>
                </td>
                <td className="px-5 py-3 text-neutral-500">
                  {[p.client, p.year].filter(Boolean).join(' / ') || '—'}
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      p.published ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    {p.published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-5 py-3 text-right space-x-3 whitespace-nowrap">
                  <Link to={`/admin/portfolio/${p._id}`} className="text-xs text-neutral-600 hover:underline">
                    Edit / Upload Images
                  </Link>
                  <button onClick={() => handleToggle(p)} className="text-xs text-neutral-600 hover:underline">
                    {p.published ? 'Unpublish' : 'Publish'}
                  </button>
                  <button onClick={() => setConfirmTarget(p)} className="text-xs text-red-600 hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!confirmTarget}
        title={`Delete "${confirmTarget?.title}"?`}
        message="This permanently removes the project and its images. This can't be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirmTarget(null)}
      />
    </div>
  );
}
