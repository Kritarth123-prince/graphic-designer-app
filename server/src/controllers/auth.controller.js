const bcrypt = require('bcryptjs');
const { AdminUser } = require('../models');
const { signAdminToken } = require('../utils/token');

// Generic message on purpose — never reveal whether the email exists.
const INVALID_CREDENTIALS_MESSAGE = 'Invalid email or password.';

async function login(req, res) {
  const { email, password } = req.body;

  const admin = await AdminUser.findOne({ email }).select('+passwordHash');
  if (!admin) {
    return res.status(401).json({ success: false, message: INVALID_CREDENTIALS_MESSAGE });
  }

  const passwordMatches = await bcrypt.compare(password, admin.passwordHash);
  if (!passwordMatches) {
    return res.status(401).json({ success: false, message: INVALID_CREDENTIALS_MESSAGE });
  }

  admin.lastLogin = new Date();
  await admin.save();

  const token = signAdminToken(admin);

  return res.json({
    success: true,
    token,
    admin: {
      id: admin._id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    },
  });
}

async function logout(req, res) {
  // Stateless JWT sent as a bearer token — nothing to invalidate server-side.
  // The client discards its stored token.
  return res.json({ success: true, message: 'Logged out.' });
}

async function me(req, res) {
  // req.admin is attached by requireAuth
  const { admin } = req;
  return res.json({
    success: true,
    admin: {
      id: admin._id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      lastLogin: admin.lastLogin,
    },
  });
}

module.exports = { login, logout, me };
