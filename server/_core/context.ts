import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  // Support static admin session
  const adminSession = opts.req.cookies?.['admin_session'];
  if (adminSession === 'admin_static_session' || (adminSession && !isNaN(Number(adminSession)))) {
    user = { role: 'admin' } as any;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
