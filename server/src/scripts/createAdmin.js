/**
 * Creates (or resets the password of) the admin account.
 * Run manually, once, after deployment — there is no public signup route.
 *
 * Usage:
 *   node src/scripts/createAdmin.js "designer@example.com" "a-strong-password" "Designer Name"
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const { AdminUser } = require('../models');

async function run() {
  const [, , email, password, name] = process.argv;

  if (!email || !password || !name) {
    console.error('Usage: node src/scripts/createAdmin.js <email> <password> <name>');
    process.exit(1);
  }
  if (password.length < 10) {
    console.error('Password must be at least 10 characters.');
    process.exit(1);
  }

  await connectDB();

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await AdminUser.findOneAndUpdate(
    { email: email.toLowerCase() },
    { email: email.toLowerCase(), passwordHash, name, role: 'owner' },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log(`Admin account ready: ${admin.email}`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
