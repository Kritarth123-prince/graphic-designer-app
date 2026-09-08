import { useEffect, useState } from 'react';
import { getSettings, updateSettings } from '../../services/settings.service';
import { useToast } from '../../context/ToastContext';

const FIELD_GROUPS = [
  {
    title: 'Identity',
    fields: [
      ['designerName', 'Designer Name'],
      ['logoUrl', 'Logo URL'],
      ['faviconUrl', 'Favicon URL'],
    ],
  },
  {
    title: 'Homepage',
    fields: [
      ['heroTitle', 'Hero Title'],
      ['heroSubtitle', 'Hero Subtitle'],
      ['heroImageUrl', 'Hero Image URL'],
    ],
  },
  {
    title: 'About',
    fields: [
      ['aboutText', 'About Text', 'textarea'],
      ['profileImageUrl', 'Profile Image URL'],
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
  ['qrImageUrl', 'UPI QR Code URL'],
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

  useEffect(() => {
    getSettings().then((s) =>
      setForm({
        ...s,
        upi: s.upi || {},
        social: s.social || {},
      })
    );
  }, []);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }
  function setNested(group, key, value) {
    setForm((prev) => ({ ...prev, [group]: { ...prev[group], [key]: value } }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const saved = await updateSettings(form);
      setForm({ ...saved, upi: saved.upi || {}, social: saved.social || {} });
      showToast('Settings saved successfully.');
    } catch (err) {
      showToast(err?.response?.data?.message || 'Something went wrong. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  }

  if (!form) return <p className="text-sm text-neutral-400">Loading…</p>;

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
            {group.fields.map(([key, label, type]) => (
              <label key={key} className="block text-sm text-neutral-700">
                {label}
                {type === 'textarea' ? (
                  <textarea
                    rows={4}
                    value={form[key] || ''}
                    onChange={(e) => setField(key, e.target.value)}
                    className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                ) : (
                  <input
                    value={form[key] || ''}
                    onChange={(e) => setField(key, e.target.value)}
                    className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                )}
              </label>
            ))}
          </div>
        </div>
      ))}

      <div className="mt-8 bg-white border border-neutral-200 rounded-lg p-5">
        <h2 className="text-sm font-semibold mb-4">UPI Payment</h2>
        <div className="space-y-4">
          {UPI_FIELDS.map(([key, label, type]) => (
            <label key={key} className="block text-sm text-neutral-700">
              {label}
              {type === 'textarea' ? (
                <textarea
                  rows={3}
                  value={form.upi[key] || ''}
                  onChange={(e) => setNested('upi', key, e.target.value)}
                  className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              ) : (
                <input
                  value={form.upi[key] || ''}
                  onChange={(e) => setNested('upi', key, e.target.value)}
                  className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              )}
            </label>
          ))}
        </div>
      </div>

      <div className="mt-8 bg-white border border-neutral-200 rounded-lg p-5">
        <h2 className="text-sm font-semibold mb-4">Social Links</h2>
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

      <button
        type="submit"
        disabled={saving}
        className="mt-8 bg-neutral-900 text-white rounded px-6 py-2.5 text-sm font-medium hover:bg-neutral-800 disabled:opacity-60"
      >
        {saving ? 'Saving…' : 'Save Settings'}
      </button>
    </form>
  );
}
