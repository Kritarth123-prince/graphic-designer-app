# Deployment Guide: Render + Netlify + Cloudinary + MongoDB Atlas

Follow this in order — each step depends on the one before it. Total
time: roughly 30–45 minutes for a first deployment.

---

## 0. Push your code to GitHub

Render and Netlify both deploy from a Git repository, not a local
folder. If you haven't already:

```bash
cd graphic-designer-app
git init
git add .
git commit -m "Initial commit"
```

Create a new repository on GitHub, then:

```bash
git remote add origin https://github.com/your-username/your-repo.git
git branch -M main
git push -u origin main
```

---

## 1. MongoDB Atlas (database)

1. Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas),
   create a free (M0) cluster.
2. **Database Access** (left sidebar) → Add New Database User. Choose a
   username and a strong password — write the password down, you'll
   need it in a moment.
3. **Network Access** → Add IP Address → **Allow Access from Anywhere**
   (`0.0.0.0/0`). This is the practical choice since Render's outbound
   IPs aren't fixed on standard plans. It means your connection string's
   password is doing all the access control, not IP restriction — keep
   it out of git (it already is, via `.gitignore`).
4. **Database** → Connect → Drivers → copy the connection string. It
   looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<username>`/`<password>` with what you set in step 2, and
   add a database name before the `?` — e.g.
   `...mongodb.net/graphic-designer-app?retryWrites=true...`. Save this
   full string — it's your `MONGODB_URI`.

---

## 2. Cloudinary (image/file storage)

1. Sign up at [cloudinary.com](https://cloudinary.com), go to the
   Dashboard.
2. Copy three values: **Cloud name**, **API Key**, **API Secret**.
   These are `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`,
   `CLOUDINARY_API_SECRET`.

---

## 3. Email (optional but recommended)

The contact form and custom-design requests email you a notification.
If you skip this, the site still works — submissions still save, they
just won't email you (see `emailSent: false` in the app's own
resilience design). To set it up with Gmail:

1. Turn on 2-Step Verification on your Google account.
2. Google Account → Security → **App passwords** → generate one for
   "Mail".
3. Use:
   ```
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=youraddress@gmail.com
   EMAIL_PASSWORD=<the 16-character app password, not your normal Gmail password>
   EMAIL_FROM=youraddress@gmail.com
   CONTACT_RECEIVER_EMAIL=youraddress@gmail.com
   ```
   Any other SMTP provider (SendGrid, Mailgun, etc.) works the same way
   — just use their host/port/credentials instead.

---

## 4. Backend on Render

1. [render.com](https://render.com) → New → **Web Service** → connect
   your GitHub repo.
2. **Root Directory**: `server`
3. **Runtime**: Node
4. **Build Command**: `npm install`
5. **Start Command**: `npm start`
6. **Instance Type**: Free is fine to start. One thing to know: Render
   spins a free service down after ~15 minutes of no incoming requests,
   and the next request then takes 30-60 seconds to wake it back up.
   The server includes a self-ping (`server/src/utils/selfPing.js`) that
   pings its own `/api/health` every 10 minutes to prevent this — it
   activates automatically in production (Render sets
   `RENDER_EXTERNAL_URL` for you, no config needed) and does nothing
   locally. Worth knowing this exists so unexplained periodic entries in
   your logs make sense, and worth knowing it's a workaround for a free-tier
   limit, not a substitute for upgrading if the site gets real traffic.
7. Scroll to **Environment Variables** and add:

   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `MONGODB_URI` | from step 1 |
   | `JWT_SECRET` | click "Generate" if Render offers it, or paste a long random string |
   | `JWT_EXPIRES_IN` | `7d` |
   | `CLOUDINARY_CLOUD_NAME` | from step 2 |
   | `CLOUDINARY_API_KEY` | from step 2 |
   | `CLOUDINARY_API_SECRET` | from step 2 |
   | `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASSWORD`, `EMAIL_FROM`, `CONTACT_RECEIVER_EMAIL` | from step 3, if using email |
   | `CLIENT_URL` | leave blank for now — you'll set this in step 6 |
   | `SITE_URL` | same, leave blank for now |

   *(A `render.yaml` blueprint is included at the repo root if you'd
   rather use Render's "New → Blueprint" flow instead of filling this
   in by hand — it lists the same variables.)*

8. Click **Create Web Service**. Wait for the first deploy to finish
   (watch the logs — you should see `[server] Listening on port 5000`
   and a MongoDB connection confirmation).
9. Note your backend's URL at the top of the Render dashboard — it'll
   look like `https://your-app-name.onrender.com`.

### Create your admin login

You need one admin account — there's no public sign-up, by design.
Easiest option: run the seed script from your own machine, pointed at
the production database.

```bash
cd server
# temporarily set MONGODB_URI in your local .env to the SAME Atlas URI you gave Render
npm run seed:admin -- "you@example.com" "a-strong-password" "Your Name"
```

(Alternative: Render's dashboard has a **Shell** tab for the running
service where you can run the same command directly against the live
environment, if you'd rather not put the production URI on your local
machine.)

---

## 5. Frontend on Vercel (or Netlify)

### Vercel

1. [vercel.com](https://vercel.com) → Add New → Project → import the
   same GitHub repo.
2. **Root Directory**: `client`
3. **Framework Preset**: Vite (should auto-detect).
4. **Environment Variables** → add:
   | Key | Value |
   |---|---|
   | `VITE_API_BASE_URL` | `https://your-app-name.onrender.com/api` (your Render URL from step 4, with `/api` on the end) |
5. Deploy. `client/vercel.json` (already in the project) handles
   client-side routing — without it, refreshing a page like
   `/shop/some-poster` would 404, since Vercel serves static files by
   default and doesn't know your React Router routes exist.
6. Note your **production** URL — Vercel gives every deployment its own
   URL (`your-project-git-hash.vercel.app` for previews), but there's
   one stable one for Production, shown at the top of the project
   dashboard, usually `https://your-project.vercel.app`. **Use that
   stable one**, not a preview URL — a preview URL changes on every
   push, which would break CORS on Render every time you deploy.

### Netlify (alternative)

1. [netlify.com](https://netlify.com) → Add new site → Import an
   existing project → connect the same GitHub repo.
2. **Base directory**: `client`
3. Build command and publish directory are already set by
   `client/netlify.toml` (`npm run build` / `dist`) — should
   auto-detect; confirm before deploying.
4. Same `VITE_API_BASE_URL` environment variable as above.
5. Deploy. Note your site's URL — `https://your-site-name.netlify.app`.

---

## 6. Connect the two — the step people forget

Go back to **Render** → your service → Environment → update:

| Key | Value |
|---|---|
| `CLIENT_URL` | your Netlify URL from step 5, e.g. `https://your-site-name.netlify.app` |
| `SITE_URL` | the same value again |

Save — Render will automatically redeploy with the new values. This
matters for two things:
- **CORS**: the backend only accepts requests from exactly this
  origin. Without it set correctly, every API call from your live site
  fails silently with a CORS error.
- **The sitemap**: `SITE_URL` is what `sitemap.xml` uses to build its
  URLs — without it, your sitemap points at the wrong domain.

---

## 7. Verify it actually works

Walk through this checklist on the live site:

1. Visit your Netlify URL — homepage loads.
2. Visit `/admin/login` and sign in with the account from step 4.
3. Go to Settings, fill in your WhatsApp number and UPI details, save.
4. Create a category, create a product, upload a preview image
   (confirms Cloudinary is actually working), publish it.
5. Visit `/shop` on the public site — your product should appear.
6. Open the product, click "Order via WhatsApp", fill the quick form —
   confirms the full order-creation path works.
7. Check `/sitemap.xml` and `/robots.txt` — should show your real
   domain, not `localhost`.
8. Submit the contact form — check whether you got the notification
   email (if you configured SMTP in step 3).

If step 2 (admin login) fails specifically, and everything else about
the deploy looks fine, it's almost always the cross-domain cookie
issue this app was specifically built to handle — double check
`CLIENT_URL` on Render exactly matches your Netlify URL (including
`https://`, no trailing slash).

---

## 8. Custom domain (optional)

Both Render and Netlify support custom domains for free (you provide
the domain, they handle SSL). If you do this:
- Point your domain's DNS at Netlify for the frontend, and optionally a
  subdomain (e.g. `api.yourdomain.com`) at Render for the backend.
- Update `CLIENT_URL`/`SITE_URL` on Render and `VITE_API_BASE_URL` on
  Netlify to match the new domains, then redeploy both.
- If frontend and backend end up on subdomains of the *same* parent
  domain, you can optionally tighten the session cookie from
  `SameSite=None` back to `SameSite=Strict` in
  `server/src/config/cookie.js` — not required, just extra hardening
  once same-site cookies are possible again.

---

## About that DNS setting you asked about

`FORCE_GOOGLE_DNS` (in `server/.env.example`) is a **local-only**
workaround for a DNS resolution issue some networks have connecting to
MongoDB Atlas's `mongodb+srv://` URLs — not something Render needs.
Leave it unset in Render's environment variables; only set it to
`true` in your own local `.env` if you hit `querySrv ETIMEOUT` errors
running the server on your machine.
