// Stores the admin JWT for the Authorization-header auth path (see
// server/src/middleware/auth.middleware.js for why this exists
// alongside the cookie — Safari/iOS blocks the cross-site cookie).
//
// localStorage rather than sessionStorage or in-memory: an admin panel
// used repeatedly across a work session shouldn't force a re-login on
// every page refresh or every time the tab is reopened. The tradeoff is
// that a token in localStorage is readable by any JavaScript that runs
// on the page, including injected via XSS — the HttpOnly cookie doesn't
// have this exposure. This codebase has no `dangerouslySetInnerHTML`
// anywhere (verified), so there's no known XSS sink today, but this is
// worth knowing if that ever changes.
const KEY = 'admin_token';

export function getToken() {
  return localStorage.getItem(KEY);
}

export function setToken(token) {
  localStorage.setItem(KEY, token);
}

export function clearToken() {
  localStorage.removeItem(KEY);
}
