# Build Progress

- [x] **Phase 1** — Project architecture and MongoDB models
- [x] **Phase 2** — Admin authentication
- [x] **Phase 3** — Admin dashboard and settings
- [x] **Phase 4** — Product/category management
- [x] **Phase 5** — Public shop and product pages
- [x] **Phase 6** — WhatsApp ordering + manual order tracking
- [x] **Phase 6.5** — Admin frontend (login, dashboard, settings, product/category/order management UI)
- [x] **Phase 7** — Portfolio system
- [x] **Phase 8** — Contact + email system
- [x] **Phase 9** — Custom design requests
- [x] **Phase 10** — SEO, security, performance, accessibility, final QA

## Post-launch infrastructure updates

- [x] Migrated file storage from local disk to **Cloudinary** (previews
      public, original files/attachments private via `authenticated`
      delivery + signed URLs)
- [x] Deployment target confirmed as **Render** (backend) + **Netlify**
      (frontend) + **MongoDB Atlas** — added `render.yaml`, `netlify.toml`,
      `_redirects`, and fixed the admin session cookie's `SameSite` policy
      for this specific cross-domain setup
- [x] Added right-click/drag deterrents on public preview images (explicitly
      documented as friction, not real protection — see README)
