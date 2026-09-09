require('dotenv').config();

// Some local networks/ISPs (common on Windows, common in India) fail to
// resolve MongoDB Atlas's `mongodb+srv://` SRV/TXT DNS records with their
// default resolver, causing `querySrv ETIMEOUT` connection errors. Forcing
// Google's public DNS fixes it. This is a local-network workaround, not a
// production requirement — Render's own resolver doesn't have this issue —
// so it's opt-in via FORCE_GOOGLE_DNS rather than always-on, to avoid
// making production depend on Google's DNS for no reason.
if (process.env.FORCE_GOOGLE_DNS === 'true') {
  const dns = require('dns');
  dns.setServers(['8.8.8.8', '8.8.4.4']);
  console.log('[server] Using Google DNS (8.8.8.8, 8.8.4.4) — FORCE_GOOGLE_DNS=true');
}

const app = require('./app');
const connectDB = require('./config/db');
const { startSelfPing } = require('./utils/selfPing');

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[server] Listening on port ${PORT}`);
    startSelfPing();
  });
}

start();
