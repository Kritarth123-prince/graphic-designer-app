import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as productsApi from '../../services/adminProducts.service';
import { useToast } from '../../context/ToastContext';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import StatusBadge from '../../components/admin/StatusBadge';

export default function ProductsPage() {
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [confirmTarget, setConfirmTarget] = useState(null);

  function load() {
    setLoading(true);
    productsApi
      .listAdmin({ q: q || undefined, status: status || undefined })
      .then((data) => setProducts(data.products))
      .finally(() => setLoading(false));
  }
  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status]);

  async function handleStatusAction(product, action) {
    try {
      await productsApi[action](product._id);
      showToast(`Product ${action}ed successfully.`);
      load();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Something went wrong. Please try again.', 'error');
    }
  }

  async function handleDelete() {
    try {
      await productsApi.remove(confirmTarget._id);
      showToast('Product deleted.');
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
        <h1 className="text-xl font-semibold">Products</h1>
        <Link
          to="/admin/products/new"
          className="bg-neutral-900 text-white rounded px-4 py-2 text-sm font-medium hover:bg-neutral-800"
        >
          Add Product
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products…"
          className="rounded border border-neutral-300 px-3 py-2 text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-neutral-900"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="mt-6 bg-white border border-neutral-200 rounded-lg overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Product</th>
              <th className="text-left px-5 py-3 font-medium">Price</th>
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
            {!loading && products.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-6 text-neutral-400">No products found.</td>
              </tr>
            )}
            {products.map((p) => (
              <tr key={p._id}>
                <td className="px-5 py-3">
                  <Link to={`/admin/products/${p._id}`} className="font-medium text-neutral-900 underline decoration-neutral-300 hover:decoration-neutral-900">
                    {p.title}
                  </Link>
                  <p className="text-xs text-neutral-400 font-mono">{p.productId}</p>
                </td>
                <td className="px-5 py-3">
                  {p.currency} {p.price}
                </td>
                <td className="px-5 py-3">
                  <StatusBadge status={p.status} />
                </td>
                <td className="px-5 py-3 text-right space-x-3 whitespace-nowrap">
                  <Link to={`/admin/products/${p._id}`} className="text-xs text-neutral-600 hover:underline">
                    Edit / Upload Images
                  </Link>
                  {p.status !== 'published' && (
                    <button
                      onClick={() => handleStatusAction(p, 'publish')}
                      className="text-xs text-emerald-700 hover:underline"
                    >
                      Publish
                    </button>
                  )}
                  {p.status === 'published' && (
                    <button
                      onClick={() => handleStatusAction(p, 'unpublish')}
                      className="text-xs text-neutral-600 hover:underline"
                    >
                      Unpublish
                    </button>
                  )}
                  {p.status !== 'archived' && (
                    <button
                      onClick={() => handleStatusAction(p, 'archive')}
                      className="text-xs text-amber-700 hover:underline"
                    >
                      Archive
                    </button>
                  )}
                  <button
                    onClick={() => setConfirmTarget(p)}
                    className="text-xs text-red-600 hover:underline"
                  >
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
        message="This permanently removes the product and its uploaded files. This can't be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirmTarget(null)}
      />
    </div>
  );
}
