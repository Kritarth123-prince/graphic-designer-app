require("dotenv").config();

const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const ADMIN_EMAIL = "admin@graphicdesigner.com";
const ADMIN_PASSWORD = "Sona@1908";

async function seedAdmin() {
  try {
    console.log("Connecting to MongoDB...");

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("✅ MongoDB connected");
    console.log("Database:", mongoose.connection.name);

    // Use the collection directly so this script doesn't depend
    // on your existing Admin model/schema.
    const admins = mongoose.connection.db.collection("admins");

    const existingAdmin = await admins.findOne({
      email: ADMIN_EMAIL.toLowerCase(),
    });

    if (existingAdmin) {
      console.log("⚠️ Admin already exists:");
      console.log(existingAdmin.email);
      return;
    }

    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

    const result = await admins.insertOne({
      email: ADMIN_EMAIL.toLowerCase(),
      passwordHash,
      role: "admin",
      name: "Administrator",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log("\n=================================");
    console.log("✅ ADMIN CREATED");
    console.log("=================================");
    console.log("Email:", ADMIN_EMAIL);
    console.log("Password:", ADMIN_PASSWORD);
    console.log("ID:", result.insertedId);
    console.log("=================================\n");
  } catch (error) {
    console.error("❌ Failed to create admin:");
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB connection closed.");
  }
}

seedAdmin();
