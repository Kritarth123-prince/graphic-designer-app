import api from './api';

// Public — no UPI details (see server/src/controllers/settings.controller.js).
// Used by the public site (SiteSettingsContext).
export async function getSettings() {
  const { data } = await api.get('/settings');
  return data.settings;
}

// Admin-only — the full document, including UPI, for the settings form.
export async function getSettingsAdmin() {
  const { data } = await api.get('/settings/admin');
  return data.settings;
}

export async function updateSettings(payload) {
  const { data } = await api.put('/settings', payload);
  return data.settings;
}
