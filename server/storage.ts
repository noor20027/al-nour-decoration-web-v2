import { put } from "@vercel/blob";
import { ENV } from "./_core/env";

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

function appendHashSuffix(relKey: string): string {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream",
): Promise<{ key: string; url: string }> {
  // Check if BLOB_READ_WRITE_TOKEN is available
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.warn("BLOB_READ_WRITE_TOKEN is missing, falling back to dummy storage");
    return { key: relKey, url: relKey };
  }

  const key = appendHashSuffix(normalizeKey(relKey));
  
  try {
    const blob = await put(key, data, {
      contentType,
      access: 'public',
    });

    return { key: blob.pathname, url: blob.url };
  } catch (error) {
    console.error("[Storage] Vercel Blob upload failed:", error);
    throw new Error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  // In Vercel Blob, the URL is stored in the database, so we might need to handle this differently
  // but for now we return the key as is.
  return { key, url: relKey };
}

export async function storageGetSignedUrl(relKey: string): Promise<string> {
  // Vercel Blob URLs are public by default if configured so
  return relKey;
}
