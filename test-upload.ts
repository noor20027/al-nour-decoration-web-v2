import { put } from '@vercel/blob';
import * as fs from 'fs';

async function testUpload() {
  const envContent = fs.readFileSync('.env', 'utf8');
  const oidcMatch = envContent.match(/VERCEL_OIDC_TOKEN="([^"]+)"/);
  const oidcToken = oidcMatch ? oidcMatch[1] : undefined;
  
  // We need the Store ID which is in the Vercel Dashboard
  const storeId = "store_WfYkl3K1ry0WjacL"; // From the URL I saw earlier
  
  console.log("Using OIDC Token and Store ID:", storeId);
  
  try {
    console.log("Attempting test upload to Vercel Blob...");
    const blob = await put('test-manus.txt', 'Hello from Manus!', {
      access: 'public',
      token: oidcToken,
      // @ts-ignore
      storeId: storeId
    });
    console.log("✅ Success! File uploaded at:", blob.url);
  } catch (error: any) {
    console.error("❌ Failed! Error details:");
    console.error("Message:", error.message);
  }
}

testUpload();
