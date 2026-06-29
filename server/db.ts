import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { createConnection } from "mysql2/promise";
import { InsertUser, users, adminCredentials, galleryImages, socialLinks, branding, Branding } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: any = null;
let _connection: any = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!process.env.DATABASE_URL) return null;
  
  // Check if connection is still alive
  if (_connection && _db) {
    try {
      await _connection.ping();
      return _db;
    } catch (error) {
      console.error("[Database] Connection lost, reconnecting...", error);
      try {
        await _connection.end();
      } catch (e) {
        // Ignore close errors
      }
      _db = null;
      _connection = null;
    }
  }
  
  // Create new connection
  if (!_db) {
    try {
      _connection = await createConnection(process.env.DATABASE_URL);
      _db = drizzle(_connection);
      console.log("[Database] Connected successfully");
      
      // Auto-create tables if they don't exist
      try {
        console.log("[Database] Ensuring tables exist...");
        await _db.execute(sql`
          CREATE TABLE IF NOT EXISTS admin_credentials (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) NOT NULL UNIQUE,
            passwordHash TEXT NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          )
        `);
        await _db.execute(sql`
          CREATE TABLE IF NOT EXISTS gallery_images (
            id INT AUTO_INCREMENT PRIMARY KEY,
            imageUrl TEXT NOT NULL,
            imageKey VARCHAR(255) NOT NULL UNIQUE,
            title VARCHAR(255),
            description TEXT,
            displayOrder INT DEFAULT 0,
            orientation ENUM('horizontal', 'vertical') DEFAULT 'horizontal',
            isCarousel ENUM('yes', 'no') DEFAULT 'no',
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          )
        `);
        await _db.execute(sql`
          CREATE TABLE IF NOT EXISTS social_links (
            id INT AUTO_INCREMENT PRIMARY KEY,
            platform VARCHAR(255) NOT NULL UNIQUE,
            url TEXT,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          )
        `);
        await _db.execute(sql`
          CREATE TABLE IF NOT EXISTS branding (
            id INT AUTO_INCREMENT PRIMARY KEY,
            type ENUM('logo', 'banner') NOT NULL UNIQUE,
            imageUrl TEXT NOT NULL,
            imageKey VARCHAR(255) NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          )
        `);
        console.log("[Database] Tables ensured");
      } catch (tableErr) {
        console.error("[Database] Error ensuring tables:", tableErr);
      }
    } catch (error) {
      console.error("[Database] Failed to connect:", error);
      _db = null;
      _connection = null;
      throw error;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Admin credentials queries
export async function getAdminByUsername(username: string) {
  const db = await getDb();
  if (!db) {
    console.error('[DB] Database not available');
    return undefined;
  }
  try {
    const result = await db.select().from(adminCredentials).where(eq(adminCredentials.username, username)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error('[DB] getAdminByUsername failed:', error);
    throw error;
  }
}

export async function createAdminCredentials(username: string, passwordHash: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(adminCredentials).values({ username, passwordHash });
}

export async function updateAdminPassword(username: string, newPasswordHash: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(adminCredentials).set({ passwordHash: newPasswordHash }).where(eq(adminCredentials.username, username));
}

// Gallery images queries
export async function getAllGalleryImages() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(galleryImages).orderBy(galleryImages.displayOrder);
}

export async function addGalleryImage(imageUrl: string, imageKey: string, title?: string, description?: string, orientation?: 'horizontal' | 'vertical', isCarousel?: 'yes' | 'no') {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const maxOrder = await db.select({ max: sql<number>`MAX(${galleryImages.displayOrder})` }).from(galleryImages);
  const displayOrder = (maxOrder[0]?.max ?? 0) + 1;
  await db.insert(galleryImages).values({ 
    imageUrl, 
    imageKey, 
    title, 
    description, 
    displayOrder,
    orientation: orientation || 'horizontal',
    isCarousel: isCarousel || 'no'
  });
}

export async function deleteGalleryImage(imageKey: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(galleryImages).where(eq(galleryImages.imageKey, imageKey));
}

export async function updateImageOrder(imageId: number, displayOrder: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(galleryImages).set({ displayOrder }).where(eq(galleryImages.id, imageId));
}

// Social links queries
export async function getAllSocialLinks() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(socialLinks);
}

export async function getSocialLink(platform: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(socialLinks).where(eq(socialLinks.platform, platform)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateSocialLink(platform: string, url: string | null) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getSocialLink(platform);
  if (existing) {
    await db.update(socialLinks).set({ url }).where(eq(socialLinks.platform, platform));
  } else {
    await db.insert(socialLinks).values({ platform, url });
  }
}

export async function initializeSocialLinks() {
  const db = await getDb();
  if (!db) return;
  const platforms = ['facebook', 'instagram', 'twitter', 'snapchat', 'linkedin', 'tiktok'];
  for (const platform of platforms) {
    const existing = await getSocialLink(platform);
    if (!existing) {
      await db.insert(socialLinks).values({ platform, url: null });
    }
  }
}

export async function updateGalleryImage(imageKey: string, updates: { title?: string; description?: string; orientation?: 'horizontal' | 'vertical'; isCarousel?: 'yes' | 'no' }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(galleryImages).set(updates).where(eq(galleryImages.imageKey, imageKey));
}

export async function getCarouselImages() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(galleryImages).where(eq(galleryImages.isCarousel, 'yes')).orderBy(galleryImages.displayOrder);
}

// Branding queries
export async function getBrandingImage(type: 'logo' | 'banner') {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(branding).where(eq(branding.type, type)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertBrandingImage(type: 'logo' | 'banner', imageUrl: string, imageKey: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getBrandingImage(type);
  if (existing) {
    await db.update(branding).set({ imageUrl, imageKey }).where(eq(branding.type, type));
  } else {
    await db.insert(branding).values({ type, imageUrl, imageKey });
  }
}

export async function deleteBrandingImage(type: 'logo' | 'banner') {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(branding).where(eq(branding.type, type));
}
