import { useEffect, useState } from 'react';
import * as categoriesApi from '../../services/adminCategories.service';
import { useToast } from '../../context/ToastContext';
import ConfirmDialog from '../../components/admin/ConfirmDialog';

export default function CategoriesPage() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [confirmTarget, setConfirmTarget] = useState(null);

  function load() {
    setLoading(true);
    categoriesApi
      .listAdmin()
      .then(setCategories)
      .finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await categoriesApi.create({ name: newName.trim() });
      setNewName('');
      showToast('Category created.');
      load();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Something went wrong. Please try again.', 'error');
    }
  }

  async function handleToggleEnabled(cat) {
    try {
      await categoriesApi.update(cat._id, { enabled: !cat.enabled });
      load();
    } catch {
      showToast('Something went wrong. Please try again.', 'error');
    }
  }

  async function handleRename(cat) {
    if (!editingName.trim() || editingName === cat.name) {
      setEditingId(null);
      return;
    }
    try {
      await categoriesApi.update(cat._id, { name: editingName.trim() });
      setEditingId(null);
      showToast('Category updated.');
      load();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Something went wrong. Please try again.', 'error');
    }
  }

  async function handleDelete() {
    try {
      await categoriesApi.remove(confirmTarget._id);
      showToast('Category deleted.');
      setConfirmTarget(null);
      load();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Unable to delete category.', 'error');
      setConfirmTarget(null);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold">Categories</h1>

      <form onSubmit={handleCreate} className="mt-6 flex gap-3">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New category name"
          className="flex-1 rounded border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
        />
        <button className="bg-neutral-900 text-white rounded px-4 py-2 text-sm font-medium hover:bg-neutral-800">
          Add
        </button>
      </form>

      <div className="mt-6 bg-white border border-neutral-200 rounded-lg divide-y divide-neutral-100">
        {loading && <p className="p-5 text-sm text-neutral-400">Loading…</p>}
        {!loading && categories.length === 0 && (
          <p className="p-5 text-sm text-neutral-400">No categories yet.</p>
        )}
        {categories.map((cat) => (
          <div key={cat._id} className="flex items-center justify-between px-5 py-3">
            {editingId === cat._id ? (
              <input
                autoFocus
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={() => handleRename(cat)}
                onKeyDown={(e) => e.key === 'Enter' && handleRename(cat)}
                className="flex-1 rounded border border-neutral-300 px-2 py-1 text-sm mr-4"
              />
            ) : (
              <button
                className="text-sm text-left flex-1"
                onClick={() => {
                  setEditingId(cat._id);
                  setEditingName(cat.name);
                }}
              >
                {cat.name}
                <span className="ml-2 text-xs text-neutral-400">/{cat.slug}</span>
              </button>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleToggleEnabled(cat)}
                className={`text-xs px-2 py-1 rounded ${
                  cat.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-500'
                }`}
              >
                {cat.enabled ? 'Enabled' : 'Disabled'}
              </button>
              <button
                onClick={() => setConfirmTarget(cat)}
                className="text-xs text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!confirmTarget}
        title={`Delete "${confirmTarget?.name}"?`}
        message="This can't be undone. Products using this category must be reassigned first."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirmTarget(null)}
      />
    </div>
  );
}
