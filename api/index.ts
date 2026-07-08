
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import path from "path";
import fs from "fs";

// Function to safely import a module from dist
const safeImport = async (relativePath) => {
  const fullPath = path.resolve(process.cwd(), "dist", relativePath);
  return import(`file://${fullPath}`);
};

const app = express();

// Configure body parser
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Serverless handler
const handler = async (req, res) => {
  try {
    // Dynamically import modules from dist after build
    const { appRouter } = await safeImport("server/routers.js");
    const { createContext } = await safeImport("server/_core/context.js");
    const { registerOAuthRoutes } = await safeImport("server/_core/oauth.js");
    const { registerStorageProxy } = await safeImport("server/_core/storageProxy.js");

    // Initialize express app logic inside handler if needed, or use a singleton
    if (!(app as any)._initialized) {
      registerStorageProxy(app);
      registerOAuthRoutes(app);
      (app as any)._initialized = true;
    }

    // Handle tRPC
    if (req.url.startsWith("/api/trpc")) {
      return createExpressMiddleware({
        router: appRouter,
        createContext,
      })(req, res);
    }

    res.status(404).send("Not Found");
  } catch (error) {
    console.error("Serverless Error:", error);
    res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
};

export default handler;
