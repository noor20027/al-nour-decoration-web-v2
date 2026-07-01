import type { Express } from "express";
import { ENV } from "./env";

export function registerStorageProxy(app: Express) {
  app.get("/manus-storage/*", async (req, res) => {
    const key = (req.params as Record<string, string>)[0];
    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }

    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      res.status(500).send("Storage proxy not configured");
      return;
    }

    try {
      // If the key is already a full URL (Vercel Blob URL), redirect to it
      if (key.startsWith('http')) {
        res.redirect(307, key);
        return;
      }
      
      // Otherwise, we might need a way to resolve the key to a Vercel Blob URL
      // For now, since we store the full URL in the DB for new uploads, 
      // this proxy is mainly for backward compatibility or direct key access.
      res.status(404).send("Storage key not found or not a direct URL");
    } catch (err) {
      console.error("[StorageProxy] failed:", err);
      res.status(502).send("Storage proxy error");
    }
  });
}
