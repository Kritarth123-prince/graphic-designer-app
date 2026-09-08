# Complete Walkthrough: From Empty Site to a Finished Sale

This walks through the entire system exactly as it's built — every screen,
every field, every button — from a freshly deployed site with no data,
through a customer actually buying a poster, to you delivering the file.

---

## Before you start

You need:
- The site deployed (or running locally) with a working `MONGODB_URI`,
  `JWT_SECRET`, and — if you want images/files to actually upload —
  `CLOUDINARY_CLOUD_NAME`/`CLOUDINARY_API_KEY`/`CLOUDINARY_API_SECRET` set.
- One admin account created via the CLI (there's no public sign-up):
  ```bash
  cd server
  npm run seed:admin -- "you@example.com" "a-strong-password" "Your Name"
  ```

---

## Part A — Admin setup

### A1. Log in

Go to `/admin/login` and sign in with the email/password from the seed
command above. You'll land on the **Dashboard** — right now it'll show
all zeros, which is expected on a fresh install.

### A2. Fill in Site Settings *(do this before anything else)*

Go to **Settings** in the sidebar. This one page controls the whole
public site's identity and, critically, **whether customers can order
at all** — the "Order via WhatsApp" button on every product simply
won't render until `WhatsApp Number` is filled in here.

Fill in what applies:

| Section | Fields | Why it matters |
|---|---|---|
| Identity | Designer Name, Logo URL, Favicon URL | Shows in the header/footer/browser tab |
| Homepage | Hero Title, Hero Subtitle, Hero Image URL | The big headline on `/` |
| About | About Text, Profile Image URL | Powers the `/about` page directly |
| Contact | **WhatsApp Number** (e.g. `+919999999999`, with country code), Contact Email | WhatsApp Number is required for ordering to work at all |
| Footer | Footer Text | Shown site-wide in the footer |
| UPI Payment | UPI ID, Payment Name, UPI QR Code URL, Payment Instructions | You'll share these manually in WhatsApp once a customer messages you — they're not shown anywhere on the public site itself, they're just here so you have one place to keep them and copy from |
| Social Links | Instagram, Behance, Dribbble, LinkedIn | Optional, for your own reference/future use |

Click **Save Settings**. You can come back and change any of this at
any time — it takes effect immediately.

### A3. Create at least one category

Go to **Categories**. Type a name (e.g. "Minimalist Posters") into the
box at the top and click **Add**. A URL-safe slug is generated for you
automatically. You need at least one category before you can create a
product, since every product requires one.

You can click a category's name inline to rename it, toggle
**Enabled/Disabled** to hide it from the public site without deleting
it, or **Delete** it (blocked if any product still uses it).

### A4. Add a product

Go to **Products → Add Product**. Fill in:

- **Title** *(required)* — e.g. "Minimalist Business Poster"
- **Description** *(required)* — the full product description shown on the product page
- **Short Description** — optional, a one-line summary
- **Price** *(required)* — a plain number, e.g. `499`
- **Category** *(required)* — pick from the dropdown you set up in A3
- **Dimensions** — e.g. `18in x 24in`
- **Format** — e.g. `PSD, PNG, PDF`
- **Tags** — comma-separated, used for search (e.g. `minimalist, business, poster`)
- **Featured** — checkbox; featured products can be sorted to the front on the shop page
- **SEO Title / Meta Description** — optional; falls back to Title/Description if left blank

Click **Create Product**. The product now exists as a **draft** — it's
not visible on the public site yet, and it *can't* be published yet
either, on purpose (see next step).

### A5. Upload preview images

Still on the product's edit page (you're redirected there automatically
after creating it), scroll to **Preview Images**. Click **Upload
Images** and select one or more JPEG/PNG/WebP files (up to 8MB each).

The **first image you upload automatically becomes the product's
thumbnail** — the image shown in the shop grid. This is also what
unlocks publishing: a product can't go live with zero images.

You can remove any image by hovering over it and clicking **Remove**.

### A6. Upload the original design file

Scroll to **Original Design File**. This is the *real* file — PSD, AI,
high-res PDF, whatever the customer is actually paying for. Click
**Upload File** and select it (up to 200MB).

This file is never public. There is no link to it anywhere on the
public site. The only way to retrieve it is the **Download** link that
appears here once uploaded, and that only works while you're logged
in as admin.

### A7. Publish

Go back to **Products**, find your product, and click **Publish**. It
now appears on the live shop.

(If you'd added no images, this would fail with *"Add at least one
preview image before publishing this product"* — that's a guardrail,
not a bug, and A5 is how you clear it.)

---

## Part B — The customer's side

### B1. Browsing

A visitor goes to `/shop`, sees your published products in a grid, and
can search, filter by category, and sort (Newest / Featured / Price).
Clicking a product opens its full page — gallery, description,
dimensions/format, and price.

### B2. Ordering

The customer clicks **Order via WhatsApp**. A short form appears first —
**Name** and **Email** (required), **Phone** (optional) — this is what
actually fills in the order's customer details on your side, instead of
leaving them blank for you to type in later. After they submit it, two
things happen in order:

1. The site creates an order record on your end (status `PENDING`) with
   those details already filled in — visible immediately in **Admin →
   Orders**, no manual entry needed.
2. WhatsApp opens (in a new tab) with a pre-filled message to your
   WhatsApp number, containing their name, the product title, product
   ID, price, and an order reference number — something like:

   ```
   Hello, I would like to purchase:

   My name is Priya Sharma.

   Product: Minimalist Business Poster
   Product ID: POSTER-001
   Price: INR 499
   Order Reference: ORD-20260909-0001

   I found this design on your website.
   Please share the payment details.
   ```

   If step 1 fails for any reason (e.g. a network hiccup), WhatsApp
   still opens — ordering can never get blocked by the tracking step,
   though in that case the order record won't exist and you'd need to
   add it manually in Admin → Orders.

### B3. Payment (entirely inside WhatsApp, not on the site)

From here it's a real conversation:
- You reply with your UPI ID and QR code (the ones you saved in
  Settings → UPI Payment in A2 — copy them in manually).
- The customer pays via their UPI app.
- The customer sends you a screenshot of the payment as proof, in the
  same WhatsApp chat.

Nothing about this step touches the website — there's no payment
gateway, by design.

---

## Part C — You fulfill the order

### C1. Find the order

Go to **Admin → Orders**. Search by the order reference, product name,
or the customer's name/email/phone — these are filled in automatically
now (from the form they filled out before reaching WhatsApp), but you
can still edit them if you learn something different over chat. Click a
row to expand it and see/edit those details plus notes.

### C2. Mark it verified

Use the status dropdown on that order's row to move it through:

`PENDING` → `SCREENSHOT_RECEIVED` → `PAYMENT_VERIFIED` → `DELIVERED`

(or `CANCELLED` if it falls through). Setting `PAYMENT_VERIFIED`
automatically timestamps when that happened; same for `DELIVERED`.
You can jump straight to `PAYMENT_VERIFIED` if you don't need the
intermediate step — the intermediate statuses are there for your own
tracking, not enforced as a strict sequence.

Add a note if useful — e.g. "Screenshot confirmed, ₹499 received."

### C3. Deliver the file

Go back to **Products**, open the product, scroll to **Original Design
File**, and click **Download**. Send that file to the customer directly
through WhatsApp (or email, if that's what you agreed).

### C4. Close it out

Back on the order in **Orders**, set the status to `DELIVERED`. Done —
that order is now fully tracked from click to delivery, entirely
through WhatsApp for the actual transaction, with the site only ever
acting as a record-keeper.

---

## Part D — The rest of the site (briefly)

These follow the same create-draft → add-content → publish pattern as
products:

- **Portfolio** (`Admin → Portfolio`): case studies separate from the
  shop — title, client, year, brief, creative direction, process, final
  result, plus images. Same publish/unpublish toggle.
- **Contact** (`/contact` public, `Admin → Inquiries`): a general
  contact form. Submissions land in your inbox list; click one to
  expand, read it, and it's auto-marked read. You get an email
  notification too, if SMTP is configured in `server/.env`.
- **Custom Design Requests** (`/custom-design` public, `Admin → Custom
  Requests`): a more detailed intake form (design type, dimensions,
  quantity, budget, deadline, reference file). Tracked through its own
  status flow: `NEW → IN_REVIEW → QUOTED → ACCEPTED → CLOSED`.

---

## Quick troubleshooting

| Symptom | Likely cause |
|---|---|
| "Order via WhatsApp" button doesn't appear | `WhatsApp Number` isn't set in Admin → Settings |
| Can't publish a product | It has no preview images yet — upload one first |
| Category won't delete | A product still references it — reassign or delete those products first |
| Uploaded image doesn't show on the site | Check `CLOUDINARY_*` env vars are set correctly on the backend |
| A page is totally blank | Check the browser console (F12) for an error — the app has an error boundary, so a real crash should show a visible message, not silence |
