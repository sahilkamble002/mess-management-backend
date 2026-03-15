import path from "path";
import fs from "fs";
import dotenv from "dotenv";

// 🔥 dotenv MUST be first
const envPath = path.resolve(process.cwd(), ".env");

console.log("ENV PATH:", envPath);
console.log("ENV EXISTS:", fs.existsSync(envPath));

dotenv.config({ path: envPath });

// 🔍 verify critical vars
console.log("ENV CHECK:", {
  PORT: process.env.PORT,
  MONGODB_URI: process.env.MONGODB_URI,
});

// imports AFTER dotenv
import connectDB from "./db/index.js";
import { app } from "./app.js";

const PORT = process.env.PORT || 8000;

console.log(
  "MONGODB_URI RAW:",
  JSON.stringify(process.env.MONGODB_URI)
);
console.log(
  "MONGODB_URI LENGTH:",
  process.env.MONGODB_URI.length
);

console.log("🔄 Attempting to connect to MongoDB...");

// Set a timeout for connection
const connectionTimeout = setTimeout(() => {
  console.error("⏱️  MongoDB connection timeout (30s) - check your network/firewall");
  process.exit(1);
}, 30000);

connectDB()
  .then(() => {
    clearTimeout(connectionTimeout);
    console.log("✅ MongoDB connected successfully!");
    app.listen(PORT, () => {
      console.log(`⚙️ Server is running at port : ${PORT}`);
    });
  })
  .catch((err) => {
    clearTimeout(connectionTimeout);
    console.error("❌ MONGO db connection failed:", err.message);
    console.error("Full error:", err);
    process.exit(1);
  });
