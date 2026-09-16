const { Product, PortfolioProject } = require('../models');

// The frontend is a separate deployment (no SSR), so this sitemap needs
// the PUBLIC site's own base URL to build correct <loc> entries — not
// this API's own URL. Set SITE_URL in server/.env to the deployed
// frontend's origin (e.g. https://www.yoursite.com). Falls back to
// CLIENT_URL, which is close enough for local/dev use — CLIENT_URL can
// be a comma-separated list (see app.js), so just take the first origin.
function siteBaseUrl() {
  const fallback = (process.env.CLIENT_URL || '').split(',')[0];
  return (process.env.SITE_URL || fallback || '').trim().replace(/\/$/, '');
}

const STATIC_PATHS = [
  '/',
  '/shop',
  '/portfolio',
  '/about',
  '/custom-design',
  '/contact',
  '/faq',
  '/order-information',
  '/privacy-policy',
  '/terms',
  '/refund-policy',
];

async function sitemap(req, res) {
  const base = siteBaseUrl();

  const [products, portfolioProjects] = await Promise.all([
    Product.find({ status: 'published', published: true }).select('slug updatedAt'),
    PortfolioProject.find({ published: true }).select('slug updatedAt'),
  ]);

  const urls = [
    ...STATIC_PATHS.map((p) => ({ loc: `${base}${p}`, lastmod: null })),
    ...products.map((p) => ({ loc: `${base}/shop/${p.slug}`, lastmod: p.updatedAt })),
    ...portfolioProjects.map((p) => ({ loc: `${base}/portfolio/${p.slug}`, lastmod: p.updatedAt })),
  ];

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls
      .map(
        (u) =>
          `  <url>\n    <loc>${u.loc}</loc>\n` +
          (u.lastmod ? `    <lastmod>${u.lastmod.toISOString()}</lastmod>\n` : '') +
          `  </url>`
      )
      .join('\n') +
    `\n</urlset>`;

  res.set('Content-Type', 'application/xml');
  res.send(xml);
}

function robotsTxt(req, res) {
  const base = siteBaseUrl();
  const lines = ['User-agent: *', 'Allow: /', 'Disallow: /admin', `Sitemap: ${base}/sitemap.xml`];
  res.set('Content-Type', 'text/plain');
  res.send(lines.join('\n'));
}

module.exports = { sitemap, robotsTxt };
