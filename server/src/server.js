const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[server] Listening on port ${PORT}`);
  });
}

start();
