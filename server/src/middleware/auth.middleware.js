const { verifyAdminToken } = require('../utils/token');
const { AdminUser } = require('../models');

async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }

    const payload = verifyAdminToken(token);
    const admin = await AdminUser.findById(payload.sub);
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }

    req.admin = admin;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Session expired or invalid.' });
  }
}

// Reserved for endpoints that only the owner (not a general admin) may hit.
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.admin || !roles.includes(req.admin.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
