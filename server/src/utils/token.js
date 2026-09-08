const jwt = require('jsonwebtoken');

function signAdminToken(admin) {
  return jwt.sign(
    { sub: admin._id.toString(), role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function verifyAdminToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = { signAdminToken, verifyAdminToken };
