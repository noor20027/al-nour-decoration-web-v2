import { db } from "./server/db.ts";
import { createAdminCredentials, getAdminByUsername } from "./server/db.ts";
import { hashPassword } from "./server/_core/auth.ts";

async function initializeAdmin() {
  try {
    // Check if admin already exists
    const existing = await getAdminByUsername("admin");
    
    if (existing) {
      console.log("✅ Admin user already exists");
      process.exit(0);
    }

    // Create admin user
    const passwordHash = hashPassword("admin");
    await createAdminCredentials("admin", passwordHash);

    console.log("✅ Admin user created successfully");
    console.log("Username: admin");
    console.log("Password: admin");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error initializing admin:", error.message);
    process.exit(1);
  }
}

initializeAdmin();
