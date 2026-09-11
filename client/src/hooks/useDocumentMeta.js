import { useEffect } from 'react';

function setMetaTag(attr, key, content) {
  if (!content) return;
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(url) {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', url);
}

const JSONLD_ID = 'jsonld-structured-data';

function setStructuredData(data) {
  let el = document.getElementById(JSONLD_ID);
  if (!data) {
    if (el) el.remove();
    return;
  }
  if (!el) {
    el = document.createElement('script');
    el.id = JSONLD_ID;
    el.type = 'application/ld+json';
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

/**
 * This is a client-rendered SPA with no server-side rendering, so these
 * tags update after the initial HTML loads — fine for browser tabs and
 * for crawlers that execute JS (Google does), but a search engine or
 * social-preview bot that doesn't run JS will only ever see the static
 * defaults in index.html. Worth keeping in mind if that ever matters
 * more than it does for a small storefront like this.
 */
export function useDocumentMeta({ title, description, image, path, structuredData }) {
  useEffect(() => {
    if (title) document.title = title;
    setMetaTag('name', 'description', description);
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:image', image);
    setMetaTag('property', 'og:type', 'website');

    if (path) {
      const origin = window.location.origin;
      setCanonical(`${origin}${path}`);
      setMetaTag('property', 'og:url', `${origin}${path}`);
    }

    setStructuredData(structuredData);
    return () => setStructuredData(null);
  }, [title, description, image, path, structuredData]);
}
