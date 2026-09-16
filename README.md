# Luxury Graphic Designer Portfolio + Store

A premium MERN application combining a portfolio, a digital poster store with
manual UPI/WhatsApp ordering, and a custom design request platform.

Built in phases (see `PROGRESS.md` for current status).

## Tech stack

- **Frontend:** React (Vite), React Router, Tailwind CSS, Axios — deployed on **Netlify**
- **Backend:** Node.js, Express — deployed on **Render**
- **Database:** MongoDB Atlas (Mongoose ODM)
- **Auth:** JWT bearer tokens (sent as `Authorization: Bearer <token>`), bcrypt password hashing
- **Email:** Nodemailer over SMTP
- **File storage:** Cloudinary — public preview images, private (`authenticated`
  delivery) original design files and form attachments, accessed only via
  short-lived signed URLs
- **Payment:** No gateway — manual UPI transfer, verified by the designer,
  ordering initiated via WhatsApp click-to-chat

## Folder structure

```
graphic-designer-app/
├── client/                  # React frontend
│   └── src/
│       ├── components/      # common, layout, product, portfolio, forms, admin
│       ├── pages/           # public/, admin/
│       ├── layouts/
│       ├── hooks/
│       ├── context/
│       ├── services/        # API clients
│       ├── utils/
│       └── routes/
└── server/                  # Express backend
    └── src/
        ├── config/          # DB + Cloudinary connection
        ├── controllers/
        ├── middleware/
        ├── models/          # Mongoose schemas
        ├── routes/
        ├── services/        # includes fileStorage.service.js (Cloudinary)
        ├── utils/
        └── validators/
```

## Data models (Phase 1)

| Model | Purpose |
|---|---|
| `AdminUser` | Single designer/admin login, bcrypt password hash |
| `Product` | Poster/design catalog item; original file is a private storage key, never a public URL |
| `Category` | Product categorization |
| `Order` | Manual order record created at WhatsApp checkout; tracked through `PENDING → SCREENSHOT_RECEIVED → PAYMENT_VERIFIED → DELIVERED` |
| `PortfolioProject` | Case studies, separate from the shop |
| `ContactInquiry` | General contact form submissions |
| `CustomDesignRequest` | Custom project request submissions |
| `SiteSettings` | Single document: WhatsApp number, UPI details, hero copy, socials, etc. |
| `Testimonial` | Optional client testimonials |

## Getting started (local dev)

```bash
# backend
cd server
cp .env.example .env   # fill in MongoDB Atlas URI, JWT secret, SMTP, Cloudinary creds
npm install
npm run dev

# frontend
cd client
cp .env.example .env
npm install
npm run dev
```

## Environment variables

See `server/.env.example` and `client/.env.example`. Email credentials,
JWT secret, database URI, and storage keys live **only** in the backend
`.env` — never in frontend code or environment variables.

## Admin authentication (Phase 2)

There is no public sign-up route — only one designer/admin account exists.
Create (or reset) it via the CLI after setting `MONGODB_URI` and
`JWT_SECRET` in `server/.env`:

```bash
cd server
npm run seed:admin -- "designer@example.com" "a-strong-password-min-10-chars" "Designer Name"
```

Auth endpoints:

| Method | Route | Notes |
|---|---|---|
| `POST` | `/api/auth/login` | Rate-limited (10 attempts / 15 min / IP). Returns a signed JWT in the response body. |
| `POST` | `/api/auth/logout` | Stateless JWT — nothing to invalidate server-side; the client just discards its stored token. |
| `GET` | `/api/auth/me` | Requires a valid `Authorization: Bearer <token>` header; returns the current admin. |

Passwords are hashed with bcrypt (cost factor 12) and never returned by any
query by default (`select: false` on `passwordHash`). Sessions are a signed
JWT returned to the client on login and stored in `localStorage`, then sent
back as an `Authorization: Bearer <token>` header on every admin request
(see `client/src/services/api.js`). A bearer token was chosen over a cookie
specifically because it isn't subject to browsers' cross-site cookie
policies — iOS Safari/WebKit (which every iOS browser runs on, including
Chrome and Firefox) enforces those far more strictly than Chromium/Firefox
on desktop or Android, and was silently dropping the old session cookie.
Protect any future admin route with `requireAuth` from
`server/src/middleware/auth.middleware.js`.

## Dashboard & settings (Phase 3)

| Method | Route | Auth | Notes |
|---|---|---|---|
| `GET` | `/api/settings` | Public | Returns `SiteSettings` (hero copy, WhatsApp number, socials, UPI payment details, etc.) — everything here is now deliberately public because something on the public site actually renders it (see below). `PUBLIC_EXCLUDED_FIELDS` in the controller is the mechanism for excluding a field in the future if a genuinely sensitive one gets added. Auto-creates the default doc on first read. |
| `GET` | `/api/settings/admin` | Admin | The full document, for the settings form itself — currently identical to the public response, kept as a separate route so future admin-only fields have somewhere to go without touching the public one. |
| `PUT` | `/api/settings` | Admin | Field-whitelisted partial update — a stray `_id` or unknown key in the body is silently dropped, not written. |
| `POST` | `/api/settings/admin/image` | Admin | Generic image upload for any settings image field (logo, favicon, hero image, profile image, UPI QR) — one endpoint, the frontend drops the returned URL into whichever field triggered it. Same Cloudinary storage and magic-byte content verification as product/portfolio images. |
| `GET` | `/api/admin/dashboard` | Admin | Product/order/inquiry/custom-request counts, `recordedRevenue` (sum of `PAYMENT_VERIFIED`/`DELIVERED` orders only — manually verified, not from an automatic payment system), and the 5 most recent orders/inquiries/custom requests. |

**The `upi` field's story, for anyone reading the git history and
wondering why it moved twice:** originally the public endpoint returned
the entire settings document with no filtering — a real over-exposure
bug, since at the time nothing on the public site rendered UPI details
at all. Excluded it. Then the product page was built to actually
*display* UPI payment details to customers (see below) — at that point
excluding it would have broken the feature that needed it, so it was
restored to the public response deliberately. Both states were correct
for what was true at the time; the lesson isn't "always exclude" or
"always include," it's that a field's public/private status should
track whether something legitimate actually consumes it, and the
`fields with zero consuming UI` bug (below) is why this whole area
needed a second look.

### Settings fields that existed but were never actually wired to anything

An audit (prompted by this being reported) found that most of the admin
Settings form's fields had no consuming UI at all — the form saved data
that nothing on the public site ever read. Fixed:

| Field | Where it shows now |
|---|---|
| `logoUrl` | Site header, replacing the text wordmark when set |
| `faviconUrl` | Applied dynamically to the actual browser tab icon |
| `heroImageUrl` | Now actually rendered on the homepage (previously only used as an Open Graph meta tag — never visible on the page itself) |
| `social.*` | New "Follow" column in the footer, only shown for the platforms you've actually filled in |
| `email` | Shown as a `mailto:` link in the footer |
| `upi.*` | New block on every product page, right under "Order via WhatsApp" — UPI ID with a one-click copy button, the QR code image, and your payment instructions |

Every image field in the admin Settings form (Logo, Favicon, Hero Image,
Profile Image, UPI QR Code) now has an **Upload** button alongside the
URL text input — pick a file and it uploads to Cloudinary and fills the
URL in automatically, rather than requiring you to host the image
somewhere else first and paste a link.

## Categories & products (Phase 4)

| Method | Route | Auth | Notes |
|---|---|---|---|
| `GET` | `/api/categories` | Public | Enabled categories only. |
| `GET/POST/PUT/DELETE` | `/api/categories/admin[/:id]` | Admin | Full CRUD; `PUT /admin/reorder` for bulk sort-order updates. Deleting a category referenced by any product returns `409`, not a silent cascade. |
| `GET` | `/api/products` | Public | Search (`q`, text index on title/description/tags/productId), `category` (slug), `sort` (`newest`\|`featured`\|`price_asc`\|`price_desc`), pagination. Published items only. Response never includes `file`, `status`, or `published`. |
| `GET` | `/api/products/:slug` | Public | Same projection as above. |
| `GET/POST/PUT/DELETE` | `/api/products/admin[/:id]` | Admin | Full document, all statuses. `productId` auto-generates as `POSTER-001`, `POSTER-002`, ... unless explicitly provided. |
| `PUT` | `/api/products/admin/:id/publish` \| `/unpublish` \| `/archive` | Admin | Explicit status transitions — a new product always starts as an unpublished draft. **Publishing is blocked with a `400` and a clear message if the product has no `thumbnail` yet** — `thumbnail` auto-populates from the first uploaded preview image, so a product can exist as a draft with no images, but can't go live without at least one. |
| `POST/DELETE` | `/api/products/admin/:id/preview-images[/:imageId]` | Admin | Multipart upload, max 10 files/8MB each, JPEG/PNG/WebP only. Uploaded to Cloudinary with a random UUID as the public ID — the original filename is never trusted for anything beyond display. |
| `POST` | `/api/products/admin/:id/file` | Admin | The original design file (PSD/AI/PDF/PNG/JPEG/ZIP, ≤200MB). Uploaded to Cloudinary as `type: 'authenticated'` — **no public URL is ever generated for it.** |
| `GET` | `/api/products/admin/:id/file` | Admin | Redirects to a freshly generated, 5-minute signed Cloudinary URL — generated only after `requireAuth` passes, so a customer can never obtain one. |

### File storage (Cloudinary)

`server/src/services/fileStorage.service.js` uploads to Cloudinary behind a
small interface (`save*`/`delete*`/`*FilePath`) so no controller needs to
know the storage provider. Preview images upload as ordinary public assets
(their `secure_url` is stored directly on the document); original design
files and form attachments upload with `type: 'authenticated'`, Cloudinary's
access-controlled delivery type — the asset simply isn't fetchable without
a valid signature, and `originalFilePath()`/`attachmentFilePath()` generate
one (via `cloudinary.utils.private_download_url`, 5-minute expiry) only
when called, which only happens after an admin route's `requireAuth` has
already passed.

Requires `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and
`CLOUDINARY_API_SECRET` in `server/.env` (from your Cloudinary dashboard).

**Testing note:** this sandbox has no network access to `cloudinary.com`,
so the actual upload/delete/signed-URL calls were verified by mocking
`cloudinary.uploader.upload`/`destroy` to confirm this app's code passes
the correct options — while still letting the real Cloudinary SDK generate
the signing logic itself (no network needed for that part). A real signed
URL with `signature=`/`expires_at=`/`api_key=` params was produced and
confirmed correct; the full authenticated-download route was tested
end-to-end (blocked without auth, redirects to a valid signed URL with
auth). What's **not** verified is an actual round-trip against the live
Cloudinary API — do one real upload/download once you have real
credentials, before considering this fully proven in production.

## Public shop & product pages (Phase 5)

React frontend, Tailwind-based design system:

- **Design tokens** — `client/tailwind.config.js`: near-black/charcoal/ivory
  palette with a muted gold accent (spec §4), Fraunces (serif, headlines)
  + Archivo (sans, UI/body), per spec §5.
- `ShopPage` — search (debounced), category filter, sort, pagination,
  loading skeletons, empty state — all against `GET /api/products`.
- `ProductPage` — gallery with fullscreen lightbox, sticky details panel,
  "Order via WhatsApp" button built from `utils/whatsapp.js` (reusable
  URL builder, per spec §19 — never hard-code the number in a component).
- `SiteSettingsContext` — fetches `/api/settings` once, feeds the header,
  footer, and WhatsApp number.
- Other nav destinations (`/portfolio`, `/about`, `/contact`, etc.) render
  a lightweight `ComingSoon` placeholder rather than 404ing — they're
  built out in Phases 7–9. The full cinematic homepage treatment (spec
  §15) is also intentionally minimal for now; `HomePage` links into the
  shop but isn't the final hero design.

**Testing note:** this sandbox has no headless browser, so I verified the
build compiles cleanly (`vite build`, catches JSX/import errors) and that
`vite preview` serves the app correctly, but I have not visually confirmed
the rendered layout. Worth a look in an actual browser before shipping.

## WhatsApp ordering & order tracking (Phase 6)

| Method | Route | Auth | Notes |
|---|---|---|---|
| `POST` | `/api/orders` | Public, rate-limited (30/hr/IP) | Fired when the customer clicks "Order via WhatsApp". Snapshots `productName`/`price`/`currency` from the product at that moment (so a later price change doesn't rewrite order history). Rejects unpublished/nonexistent products with `404`. |
| `GET` | `/api/orders/admin/all` | Admin | Search (`q` — matches order ID, product name, or customer name/email/phone), filter by `status`, paginated. |
| `GET` | `/api/orders/admin/:id` | Admin | Single order, product populated. |
| `PUT` | `/api/orders/admin/:id` | Admin | Edit customer contact details and notes if the customer didn't provide them, or you learn more over WhatsApp. |
| `PUT` | `/api/orders/admin/:id/status` | Admin | Transitions through `PENDING → SCREENSHOT_RECEIVED → PAYMENT_VERIFIED → DELIVERED` (or `CANCELLED`). Setting `PAYMENT_VERIFIED` stamps `verifiedAt`; `DELIVERED` stamps `deliveredAt`. |

**Frontend flow:** clicking "Order via WhatsApp" opens a short modal
(`OrderDetailsModal`) asking for Name and Email (Phone optional) — this is
what actually populates `Order.customerName`/`customerEmail`/`customerPhone`,
rather than leaving them blank for the admin to fill in from scratch later.
On submit, `POST /api/orders` is called with those details to get an order
reference, then WhatsApp opens with the reference and customer name included
in the pre-filled message — but if order creation fails for any reason,
WhatsApp still opens without it. The actual ability to reach the designer
must never depend on the tracking record succeeding.

**Scope note:** this phase covers the customer-facing order flow and the
admin *API* for managing orders. The admin *frontend* is built in Phase 6.5,
below.

## Admin frontend (Phase 6.5)

React admin panel at `/admin`, deliberately plainer than the public site
(neutral grays, tables, no serif/gold — spec §52):

- `/admin/login` — email/password, redirects to intended page after login
- `/admin` — dashboard (stat cards + recent orders/inquiries/custom requests)
- `/admin/settings` — full site-settings form (hero copy, about, UPI, socials, footer)
- `/admin/categories` — inline create/rename/enable-toggle/delete (delete blocked with a clear message if a product still references it)
- `/admin/products` — searchable/filterable table, quick publish/unpublish/archive, delete with a confirmation dialog
- `/admin/products/new` and `/admin/products/:id` — full product form, preview-image upload/removal (with thumbnail grid), original-file upload/download
- `/admin/orders` — searchable/filterable table, inline status dropdown per row, expandable row for customer details and notes, cancel requires confirmation

Shared pieces: `AdminAuthContext` (session check + login/logout),
`ToastContext` (spec §58's consistent success/error toasts), `ConfirmDialog`
(used for every destructive action per spec §25), `ProtectedRoute` (redirects
to login, preserving the originally requested page).

**Verified live**, not just built: ran the exact API sequence the UI makes —
login → dashboard → settings read/write → categories/products/orders
listing → logout — against the real Express app (DB calls stubbed, as in
earlier phases; no Atlas access in this sandbox). All steps returned
correct status codes and data.

### Known limitations worth knowing about

- **Logout doesn't revoke the JWT server-side.** It clears the token from
  the browser's `localStorage`, but the token itself stays cryptographically
  valid until it expires (`JWT_EXPIRES_IN`, default 7 days) — there's no
  server-side session store to blocklist it. Reasonable for a single-admin
  site; would need a token-revocation store to harden further.
- **Auth moved from a cookie to a bearer token.** *(Updated: see the
  Deployment section at the end of this file.)* Login originally set an
  `HttpOnly`, `SameSite=None; Secure` session cookie, needed because Render
  and Netlify sit on different top-level domains. That worked on
  Chromium/Firefox but iOS Safari/WebKit (which every iOS browser runs on)
  enforces cross-site cookie restrictions strictly enough that the cookie
  was silently dropped there — login would succeed but the follow-up
  request to load admin data had no session. The fix was to stop using a
  cookie at all: login now returns the JWT directly in the response body,
  the client stores it and sends it back as an `Authorization: Bearer
  <token>` header on every admin request. A header isn't subject to any
  cross-site cookie policy, so this works identically on every browser and
  platform. `server/src/config/cookie.js` and `cookie-parser` have been
  removed since nothing uses cookies for auth anymore.

## Portfolio system (Phase 7)

Separate from the shop, per spec §27–28. Reuses `generateUniqueSlug` and
the same public preview-image storage as products.

| Method | Route | Auth | Notes |
|---|---|---|---|
| `GET` | `/api/portfolio` | Public | Published only, featured first. |
| `GET` | `/api/portfolio/:slug` | Public | Case-study detail. |
| `GET/POST/PUT/DELETE` | `/api/portfolio/admin[/:id]` | Admin | Full CRUD; new projects start as unpublished drafts. |
| `PUT` | `/api/portfolio/admin/:id/publish` \| `/unpublish` | Admin | |
| `POST/DELETE` | `/api/portfolio/admin/:id/images[/:imageId]` | Admin | Same validation/storage as product preview images. |

Frontend: `/portfolio` (gallery grid) and `/portfolio/:slug` (case study —
hero image, Brief/Creative Direction/Process/Final Result sections, then
any remaining images). Admin: `/admin/portfolio` list + publish toggle,
`/admin/portfolio/new` and `/admin/portfolio/:id` for the form and image
management.

**Verified:** full lifecycle tested against the real Express app — create
as draft (correctly absent from the public API), publish, case-study
lookup by slug, a real image written to disk and served back, and
auth-gating on the admin routes.

## Contact & email (Phase 8)

| Method | Route | Auth | Notes |
|---|---|---|---|
| `POST` | `/api/contact` | Public, rate-limited (10/hr/IP) | Multipart (optional attachment). Saves the inquiry **regardless of whether the notification email succeeds** — a down SMTP server should never lose a customer's message. Response includes `emailSent: true/false` so a failure is at least visible in logs. |
| `GET` | `/api/contact/admin/all` | Admin | Filter by `read`. |
| `GET` | `/api/contact/admin/:id` | Admin | |
| `PUT` | `/api/contact/admin/:id/read` \| `/unread` | Admin | |
| `DELETE` | `/api/contact/admin/:id` | Admin | |
| `GET` | `/api/contact/admin/:id/attachment` | Admin | Attachments are private (same pattern as product original files), not public URLs. |

`server/src/services/email.service.js` wraps Nodemailer/SMTP. The
transporter is created **lazily** — missing `EMAIL_HOST`/`EMAIL_USER`/etc.
in `.env` won't crash the server on startup, only surface a clear error
at send time (which is what "no SMTP configured" looked like in testing
below).

Frontend: `/contact` (form matching spec §31's fields exactly, with a
thank-you state on success) and `/admin/inquiries` (inbox — filter by
read/unread, click a row to expand and auto-mark-read, download any
attachment, delete with confirmation).

**Verified:** submitted a contact form against the real app with no SMTP
configured in this sandbox — confirmed the inquiry still saves and the
request still returns success (`emailSent: false` surfaces the failure
without losing the message), validation errors are clean, and all admin
routes correctly reject unauthenticated requests.

**Bug caught during this phase:** the same "Invalid value" +
custom-message duplication from Phase 2's login validator had actually
crept into four other required-field validators (category name, product
title/description, portfolio title) — fixed all of them, not just the
new contact one, once I spotted the pattern.

## Custom design requests (Phase 9)

Same shape as Contact (Phase 8), with a quote-workflow status instead of
read/unread.

| Method | Route | Auth | Notes |
|---|---|---|---|
| `POST` | `/api/custom-design` | Public, rate-limited (10/hr/IP) | Multipart (optional reference file). Same resilience principle as Contact — saved regardless of email outcome. |
| `GET` | `/api/custom-design/admin/all` | Admin | Filter by `status`. |
| `GET` | `/api/custom-design/admin/:id` | Admin | |
| `PUT` | `/api/custom-design/admin/:id/status` | Admin | `NEW → IN_REVIEW → QUOTED → ACCEPTED → CLOSED`. |
| `DELETE` | `/api/custom-design/admin/:id` | Admin | |
| `GET` | `/api/custom-design/admin/:id/reference-file` | Admin | Private, same pattern as contact attachments and product originals. |

**Fixed before it shipped:** the `CustomDesignRequest` model originally
had `referenceFileUrl` as a plain public URL string — same mistake as
Phase 8's `ContactInquiry.attachmentUrl`. Corrected to the private
`storageKey`/`originalName` pattern before building the controller
around it, so a customer's reference file (which could be anything —
a brand deck, a personal photo) never becomes a guessable public link.

Frontend: `/custom-design` (positioning copy, services list, full
request form per spec §30) and `/admin/custom-requests` (status
workflow, expandable detail view, reference-file download).

**Verified:** full flow tested against the real app — resilient
submission with no SMTP configured, clean validation errors, correct
status-enum enforcement, and auth-gating on every admin route.

---

## SEO, security, performance, accessibility & QA (Phase 10)

**Security**
- Added `express-mongo-sanitize` — strips `$`/`.` keys from
  `req.body`/`query`/`params` before they reach a Mongoose query.
  **Tested with a real injection attempt**: a `{"$ne": null}` payload
  against login and a `?category[$ne]=null` query-string attack against
  the product list — both neutralized, and the error response never
  leaked a stack trace (confirmed by reading the actual response body,
  not just the server log).
- Malformed query params (e.g. an object where `category` expects a
  string) now return a clean `400` instead of a generic `500`.
- **File upload content verification** (`server/src/utils/fileSignature.js`,
  added post-launch during adversarial testing): multer's `fileFilter`
  only checks the *declared* Content-Type of a multipart part, which any
  raw HTTP client can forge regardless of actual content — confirmed
  this by literally uploading non-image bytes labeled `image/png` and
  watching it succeed. Every upload path (product preview images,
  original design files, portfolio images, contact/custom-design
  attachments) now also verifies the actual file bytes against known
  magic-number signatures before anything reaches Cloudinary. See
  `TESTING_GUIDE.md` §6.1 to verify this yourself.

**SEO**
- `GET /sitemap.xml` and `GET /robots.txt` — dynamic, built from live
  published products/portfolio projects. Mounted at the domain root
  (not `/api`), since crawlers expect them there. **Set `SITE_URL`** in
  `server/.env` to your deployed frontend's origin — without it the
  sitemap falls back to `CLIENT_URL`, which is only correct for local
  dev.
- `useDocumentMeta` hook (client) sets `document.title`, meta
  description, Open Graph tags, and canonical URL per page. Applied to
  the homepage, product page, and portfolio case study. Since this is a
  client-rendered SPA with no SSR, these tags update *after* the initial
  HTML loads — fine for browsers and JS-executing crawlers (Google is),
  but a bot that doesn't run JS only sees the static `index.html`
  defaults. Worth knowing if that ever matters more than it does for a
  storefront this size.
- **Real gap caught and fixed**: the `seo.title`/`metaDescription`/
  `ogImage` fields have existed on the Product and Portfolio models
  since Phase 1, but the create/update controllers never actually
  accepted them, and no admin form exposed them — so they were
  permanently empty no matter what. Fixed both the backend (both
  controllers) and the admin forms.

**Performance**
- Admin is now a separate, lazily-loaded bundle (`React.lazy` +
  `Suspense`), split from the public site — confirmed via a real build:
  the main public bundle dropped from ~311KB to ~262KB raw, with each
  admin page now its own on-demand chunk. Verified the chunks actually
  serve correctly through `vite preview`, not just that the build
  succeeded.
- Below-the-fold gallery/portfolio images use `loading="lazy"`; the
  main/hero image on each page stays eager so it doesn't delay Largest
  Contentful Paint.
- Static preview images already had `maxAge: 7d` caching from Phase 4.

**Accessibility**
- Toasts now live in an `aria-live="polite"` region so screen readers
  announce them.
- `ConfirmDialog` uses `role="alertdialog"` / `aria-modal` /
  `aria-labelledby`.
- `prefers-reduced-motion` was already handled globally (Phase 5);
  forms already use real `<label>` associations throughout.

**Content pages** (closing the "no broken links" gap from spec §73)
- Built out `/about` (uses existing `SiteSettings.aboutText`/
  `profileImageUrl` — no new backend needed), `/faq`, and the four legal
  pages (`/order-information`, `/privacy-policy`, `/terms`,
  `/refund-policy`). The legal pages carry a visible placeholder notice
  — per spec §50's own instruction, this is template content, **not
  reviewed legal wording**, and needs a real pass before launch.

### What's honestly still open

- **No visual QA.** This sandbox has no headless browser at any point
  across all 10 phases — every UI verification here was build-success,
  live API testing against a running server, or served-correctly
  checks, never an actual rendered screenshot. Open the site in a real
  browser before trusting the visual polish, especially at the
  responsive breakpoints spec §48/§72 call out (320/375/390/430/768/
  1024/1440/1920px) — none of those were tested.
- **No real MongoDB Atlas run.** Every backend test across all 10
  phases used stubbed Mongoose model methods against a real running
  Express app (real HTTP requests, real validation, real file I/O) —
  not a real database. Connect a real `MONGODB_URI` and re-run the
  basic flows once before going live.
- **Auth now uses a bearer token, not a cookie** (see the Deployment
  section) — this removed the cross-origin cookie tradeoff entirely.
  **JWT logout not being server-revocable** (flagged in Phase 6.5) is
  still true — nothing in this phase changed that.
- **Legal page content is a placeholder**, not reviewed legal text.
- Lighthouse/axe-style automated audits weren't run (no such tooling
  available in this sandbox) — the accessibility and performance work
  above is what I could verify by hand and by reading the actual output.

---

All 9 core feature phases plus the admin frontend are now complete.
**Phase 10 (SEO, security, performance, accessibility, final QA)** is
the only phase left in the original 10-phase plan.

## Preview image download deterrents

`client/src/utils/imageProtection.js` disables right-click and drag on
every public preview image (shop grid, product gallery, portfolio grid,
case studies). Read the comment at the top of that file before assuming
it does more than it does: **this is friction, not security.** It stops
the basic "right-click → Save Image As" and drag-to-desktop paths and
nothing else — anyone using browser dev tools (Network/Elements tab),
disabling JavaScript, or taking a screenshot bypasses it completely.
There is no client-side way to prevent that for content that must be
visibly rendered in a browser; no combination of JS tricks changes that.

The only *actual* protection is what the spec already calls for:
**watermark preview images before uploading them.** The original,
unwatermarked design files remain genuinely protected — private
Cloudinary storage, no public URL, admin-only signed download — that
part is real security and doesn't depend on any client-side trick.

## Deployment (Render + Netlify + Cloudinary + MongoDB Atlas)

### 1. MongoDB Atlas
1. Create a free cluster, a database user (username/password), and note
   your database name.
2. Network Access → allow Render's outbound traffic. Render's IPs aren't
   fixed on the free/starter tier, so the practical option is **Allow
   Access from Anywhere (0.0.0.0/0)** — the tradeoff is that database
   access then depends entirely on your connection string's credentials
   being strong and secret, not on IP restriction. If Atlas later
   supports Render's private networking/VPC peering for your plan, that's
   the stronger option.
3. Connect → Drivers → copy the connection string → this is `MONGODB_URI`.

### 2. Cloudinary
1. Sign up, go to the dashboard.
2. Copy **Cloud name**, **API Key**, **API Secret** → these are
   `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET`.

### 3. Backend on Render
1. New → Web Service → connect this repo. Root directory: `server`
   (a `render.yaml` blueprint is included at the repo root if you'd
   rather use Render's "Blueprint" deploy flow instead of the manual UI).
2. Build command: `npm install`. Start command: `npm start`.
3. Set environment variables (see `server/.env.example` for the full
   list): `MONGODB_URI`, `JWT_SECRET` (Render can generate this for you),
   `EMAIL_HOST`/`EMAIL_PORT`/`EMAIL_USER`/`EMAIL_PASSWORD`/`EMAIL_FROM`/
   `CONTACT_RECEIVER_EMAIL`, `CLOUDINARY_CLOUD_NAME`/`CLOUDINARY_API_KEY`/
   `CLOUDINARY_API_SECRET`, `NODE_ENV=production`.
4. `CLIENT_URL` and `SITE_URL` need your Netlify URL — you'll come back
   and set these after step 4, once you know it.
5. Deploy. Note the Render service URL (`https://your-app.onrender.com`).
6. Once deployed, run the admin-creation script from your local machine
   pointed at the production database (or via Render's shell):
   `npm run seed:admin -- "you@example.com" "a-strong-password" "Your Name"`.

### 4. Frontend on Netlify
1. New site from Git → connect this repo. Base directory: `client`.
   Build command and publish directory are already set in
   `client/netlify.toml` (`npm run build`, `dist`) — Netlify should
   pick these up automatically.
2. Set `VITE_API_BASE_URL` to `https://your-app.onrender.com/api`.
3. In `client/netlify.toml` and `client/public/_redirects`, replace the
   two placeholder `your-app.onrender.com` URLs (for `/sitemap.xml` and
   `/robots.txt`) with your actual Render backend URL — same host as
   step 2, without the `/api` suffix.
4. Deploy. Note the Netlify URL (`https://your-site.netlify.app`).
5. **Go back to Render** and set `CLIENT_URL` and `SITE_URL` to this
   Netlify URL, then redeploy the backend so CORS and the sitemap both
   pick it up.

**Security headers** (Content-Security-Policy, X-Frame-Options,
X-Content-Type-Options, Referrer-Policy, Permissions-Policy) are set in
`client/netlify.toml` for the frontend, and via `helmet()` plus one small
extra middleware in `server/src/app.js` for the API. If you add a new
external resource to the frontend (an embed, a script, another image
host), it needs a matching entry in that CSP or it will be silently
blocked.

### Why this specific combination needed real code changes

Render and Netlify's default URLs are on different top-level domains —
that's genuinely cross-site from a browser's perspective, which matters
for two things this app does:

- **Admin auth.** This was originally a session cookie, which needed
  `SameSite=None; Secure` to survive the cross-site Netlify → Render
  request. That worked on desktop/Android browsers but was silently
  dropped by iOS Safari/WebKit's stricter cross-site cookie handling
  (affecting every iOS browser, since they all run on WebKit) — login
  would succeed but the next request had no session. Auth now uses a
  JWT bearer token instead: login returns the token in the response
  body, the client stores it and sends `Authorization: Bearer <token>`
  on every admin request. A header isn't subject to cross-site cookie
  policy at all, so this works the same on every browser and platform,
  and there's no cookie configuration to get right. `cookie-parser` and
  `server/src/config/cookie.js` have been removed accordingly.
- **The SPA's client-side routing.** Netlify serves static files by
  default, so refreshing a deep link like `/shop/some-poster` would
  404 without a rewrite rule. `client/public/_redirects` and
  `client/netlify.toml` both handle this — confirmed the rule actually
  ships in the build output.
