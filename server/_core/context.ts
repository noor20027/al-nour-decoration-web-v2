import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: any;
  res: any;
  user: User | null;
};

export async function createContext(opts: { req: any; res: any }): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  // Support static admin session - check cookies parsed by cookie-parser
  const adminSession = opts.req.cookies?.['admin_session'];
  if (adminSession === 'admin_static_session' || (adminSession && !isNaN(Number(adminSession)))) {
    user = { id: 0, openId: 'admin_static', name: 'Admin', email: null, loginMethod: null, role: 'admin', createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() } as any;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
