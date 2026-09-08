import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as portfolioApi from '../../services/adminPortfolio.service';
import { useToast } from '../../context/ToastContext';

const emptyForm = {
  title: '',
  client: '',
  year: '',
  category: '',
  description: '',
  brief: '',
  creativeDirection: '',
  process: '',
  finalResult: '',
  featured: false,
  seoTitle: '',
  seoMetaDescription: '',
};

export default function PortfolioFormPage() {
  const { id } = useParams();
  const isNew = id === 'new' || id === undefined;
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState(emptyForm);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    if (isNew) return;
    portfolioApi.getById(id).then((p) => {
      setProject(p);
      setForm({
        title: p.title,
        client: p.client || '',
        year: p.year || '',
        category: p.category || '',
        description: p.description || '',
        brief: p.brief || '',
        creativeDirection: p.creativeDirection || '',
        process: p.process || '',
        finalResult: p.finalResult || '',
        featured: p.featured,
        seoTitle: p.seo?.title || '',
        seoMetaDescription: p.seo?.metaDescription || '',
      });
      setLoading(false);
    });
  }, [id, isNew]);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, year: form.year ? Number(form.year) : undefined };
    try {
      if (isNew) {
        const created = await portfolioApi.create(payload);
        showToast('Project created as a draft.');
        navigate(`/admin/portfolio/${created._id}`, { replace: true });
      } else {
        const updated = await portfolioApi.update(id, payload);
        setProject(updated);
        showToast('Project updated.');
      }
    } catch (err) {
      showToast(err?.response?.data?.message || 'Something went wrong. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleImageUpload(e) {
    const files = e.target.files;
    if (!files?.length) return;
    setImageUploading(true);
    try {
      const updated = await portfolioApi.addImages(id, files);
      setProject(updated);
      showToast('Images uploaded.');
    } catch (err) {
      showToast(err?.response?.data?.message || 'Upload failed.', 'error');
    } finally {
      setImageUploading(false);
      e.target.value = '';
    }
  }

  async function handleRemoveImage(imageId) {
    try {
      const updated = await portfolioApi.removeImage(id, imageId);
      setProject(updated);
    } catch {
      showToast('Something went wrong. Please try again.', 'error');
    }
  }

  if (loading) return <p className="text-sm text-neutral-400">Loading…</p>;

  const textField = (key, label, isTextarea = false) => (
    <label className="block text-sm text-neutral-700">
      {label}
      {isTextarea ? (
        <textarea
          rows={3}
          value={form[key]}
          onChange={(e) => setField(key, e.target.value)}
          className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
        />
      ) : (
        <input
          value={form[key]}
          onChange={(e) => setField(key, e.target.value)}
          className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
        />
      )}
    </label>
  );

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold">{isNew ? 'Add Project' : `Edit: ${project?.title}`}</h1>

      <form onSubmit={handleSubmit} className="mt-6 bg-white border border-neutral-200 rounded-lg p-5 space-y-4">
        <label className="block text-sm text-neutral-700">
          Title
          <input
            required
            value={form.title}
            onChange={(e) => setField('title', e.target.value)}
            className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
        </label>

        <div className="grid grid-cols-3 gap-4">
          {textField('client', 'Client')}
          <label className="block text-sm text-neutral-700">
            Year
            <input
              type="number"
              value={form.year}
              onChange={(e) => setField('year', e.target.value)}
              className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </label>
          {textField('category', 'Category')}
        </div>

        {textField('description', 'Description', true)}
        {textField('brief', 'Brief', true)}
        {textField('creativeDirection', 'Creative Direction', true)}
        {textField('process', 'Process', true)}
        {textField('finalResult', 'Final Result', true)}

        <label className="flex items-center gap-2 text-sm text-neutral-700">
          <input type="checkbox" checked={form.featured} onChange={(e) => setField('featured', e.target.checked)} />
          Featured
        </label>

        <div className="border-t border-neutral-100 pt-4">
          <p className="text-xs font-medium text-neutral-500 mb-3">SEO (optional — falls back to title/brief)</p>
          {textField('seoTitle', 'SEO Title')}
          <div className="mt-4">{textField('seoMetaDescription', 'Meta Description', true)}</div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-neutral-900 text-white rounded px-6 py-2.5 text-sm font-medium hover:bg-neutral-800 disabled:opacity-60"
        >
          {saving ? 'Saving…' : isNew ? 'Create Project' : 'Save Changes'}
        </button>
      </form>

      {!isNew && (
        <div className="mt-6 bg-white border border-neutral-200 rounded-lg p-5">
          <h2 className="text-sm font-semibold">Images</h2>
          <p className="text-xs text-neutral-500 mt-1">
            First image becomes the case-study hero. JPEG, PNG, or WebP — up to 8MB each.
          </p>

          <div className="mt-4 grid grid-cols-4 gap-3">
            {(project?.images || []).map((img) => (
              <div key={img._id} className="relative group">
                <img src={img.url} alt="" className="aspect-square object-cover rounded border border-neutral-200" />
                <button
                  onClick={() => handleRemoveImage(img._id)}
                  className="absolute top-1 right-1 bg-black/60 text-white text-xs rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <label className="mt-4 inline-block text-sm bg-neutral-100 hover:bg-neutral-200 rounded px-4 py-2 cursor-pointer">
            {imageUploading ? 'Uploading…' : 'Upload Images'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              hidden
              onChange={handleImageUpload}
              disabled={imageUploading}
            />
          </label>
        </div>
      )}
    </div>
  );
}
