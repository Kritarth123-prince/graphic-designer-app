const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const { asyncHandler } = require('./utils/asyncHandler');

const app = express();

// Trailing-slash mismatches (CLIENT_URL="https://x.netlify.app/" vs the
// browser's actual Origin header "https://x.netlify.app") are a common,
// easy-to-miss cause of every cross-origin request failing — normalize
// it away rather than requiring an exact match including the slash.
const allowedOrigin = (process.env.CLIENT_URL || '').replace(/\/$/, '');

if (!allowedOrigin) {
  console.warn(
    '[cors] WARNING: CLIENT_URL is not set. Every request from the frontend ' +
      'will be blocked by CORS until this is set to your deployed frontend URL ' +
      '(e.g. https://your-site.netlify.app, no trailing slash).'
  );
} else {
  console.log(`[cors] Allowing requests from: ${allowedOrigin}`);
}

app.use(helmet());
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
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
