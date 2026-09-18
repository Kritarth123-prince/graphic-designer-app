// Keeps a Render free-tier instance from spinning down due to inactivity.
//
// Render spins down a free web service after ~15 minutes with no inbound
// HTTP request to its public URL. An internal setInterval alone doesn't
// count — it has to be a real request that hits the public URL from the
// outside, so this pings the service's own /api/health endpoint.
//
// Render's free tier is capped at 750 instance-hours/month, which isn't
// enough to self-ping 24/7 across multiple services. So this is opt-in
// (SELF_PING_ENABLED) and, when on, only pings during a configurable
// active window (SELF_PING_START_HOUR–SELF_PING_END_HOUR, in
// SELF_PING_TZ) — outside that window the service is left to spin down
// normally. 11 active hours/day is ~330 instance-hours/month, well under
// the cap even with several services doing this. The window wraps
// overnight if start > end (e.g. 22 → 6 means active 10pm–6am).
//
// RENDER_EXTERNAL_URL is set automatically by Render for every web service,
// so this activates itself in production with no extra config beyond the
// env vars above. Locally (where that variable doesn't exist) it does nothing.
//
// Note: this only helps on plans where Render spins the instance down for
// inactivity. It has no effect on plans without that behavior, and Render
// could change the policy independent of this code.

const PING_INTERVAL_MS = 10 * 60 * 1000; // 10 min — safely under Render's 15 min idle timeout
const PING_TIMEOUT_MS = 10 * 1000; // don't let a stuck request hang forever

let intervalHandle = null;

function isWithinActiveHours(now, startHour, endHour, timeZone) {
  const hour = Number(
    new Intl.DateTimeFormat('en-US', { hour: 'numeric', hourCycle: 'h23', timeZone }).format(now)
  );
  if (startHour === endHour) return true; // 24h window
  if (startHour < endHour) return hour >= startHour && hour < endHour;
  return hour >= startHour || hour < endHour; // overnight wrap, e.g. 22 -> 6
}

function readHour(envVar, fallback) {
  const raw = process.env[envVar];
  if (raw === undefined) return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 0 || value > 23) {
    console.warn(`[self-ping] ${envVar}="${raw}" is invalid (expected 0-23), using default ${fallback}`);
    return fallback;
  }
  return value;
}

function readTimeZone(fallback) {
  const raw = process.env.SELF_PING_TZ;
  if (!raw) return fallback;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: raw });
    return raw;
  } catch {
    console.warn(`[self-ping] SELF_PING_TZ="${raw}" is not a valid IANA time zone, using default ${fallback}`);
    return fallback;
  }
}

function startSelfPing() {
  if (intervalHandle) {
    console.warn('[self-ping] startSelfPing() called again — ignoring, already running');
    return;
  }

  if (process.env.SELF_PING_ENABLED !== 'true') {
    console.log('Self-ping disabled (SELF_PING_ENABLED is not "true")');
    return;
  }

  const baseUrl = process.env.RENDER_EXTERNAL_URL || process.env.SELF_URL;
  if (!baseUrl) {
    console.log('Self-ping disabled (no RENDER_EXTERNAL_URL/SELF_URL set — probably running locally)');
    return;
  }

  const startHour = readHour('SELF_PING_START_HOUR', 8);
  const endHour = readHour('SELF_PING_END_HOUR', 19);
  const timeZone = readTimeZone('Asia/Kolkata');

  const healthUrl = new URL('/api/health', baseUrl).toString();

  const ping = async () => {
    if (!isWithinActiveHours(new Date(), startHour, endHour, timeZone)) {
      console.log(`[self-ping] skipped — outside active window (${startHour}:00–${endHour}:00 ${timeZone})`);
      return;
    }

    try {
      const res = await fetch(healthUrl, { method: 'GET', signal: AbortSignal.timeout(PING_TIMEOUT_MS) });
      if (res.ok) {
        console.log(`[self-ping] ${res.status} at ${new Date().toISOString()}`);
      } else {
        console.error(`[self-ping] unhealthy response ${res.status} at ${new Date().toISOString()}`);
      }
    } catch (err) {
      console.error(`[self-ping] failed: ${err.message}`);
    }
  };

  intervalHandle = setInterval(ping, PING_INTERVAL_MS);
  ping(); // don't wait 10 min for the first ping
  console.log(
    `Self-ping enabled: pinging ${healthUrl} every ${PING_INTERVAL_MS / 60000} min, ` +
      `active ${startHour}:00–${endHour}:00 ${timeZone}`
  );
}

module.exports = { startSelfPing };
