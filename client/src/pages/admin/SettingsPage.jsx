import { useEffect, useState } from 'react';
import { getSettingsAdmin, updateSettings } from '../../services/settings.service';
import { useToast } from '../../context/ToastContext';
import ImageUrlField from '../../components/admin/ImageUrlField';

const FIELD_GROUPS = [
  {
    title: 'Identity',
    fields: [
      ['designerName', 'Designer Name'],
      ['logoUrl', 'Logo', 'image', 'Shown in the site header, in place of the text wordmark.'],
      ['faviconUrl', 'Favicon', 'image', 'The small icon shown in the browser tab.'],
    ],
  },
  {
    title: 'Homepage',
    fields: [
      ['heroTitle', 'Hero Title'],
      ['heroSubtitle', 'Hero Subtitle'],
      ['heroImageUrl', 'Hero Image', 'image', 'Large image shown alongside the homepage headline.'],
    ],
  },
  {
    title: 'About',
    fields: [
      ['aboutText', 'About Text', 'textarea'],
      ['profileImageUrl', 'Profile Image', 'image', 'Shown on the About page.'],
    ],
  },
  {
    title: 'Contact',
    fields: [
      ['whatsappNumber', 'WhatsApp Number (e.g. +919999999999)'],
      ['email', 'Contact Email'],
    ],
  },
  {
    title: 'Footer',
    fields: [['footerText', 'Footer Text']],
  },
];

const UPI_FIELDS = [
  ['id', 'UPI ID'],
  ['displayName', 'Payment Name'],
  ['qrImageUrl', 'UPI QR Code', 'image', 'Shown on every product page next to the payment details.'],
  ['instructions', 'Payment Instructions', 'textarea'],
];

const SOCIAL_FIELDS = [
  ['instagram', 'Instagram'],
  ['behance', 'Behance'],
  ['dribbble', 'Dribbble'],
  ['linkedin', 'LinkedIn'],
];

export default function SettingsPage() {
  const { showToast } = useToast();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    getSettingsAdmin().then((s) =>
      setForm({
        ...s,
        upi: s.upi || {},
        social: s.social || {},
      })
    );
  }, []);

  useEffect(() => {
    if (!dirty) return undefined;
    function handleBeforeUnload(e) {
      e.preventDefault();
      e.returnValue = '';
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [dirty]);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  }
  function setNested(group, key, value) {
    setForm((prev) => ({ ...prev, [group]: { ...prev[group], [key]: value } }));
    setDirty(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const saved = await updateSettings(form);
      setForm({ ...saved, upi: saved.upi || {}, social: saved.social || {} });
      setDirty(false);
      showToast('Settings saved successfully.');
    } catch (err) {
      showToast(err?.response?.data?.message || 'Something went wrong. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  }

  if (!form) return <p className="text-sm text-neutral-400">Loading…</p>;

  function renderField([key, label, type, hint], value, onChange) {
    if (type === 'image') {
      return <ImageUrlField key={key} label={label} value={value} onChange={(v) => onChange(key, v)} hint={hint} />;
    }
    if (type === 'textarea') {
      return (
        <label key={key} className="block text-sm text-neutral-700">
          {label}
          <textarea
            rows={key === 'instructions' ? 3 : 4}
            value={value || ''}
            onChange={(e) => onChange(key, e.target.value)}
            className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
        </label>
      );
    }
    return (
      <label key={key} className="block text-sm text-neutral-700">
        {label}
        <input
          value={value || ''}
          onChange={(e) => onChange(key, e.target.value)}
          className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
        />
      </label>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      <h1 className="text-xl font-semibold">Settings</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Edits here take effect on the public site immediately after saving.
      </p>

      {FIELD_GROUPS.map((group) => (
        <div key={group.title} className="mt-8 bg-white border border-neutral-200 rounded-lg p-5">
          <h2 className="text-sm font-semibold mb-4">{group.title}</h2>
          <div className="space-y-4">
            {group.fields.map((fieldDef) => renderField(fieldDef, form[fieldDef[0]], setField))}
          </div>
        </div>
      ))}

      <div className="mt-8 bg-white border border-neutral-200 rounded-lg p-5">
        <h2 className="text-sm font-semibold mb-4">UPI Payment</h2>
        <p className="text-xs text-neutral-500 -mt-2 mb-4">
          Shown directly on every product page, next to the "Order via WhatsApp" button.
        </p>
        <div className="space-y-4">
          {UPI_FIELDS.map((fieldDef) =>
            renderField(fieldDef, form.upi[fieldDef[0]], (key, value) => setNested('upi', key, value))
          )}
        </div>
      </div>

      <div className="mt-8 bg-white border border-neutral-200 rounded-lg p-5">
        <h2 className="text-sm font-semibold mb-4">Social Links</h2>
        <p className="text-xs text-neutral-500 -mt-2 mb-4">Shown in the site footer.</p>
        <div className="space-y-4">
          {SOCIAL_FIELDS.map(([key, label]) => (
            <label key={key} className="block text-sm text-neutral-700">
              {label}
              <input
                value={form.social[key] || ''}
                onChange={(e) => setNested('social', key, e.target.value)}
                className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </label>
          ))}
        </div>
      </div>

      <div className="sticky bottom-0 -mx-4 md:-mx-8 mt-8 bg-white/95 backdrop-blur border-t border-neutral-200 px-4 md:px-8 py-4 flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="bg-neutral-900 text-white rounded px-6 py-2.5 text-sm font-medium hover:bg-neutral-800 disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
        {dirty && !saving && (
          <span className="text-xs text-amber-600">
            Unsaved changes — uploading an image doesn't save it by itself.
          </span>
        )}
      </div>
    </form>
  );
}
