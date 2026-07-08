
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
// @ts-ignore
import { appRouter } from "../dist/server/routers.js";
// @ts-ignore
import { createContext } from "../dist/server/_core/context.js";
// @ts-ignore
import { registerOAuthRoutes } from "../dist/server/_core/oauth.js";
// @ts-ignore
import { registerStorageProxy } from "../dist/server/_core/storageProxy.js";

const app = express();

// Configure body parser
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Register proxies and OAuth
registerStorageProxy(app);
registerOAuthRoutes(app);

// tRPC API
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Export for Vercel
export default app;
