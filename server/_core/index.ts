
import express from "express";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.use(cookieParser());
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
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
