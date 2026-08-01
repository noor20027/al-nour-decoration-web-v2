import express from "express";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./server/routers";
import { createContext } from "./server/_core/context";
import { registerOAuthRoutes } from "./server/_core/oauth";
import { registerStorageProxy } from "./server/_core/storageProxy";

const app = express();
const server = createServer(app);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configure body parser
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

// Register proxies and OAuth
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
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const fileKey = `gallery/${timestamp}_${random}_${fileName}`;
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

// Serve static files from dist/public
// In Vercel: static build output goes to /var/task/dist/public
// In local: it's ./dist/public
const distPaths = [
  path.resolve(__dirname, "dist", "public"),
  path.resolve("/var/task", "dist", "public"),
  path.resolve(__dirname, "..", "dist", "public"),
];

let distPath = distPaths.find(p => fs.existsSync(p));
if (distPath) {
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
} else {
  console.error("Could not find build directory in any of:", distPaths);
}

const port = parseInt(process.env.PORT || "3000");
server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}/`);
});

export default app;
