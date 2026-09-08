const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config();

const mongoose = require("mongoose");

async function testMongoDB() {
  console.log("=================================");
  console.log("MongoDB Connection Test");
  console.log("=================================");

  console.log("DNS servers:", dns.getServers());

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error("❌ MONGODB_URI is missing");
    process.exit(1);
  }

  const safeUri = uri.replace(
    /mongodb(\+srv)?:\/\/([^:]+):([^@]+)@/,
    "mongodb$1://$2:****@"
  );

  console.log("URI:", safeUri);
  console.log("Connecting...\n");

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("✅ MongoDB connection SUCCESSFUL!");
    console.log("Database:", mongoose.connection.name);
    console.log("Host:", mongoose.connection.host);

    await mongoose.disconnect();

    console.log("✅ Connection closed.");
  } catch (error) {
    console.error("❌ MongoDB connection FAILED");
    console.error("Error:", error.name);
    console.error("Message:", error.message);

    if (error.reason) {
      console.error("Reason:", error.reason);
    }
  }

  process.exit(0);
}

testMongoDB();
