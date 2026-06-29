import crypto from 'crypto';
import { getDb } from "./server/db";
import { adminCredentials } from "./drizzle/schema";
import { eq } from "drizzle-orm";

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(32).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

async function initializeAdmin() {
  try {
    const db = await getDb();
    if (!db) {
      console.error("❌ Database connection failed");
      process.exit(1);
    }

    // Check if admin already exists
    const existing = await db.select().from(adminCredentials).where(eq(adminCredentials.username, "admin")).limit(1);
    
    if (existing.length > 0) {
      console.log("✅ Admin user already exists");
      process.exit(0);
    }

    // Create admin user
    const passwordHash = hashPassword("admin");
    await db.insert(adminCredentials).values({
      username: "admin",
      passwordHash: passwordHash,
    });

    console.log("✅ Admin user created successfully");
    console.log("Username: admin");
    console.log("Password: admin");
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Error initializing admin:", error.message);
    process.exit(1);
  }
}

initializeAdmin();
