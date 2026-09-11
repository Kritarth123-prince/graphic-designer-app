import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSettings } from '../services/settings.service';

const SiteSettingsContext = createContext(null);

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSettings()
      .then(setSettings)
      .catch(() => setSettings({})) // fail soft — layout renders with fallback copy
      .finally(() => setLoading(false));
  }, []);

  // Applied once, site-wide — not per-page like useDocumentMeta's title/
  // description, since the favicon doesn't change between routes.
  useEffect(() => {
    if (!settings?.faviconUrl) return;
    let link = document.querySelector('link[rel="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'icon');
      document.head.appendChild(link);
    }
    link.setAttribute('href', settings.faviconUrl);
  }, [settings?.faviconUrl]);

  return (
    <SiteSettingsContext.Provider value={{ settings: settings || {}, loading }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const ctx = useContext(SiteSettingsContext);
  if (!ctx) throw new Error('useSiteSettings must be used within SiteSettingsProvider');
  return ctx;
}
