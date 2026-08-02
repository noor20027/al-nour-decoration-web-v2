import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "../server/_core/oauth";
import { registerStorageProxy } from "../server/_core/storageProxy";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";
import { serveStatic } from "../server/_core/vite";
import type { VercelRequest, VercelResponse } from "@vercel/node";

// Create Express app
const app = express();

// Configure body parser with larger size limit for file uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Register middleware
registerStorageProxy(app);
registerOAuthRoutes(app);

// File upload endpoint
app.post("/api/upload", async (req, res) => {
  try {
    const { fileName, fileSize, mimeType } = req.body;
    
    if (!fileName || !mimeType) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    if (fileSize > 5 * 1024 * 1024) {
      return res.status(400).json({ error: "File too large" });
    }
    
    // Generate unique key
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const fileKey = `gallery/${timestamp}_${random}_${fileName}`;
    
    // Get presigned URL from Forge
    const presignUrl = new URL("v1/storage/presign/put", (process.env.BUILT_IN_FORGE_API_URL || "") + "/");
    presignUrl.searchParams.set("path", fileKey);
    
    const presignResp = await fetch(presignUrl.toString(), {
      headers: { Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}` },
    });
    
    if (!presignResp.ok) {
      throw new Error("Failed to get presigned URL");
    }
    
    const { url: uploadUrl } = await presignResp.json() as { url: string };
    
    res.json({ uploadUrl, fileKey });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
});

// tRPC API
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Serve static files
serveStatic(app);

// Vercel Serverless handler
export default (req: VercelRequest, res: VercelResponse) => {
  app(req, res);
};
