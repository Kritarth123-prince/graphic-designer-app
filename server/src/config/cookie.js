// Centralized so login/logout can't drift out of sync on cookie flags.
const SESSION_COOKIE_NAME = 'admin_session';

function sessionCookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd, // requires HTTPS in production — Render/Netlify both give you this by default
    // Render (api.onrender.com) and Netlify (site.netlify.app) are on
    // different top-level domains by default — that's genuinely
    // cross-site, so SameSite=Strict/Lax would silently stop the browser
    // from sending this cookie on any admin API call and login would
    // appear to fail with no clear error. SameSite=None is required for
    // this specific deployment shape to work at all.
    //
    // This is safe here because: (1) CORS is locked to one exact origin
    // (CLIENT_URL), not reflected dynamically; (2) every mutating admin
    // route uses PUT/DELETE or a JSON body, both of which force a CORS
    // preflight that a different origin will fail — so the classic
    // SameSite=None CSRF risk (a hidden auto-submitting form on another
    // site) doesn't apply to this API's endpoints.
    //
    // If you later put the frontend and API on subdomains of the same
    // parent domain (e.g. app.yoursite.com + api.yoursite.com), you can
    // switch this back to 'strict' for defense-in-depth — it isn't
    // required for correctness in that setup, only here.
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, matches JWT_EXPIRES_IN default
    path: '/',
  };
}

module.exports = { SESSION_COOKIE_NAME, sessionCookieOptions };
