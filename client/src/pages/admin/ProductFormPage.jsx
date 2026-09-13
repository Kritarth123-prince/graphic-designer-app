import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as productsApi from '../../services/adminProducts.service';
import * as categoriesApi from '../../services/adminCategories.service';
import { useToast } from '../../context/ToastContext';

const emptyForm = {
  title: '',
  description: '',
  shortDescription: '',
  price: '',
  currency: 'INR',
  category: '',
  dimensions: '',
  format: '',
  tags: '',
  featured: false,
  seoTitle: '',
  seoMetaDescription: '',
};

export default function ProductFormPage() {
  const { id } = useParams();
  const isNew = id === 'new' || id === undefined;
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [product, setProduct] = useState(null); // full doc, only present when editing
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);

  useEffect(() => {
    categoriesApi.listAdmin().then(setCategories);
  }, []);

  useEffect(() => {
    if (isNew) return;
    productsApi.getById(id).then((p) => {
      setProduct(p);
      setForm({
        title: p.title,
        description: p.description,
        shortDescription: p.shortDescription || '',
        price: p.price,
        currency: p.currency,
        category: p.category?._id || p.category,
        dimensions: p.dimensions || '',
        format: p.format || '',
        tags: (p.tags || []).join(', '),
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
    const payload = {
      ...form,
      price: Number(form.price),
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };

    try {
      if (isNew) {
        const created = await productsApi.create(payload);
        showToast('Product created as a draft.');
        navigate(`/admin/products/${created._id}`, { replace: true });
      } else {
        const updated = await productsApi.update(id, payload);
        setProduct(updated);
        showToast('Product updated.');
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
      const updated = await productsApi.uploadPreviewImages(id, files);
      setProduct(updated);
      showToast('Preview images uploaded.');
    } catch (err) {
      showToast(err?.response?.data?.message || 'Upload failed.', 'error');
    } finally {
      setImageUploading(false);
      e.target.value = '';
    }
  }

  async function handleRemoveImage(imageId) {
    try {
      const updated = await productsApi.removePreviewImage(id, imageId);
      setProduct(updated);
    } catch {
      showToast('Something went wrong. Please try again.', 'error');
    }
  }

  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileUploading(true);
    try {
      const fileInfo = await productsApi.uploadOriginalFile(id, file);
      setProduct((prev) => ({ ...prev, file: fileInfo }));
      showToast('Original design file uploaded.');
    } catch (err) {
      showToast(err?.response?.data?.message || 'Upload failed.', 'error');
    } finally {
      setFileUploading(false);
      e.target.value = '';
    }
  }

  if (loading) return <p className="text-sm text-neutral-400">Loading…</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold">{isNew ? 'Add Product' : `Edit: ${product?.title}`}</h1>

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

        <label className="block text-sm text-neutral-700">
          Description
          <textarea
            required
            rows={4}
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
            className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
        </label>

        <label className="block text-sm text-neutral-700">
          Short Description
          <input
            value={form.shortDescription}
            onChange={(e) => setField('shortDescription', e.target.value)}
            className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block text-sm text-neutral-700">
            Price
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => setField('price', e.target.value)}
              className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </label>
          <label className="block text-sm text-neutral-700">
            Category
            <select
              required
              value={form.category}
              onChange={(e) => setField('category', e.target.value)}
              className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            >
              <option value="">Select…</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="block text-sm text-neutral-700">
            Dimensions
            <input
              value={form.dimensions}
              onChange={(e) => setField('dimensions', e.target.value)}
              placeholder="18in x 24in"
              className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </label>
          <label className="block text-sm text-neutral-700">
            Format
            <input
              value={form.format}
              onChange={(e) => setField('format', e.target.value)}
              placeholder="PSD, PNG, PDF"
              className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </label>
        </div>

        <label className="block text-sm text-neutral-700">
          Tags (comma-separated)
          <input
            value={form.tags}
            onChange={(e) => setField('tags', e.target.value)}
            className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
        </label>

        <label className="flex items-center gap-2 text-sm text-neutral-700">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => setField('featured', e.target.checked)}
          />
          Featured
        </label>

        <div className="border-t border-neutral-100 pt-4">
          <p className="text-xs font-medium text-neutral-500 mb-3">SEO (optional — falls back to title/description)</p>
          <label className="block text-sm text-neutral-700">
            SEO Title
            <input
              value={form.seoTitle}
              onChange={(e) => setField('seoTitle', e.target.value)}
              className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </label>
          <label className="block text-sm text-neutral-700 mt-4">
            Meta Description
            <textarea
              rows={2}
              value={form.seoMetaDescription}
              onChange={(e) => setField('seoMetaDescription', e.target.value)}
              className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-neutral-900 text-white rounded px-6 py-2.5 text-sm font-medium hover:bg-neutral-800 disabled:opacity-60"
        >
          {saving ? 'Saving…' : isNew ? 'Create Product' : 'Save Changes'}
        </button>
      </form>

      {!isNew && (
        <>
          <div className="mt-6 bg-white border border-neutral-200 rounded-lg p-5">
            <h2 className="text-sm font-semibold">Preview Images</h2>
            <p className="text-xs text-neutral-500 mt-1">JPEG, PNG, or WebP — up to 8MB each.</p>

            <div className="mt-4 grid grid-cols-4 gap-3">
              {(product?.previewImages || []).map((img) => (
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
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={handleImageUpload} disabled={imageUploading} />
            </label>
          </div>

          <div className="mt-6 bg-white border border-neutral-200 rounded-lg p-5">
            <h2 className="text-sm font-semibold">Original Design File</h2>
            <p className="text-xs text-neutral-500 mt-1">
              Never shown publicly — used only to prepare manual delivery after payment verification.
            </p>

            {product?.file?.storageKey ? (
              <p className="mt-3 text-sm">
                {product.file.originalName}{' '}
                <button
                  onClick={() =>
                    productsApi
                      .downloadOriginalFile(id, product.file.originalName)
                      .catch(() => showToast('Could not download the file.', 'error'))
                  }
                  className="text-neutral-500 hover:text-neutral-900 underline text-xs ml-2"
                >
                  Download
                </button>
              </p>
            ) : (
              <p className="mt-3 text-sm text-neutral-400">No file uploaded yet.</p>
            )}

            <label className="mt-4 inline-block text-sm bg-neutral-100 hover:bg-neutral-200 rounded px-4 py-2 cursor-pointer">
              {fileUploading ? 'Uploading…' : 'Upload File'}
              <input type="file" hidden onChange={handleFileUpload} disabled={fileUploading} />
            </label>
          </div>
        </>
      )}
    </div>
  );
}
