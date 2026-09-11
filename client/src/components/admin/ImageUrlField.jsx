import { useState } from 'react';
import api from '../../services/api';

export default function ImageUrlField({ label, value, onChange, hint }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const form = new FormData();
      form.append('image', file);
      const { data } = await api.post('/settings/admin/image', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onChange(data.url);
    } catch (err) {
      setError(err?.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  return (
    <label className="block text-sm text-neutral-700">
      {label}
      {hint && <span className="block text-xs text-neutral-400 font-normal">{hint}</span>}
      <div className="mt-1 flex gap-2 items-start">
        <input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
          className="flex-1 rounded border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
        />
        <label className="shrink-0 text-xs bg-neutral-100 hover:bg-neutral-200 rounded px-3 py-2 cursor-pointer whitespace-nowrap">
          {uploading ? 'Uploading…' : 'Upload'}
          <input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={handleFileSelect} disabled={uploading} />
        </label>
      </div>
      {value && (
        <img src={value} alt="" className="mt-2 h-16 w-16 object-cover rounded border border-neutral-200" />
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </label>
  );
}
