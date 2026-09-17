# Testing Guide: From Smoke Tests to Adversarial Testing

Run these against your **live deployment**, not just local dev — CORS,
cookies, and Cloudinary behave differently in production than on
`localhost`. Replace `https://designer-sona.onrender.com` below with
your actual Render URL.

You'll need a terminal with `curl` for most of this. A few tests use
your browser's DevTools Console (F12) instead, where noted.

**One important ground rule:** these tests are for testing *your own*
deployed system, which you own. Don't point request-flooding or
injection tests at systems you don't own or don't have permission to
test — several of the commands below (rate-limit tests especially)
would be abuse if aimed at someone else's server.

---

## Level 1 — Smoke tests (does it run at all)

```bash
BASE="https://designer-sona.onrender.com"

curl -i $BASE/api/health
# Expect: 200, {"success":true,"message":"API is running"}

curl -i $BASE/sitemap.xml
# Expect: 200, XML, <loc> entries using YOUR real domain, not localhost

curl -i $BASE/robots.txt
# Expect: 200, plain text, a Sitemap: line pointing at your real domain

curl -i $BASE/api/settings
# Expect: 200, your saved site settings as JSON, INCLUDING "upi" — this
# was briefly excluded during development when nothing consumed it
# publicly (that would have been unnecessary exposure), then restored
# once the product page started actually displaying UPI payment details
# to customers. It's deliberate now, not a leak. If you ever add a
# genuinely sensitive field to SiteSettings that the public site
# shouldn't show, exclude it via PUBLIC_EXCLUDED_FIELDS in
# server/src/controllers/settings.controller.js — same mechanism.

curl -i $BASE/api/products
curl -i $BASE/api/categories
curl -i $BASE/api/portfolio
# Expect: 200 on all three, JSON with your actual published content
```

If any of these fail, stop here — nothing past this point will work
until the basics do. Check Render's logs for the actual error.

---

## Level 2 — Full functional walkthrough

Follow `USER_GUIDE.md` top to bottom on the live site: log in, set
Settings, create a category, create a product, upload preview images,
upload the original file, publish, browse the shop as a visitor, place
an order through the modal, verify the order appears in Admin → Orders
with the customer details actually filled in, walk it through to
`DELIVERED`. This is the single most important test — everything below
is about probing edges of a system that already works end to end.

Also walk through Portfolio (create → publish → view case study),
Contact (submit → check it lands in Admin → Inquiries, and check for
the notification email if SMTP is configured), and Custom Design
(submit → check Admin → Custom Requests).

---

## Level 3 — Validation & edge cases

Things a real user might accidentally do:

```bash
# Login with missing fields
curl -i -X POST $BASE/api/auth/login \
  -H "Content-Type: application/json" -d '{}'
# Expect: 400, one clear message per missing field

# Contact form with an invalid email
curl -i -X POST $BASE/api/contact \
  -F "name=Test" -F "email=not-an-email" -F "subject=Hi" -F "message=Hello"
# Expect: 400, "A valid email is required."

# Order a product that doesn't exist
curl -i -X POST $BASE/api/orders \
  -H "Content-Type: application/json" \
  -d '{"productId":"000000000000000000000000"}'
# Expect: 404, "Product not found or not available."

# Category with an empty name
curl -i -X POST $BASE/api/categories/admin \
  -H "Content-Type: application/json" -H "Cookie: admin_session=<paste a real one>" \
  -d '{"name":""}'
# Expect: 400, "Name is required."
```

**Admin panel checks:**
- Try to publish a product with zero preview images → should be
  blocked with a clear message, not a raw database error.
- Try to delete a category that a product still uses → should be
  blocked with a `409`, not silently orphan the product.
- Upload an 8MB+ image or a >200MB original file → should be rejected
  by size, not hang or crash the request.

---

## Level 4 — Authentication & authorization bypass attempts

This is where you actually try to break in.

### 4.1 — Hit every admin endpoint with no cookie at all

```bash
for path in \
  "/api/admin/dashboard" \
  "/api/settings" \
  "/api/categories/admin" \
  "/api/products/admin/all" \
  "/api/orders/admin/all" \
  "/api/portfolio/admin/all" \
  "/api/contact/admin/all" \
  "/api/custom-design/admin/all"
do
  echo "== $path =="
  curl -s -o /dev/null -w "%{http_code}\n" $BASE$path
done
# Expect: every single one returns 401. If ANY of these return 200
# without a cookie, that's a real, serious bug — stop and report it.
```

(`GET /api/settings`, `/api/categories`, `/api/products`, and
`/api/portfolio` are supposed to be public with no `/admin` in the
path — don't confuse those with their `/admin/...` counterparts above.)

### 4.2 — Try a forged/garbage session cookie

```bash
curl -i $BASE/api/admin/dashboard -H "Cookie: admin_session=totally.fake.jwt"
# Expect: 401. A JWT is cryptographically signed with JWT_SECRET, which
# you never expose — there's no way to forge a valid one without it.

curl -i $BASE/api/admin/dashboard -H "Cookie: admin_session="
# Expect: 401 (empty token)
```

### 4.3 — NoSQL injection attempts

The classic MongoDB bypass trick — trying to make a query match
"anything" instead of an exact value:

```bash
curl -i -X POST $BASE/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":{"$ne":null},"password":{"$ne":null}}'
# Expect: 400 (validation rejects the malformed email) — NOT a
# successful login. express-mongo-sanitize strips the $ne operator
# before it ever reaches a database query.

curl -i "$BASE/api/products?category[\$ne]=null"
# Expect: 400, "Invalid category filter." — not a 500, and definitely
# not a dump of every product regardless of category.
```

### 4.4 — Logout doesn't actually revoke the token (known, documented tradeoff)

```bash
# 1. Log in, save the cookie
curl -i -X POST $BASE/api/auth/login -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"your-real-password"}' \
  -c cookies.txt

# 2. Log out
curl -i -X POST $BASE/api/auth/logout -b cookies.txt

# 3. Try to reuse the SAME cookie value again
curl -i $BASE/api/admin/dashboard -b cookies.txt
```
This one is expected to still work — logout clears the cookie in your
*browser*, but the JWT itself stays valid until it naturally expires
(`JWT_EXPIRES_IN`, default 7 days). This is a documented tradeoff for a
single-admin site, not a bug. Just know it, since it means anyone who
captured that exact cookie value before logout could keep using it
until it expires.

---

## Level 5 — Business logic abuse

### 5.1 — Try to buy something that isn't published

```bash
# Get a draft product's ID from Admin → Products (one you haven't published)
curl -i -X POST $BASE/api/orders -H "Content-Type: application/json" \
  -d '{"productId":"<a draft product'"'"'s _id>"}'
# Expect: 404 — the order controller filters status:'published' server-side
```

### 5.2 — Try to tamper with the price

```bash
curl -i -X POST $BASE/api/orders -H "Content-Type: application/json" \
  -d '{"productId":"<a real published product'"'"'s _id>","price":1}'
# Expect: 201, but check the returned/stored order — the price field you
# sent is IGNORED. The order controller always re-reads the price from
# the actual Product record server-side, never trusts client input for it.
```

### 5.3 — Try to download a private file without being an admin

```bash
curl -i $BASE/api/products/admin/<any product id>/file
curl -i $BASE/api/contact/admin/<any inquiry id>/attachment
# Expect: 401 on both, no cookie set
```

### 5.4 — Rate limiting

```bash
# Login: limited to 10 attempts / 15 min / IP
for i in $(seq 1 12); do
  curl -s -o /dev/null -w "%{http_code} " -X POST $BASE/api/auth/login \
    -H "Content-Type: application/json" -d '{"email":"x@x.com","password":"wrong"}'
done
echo ""
# Expect: mostly 401s, then 429 ("Too many login attempts") on the last couple

# Orders: limited to 30 / hour / IP — same idea with $BASE/api/orders
# Contact: limited to 10 / hour / IP — same idea with $BASE/api/contact
```

---

## Level 6 — File upload bypass attempts (the "trick" tests)

### 6.1 — Forge the declared file type

```bash
echo "this is not actually an image, just plain text" > fake.png

curl -i -X POST $BASE/api/products/admin/<product id>/preview-images \
  -H "Cookie: admin_session=<your admin cookie>" \
  -F "images=@fake.png;type=image/png"
# Expect: 400, "... is not a valid JPEG, PNG, or WebP file."
#
# This is the important one: curl's `;type=` lets you LIE about the file
# type regardless of actual content — exactly what a malicious script
# would do, and exactly what your browser's file picker would never let
# you do by accident. The server checks the actual file bytes (magic
# numbers), not the claimed type, specifically because of this.
```

### 6.2 — Try an oversized request body

```bash
curl -i -X POST $BASE/api/products/admin \
  -H "Content-Type: application/json" -H "Cookie: admin_session=<cookie>" \
  -d "{\"title\":\"$(python3 -c 'print("A"*5000000)')\", \"description\":\"x\",\"price\":1,\"category\":\"000000000000000000000000\"}"
# Expect: 413 or a connection-level rejection — express.json() is capped
# at 2mb (see server/src/app.js)
```

---

## Level 7 — Client-side bypass attempts (browser DevTools)

These test whether the **frontend's** validation is the only thing
stopping bad data — it should never be. Open DevTools Console (F12) on
your live site and try:

### 7.1 — Bypass the "required" fields on the contact form

Fill in nothing, then run this in the console before clicking submit:
```javascript
document.querySelectorAll('input[required], textarea[required]')
  .forEach(el => el.removeAttribute('required'));
```
Now try submitting the empty form. **Expected**: the browser lets the
empty form submit (since you removed the HTML5 validation), but the
**server** still rejects it with the same validation errors as Level 3
— because the real validation lives in `express-validator` on the
backend, not in the `required` attribute. If this silently "succeeds"
with empty data, that's a real bug.

### 7.2 — Call the API directly, skipping the UI entirely

```javascript
fetch('https://designer-sona.onrender.com/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ productId: 'not-a-real-id', customerName: '<script>alert(1)</script>' })
}).then(r => r.json()).then(console.log)
```
**Expected**: `400` (invalid Mongo ID format) — never a crash, never a
stack trace in the response. Also worth checking: does the `<script>`
tag ever render unescaped anywhere it's later displayed (e.g. in Admin
→ Orders)? It shouldn't — React escapes all text content by default,
and this codebase has no `dangerouslySetInnerHTML` anywhere (verified
by searching the whole client codebase).

### 7.3 — Tamper with your own session cookie

DevTools → Application/Storage tab → Cookies → find `admin_session` →
edit a single character in the value → reload the admin panel.
**Expected**: you're bounced to `/admin/login` — an altered JWT fails
signature verification and is rejected.

---

## What "passing" looks like

| Area | Pass condition |
|---|---|
| Auth | Every `/admin` route (frontend and API) is unreachable without a valid session |
| Injection | `$` operators and malformed query params never reach a raw Mongo query |
| File uploads | Content is verified by actual bytes, not the declared type |
| Price integrity | Client-supplied price/status/published fields are never trusted for orders |
| Rate limits | Login/orders/contact all throttle after their documented threshold |
| XSS | No user-supplied text ever renders as live HTML anywhere |
| Errors | No response body ever contains a stack trace or file path |

If something in this guide reveals a real failure — not the documented,
known tradeoffs (logout/JWT expiry, no visual/browser testing having
been done from this side) — that's a genuine bug. Note the exact
request that triggered it and the exact response you got; that's
enough for a fix.
