const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const { asyncHandler } = require('./utils/asyncHandler');

const app = express();

// Trailing-slash mismatches (CLIENT_URL="https://x.netlify.app/" vs the
// browser's actual Origin header "https://x.netlify.app") are a common,
// easy-to-miss cause of every cross-origin request failing — normalize
// it away rather than requiring an exact match including the slash.
// CLIENT_URL can be a comma-separated list (e.g. both your LAN IP and
// localhost while developing) — useful since the same dev server is
// often reachable at more than one origin.
const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean);

if (allowedOrigins.length === 0) {
  console.warn(
    '[cors] WARNING: CLIENT_URL is not set. Every request from the frontend ' +
      'will be blocked by CORS until this is set to your frontend URL(s) ' +
      '(e.g. https://your-site.netlify.app, or a comma-separated list, no trailing slash).'
  );
} else {
  console.log(`[cors] Allowing requests from: ${allowedOrigins.join(', ')}`);
}

app.use(helmet());
// helmet() already sets CSP, X-Frame-Options, X-Content-Type-Options, and
// Referrer-Policy — Permissions-Policy is the one header it doesn't set
// by default.
app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()');
  next();
});
app.use(
  cors({
    origin(origin, callback) {
      // No Origin header (e.g. curl, server-to-server) — nothing to check against.
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
// Strips keys starting with '$' or containing '.' from req.body/query/params —
// prevents NoSQL operator injection (e.g. {"email": {"$ne": null}}) from
// reaching a Mongoose query built from user input.
app.use(mongoSanitize());

// Preview images are served directly from Cloudinary's CDN (their
// secure_url is stored on each document) — nothing to mount here.
// Original design files and attachments are Cloudinary `authenticated`
// assets, resolved on demand via signed URLs, never a static mount.

// Feature routes are mounted here as each phase is built.
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/settings', require('./routes/settings.routes'));
app.use('/api/admin/dashboard', require('./routes/dashboard.routes'));
app.use('/api/categories', require('./routes/category.routes'));
app.use('/api/products', require('./routes/product.routes'));
app.use('/api/orders', require('./routes/order.routes'));
app.use('/api/portfolio', require('./routes/portfolio.routes'));
app.use('/api/contact', require('./routes/contact.routes'));
app.use('/api/custom-design', require('./routes/customDesign.routes'));

// Root-level, not under /api — conventional locations crawlers expect.
const seoController = require('./controllers/seo.controller');
app.get('/sitemap.xml', asyncHandler(seoController.sitemap));
app.get('/robots.txt', seoController.robotsTxt);
// ...

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API is running' });
});

// 404 handler for unmatched API routes
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: 'Not found' });
});

// Centralized error handler (expanded in Phase 10)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.expose ? err.message : 'Unable to process your request.',
  });
});

module.exports = app;
