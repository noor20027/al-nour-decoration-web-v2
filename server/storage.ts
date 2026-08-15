import { put } from '@vercel/blob';
import { nanoid } from 'nanoid';

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

function appendHashSuffix(relKey: string): string {
  const hash = nanoid(8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream",
): Promise<{ key: string; url: string }> {
  const key = appendHashSuffix(normalizeKey(relKey));
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (!blobToken) {
    throw new Error("BLOB_READ_WRITE_TOKEN not set");
  }
  const uploadUrl = "https://wfykl3k1ry0wjacl.public.blob.vercel-storage.com";
  const uploadResponse = await fetch(
    `${uploadUrl}/upload?filename=${encodeURIComponent(key)}&access=public`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${blobToken}`,
        "Content-Type": contentType,
      },
      body: data,
    }
  );
  if (!uploadResponse.ok) {
    throw new Error(`Blob upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
  }
  const result = await uploadResponse.json();
  return { key: result.pathname || key, url: result.url || `${uploadUrl}/${key}` };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  // Note: This is a simplified version as Vercel Blob URLs are direct
  return { key, url: relKey }; 
}

export async function storageGetSignedUrl(relKey: string): Promise<string> {
  // Vercel Blob public URLs don't need signing if they are public
  return relKey;
}
