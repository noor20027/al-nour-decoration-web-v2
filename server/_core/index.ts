import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

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

// Serve static files in production
if (process.env.NODE_ENV !== "development") {
  serveStatic(app);
}

// Development mode: start HTTP server
if (process.env.NODE_ENV === "development") {
  (async () => {
    const { createServer } = await import("http" );
    const server = createServer(app);
    await setupVite(app, server);
    
    const port = parseInt(process.env.PORT || "3000");
    server.listen(port, () => {
      console.log(`Server running on http://localhost:${port}/` );
    });
  })();
}

// Export app for Vercel Serverless
export default app;
