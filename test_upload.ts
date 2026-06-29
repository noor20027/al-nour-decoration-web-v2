
import { storagePut } from "./server/storage";
import { upsertBrandingImage, getDb } from "./server/db";
import fs from "node:fs";

async function test() {
  try {
    console.log("Starting test upload...");
    
    // 1. Read the logo file
    const logoBuffer = fs.readFileSync("/home/ubuntu/upload/logo.jpg");
    console.log("Logo file read, size:", logoBuffer.length);

    // 2. Try to upload to cloud storage
    console.log("Uploading to cloud storage...");
    const { key, url } = await storagePut("test_logo.jpg", logoBuffer, "image/jpeg");
    console.log("Cloud upload success:", { key, url });

    // 3. Try to save to database
    console.log("Saving to database...");
    const db = await getDb();
    if (!db) {
      console.error("Database connection failed - DATABASE_URL might be missing in local env");
    } else {
      await upsertBrandingImage('logo', url, key);
      console.log("Database save success!");
    }

    console.log("Test completed successfully!");
  } catch (err) {
    console.error("Test failed with error:", err);
  }
}

test();
