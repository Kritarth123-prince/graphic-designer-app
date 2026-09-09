// Keeps a Render free-tier instance from spinning down due to inactivity.
//
// Render spins down a free web service after ~15 minutes with no inbound
// HTTP request to its public URL. An internal setInterval alone doesn't
// count — it has to be a real request that hits the public URL from the
// outside, so this pings the service's own /api/health endpoint.
//
// RENDER_EXTERNAL_URL is set automatically by Render for every web service,
// so this activates itself in production with no extra config. Locally
// (where that variable doesn't exist) it does nothing.

const PING_INTERVAL_MS = 10 * 60 * 1000; // 10 min — safely under Render's 15 min idle timeout

function startSelfPing() {
  const baseUrl = process.env.RENDER_EXTERNAL_URL || process.env.SELF_URL;

  if (!baseUrl) {
    console.log('Self-ping disabled (no RENDER_EXTERNAL_URL/SELF_URL set — probably running locally)');
    return;
  }

  const healthUrl = new URL('/api/health', baseUrl).toString();

  const ping = async () => {
    try {
      const res = await fetch(healthUrl, { method: 'GET' });
      console.log(`[self-ping] ${res.status} at ${new Date().toISOString()}`);
    } catch (err) {
      console.error(`[self-ping] failed: ${err.message}`);
    }
  };

  setInterval(ping, PING_INTERVAL_MS);
  console.log(`Self-ping enabled: pinging ${healthUrl} every ${PING_INTERVAL_MS / 60000} min`);
}

module.exports = { startSelfPing };
