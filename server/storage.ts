import { put, get, getSignedUrl } from '@vercel/blob';
import { ENV } from "./_core/env";
import crypto from "node:crypto";

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

function appendHashSuffix(relKey: string): string {
  const hash = crypto.randomBytes(4).toString("hex");
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string | Blob,
  contentType = "application/octet-stream",
): Promise<{ key: string; url: string }> {
  const key = appendHashSuffix(normalizeKey(relKey));

  try {
    const blob = await put(key, data, {
      access: 'public',
      addRandomSuffix: false, // We already add a suffix manually
      contentType: contentType,
      token: ENV.blobReadWriteToken, // Use the Vercel Blob token from environment variables
    });
    return { key: blob.pathname, url: blob.url };
  } catch (e) {
    console.error("Vercel Blob upload failed:", e);
    throw new Error("Failed to upload file to Vercel Blob Storage.");
  }
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  // Vercel Blob URLs are directly accessible if access is 'public'
  // We can use the get function to retrieve metadata or ensure existence if needed
  // For direct URL, we can construct it or rely on the put function's returned URL
  // For simplicity, assuming the URL is directly constructible or stored during put
  // A more robust solution might involve storing the full URL in the database during upload
  try {
    const blob = await get(key, { token: ENV.blobReadWriteToken });
    if (blob) {
      return { key: blob.pathname, url: blob.url };
    } else {
      throw new Error(`Blob with key ${key} not found.`);
    }
  } catch (e) {
    console.warn(`Failed to retrieve blob ${key} from Vercel Blob Storage, attempting to construct URL:`, e);
    // Fallback: if get fails, try to construct a public URL (might not work if blob doesn't exist or is private)
    return { key, url: `https://blob.vercel-storage.com/${key}` }; // This is a generic URL, might need adjustment
  }
}

export async function storageGetSignedUrl(relKey: string): Promise<string> {
  const key = normalizeKey(relKey);
  try {
    const signedUrl = await getSignedUrl(key, { access: 'public', token: ENV.blobReadWriteToken });
    return signedUrl;
  } catch (e) {
    console.error("Failed to get signed URL from Vercel Blob:", e);
    throw new Error("Failed to generate signed URL for Vercel Blob Storage.");
  }
}
