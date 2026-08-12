import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import initSqlJs, { Database as SqlJsDatabase } from "sql.js";
import fs from "fs";
import path from "path";
import os from "os";

// Load sql-wasm.wasm at build time and embed it
const wasmPath = require.resolve("sql.js/dist/sql-wasm.wasm");
const wasmBuffer = fs.readFileSync(wasmPath);
const wasmBase64 = wasmBuffer.toString("base64");

function getWasmLoader() {
  return {
    wasmBinary: Buffer.from(wasmBase64, "base64"),
    locateFile: (_file: string) => "", // Not needed since we provide wasmBinary directly
  };
}
import { InsertUser, users, adminCredentials, galleryImages, socialLinks, branding, Branding, floatingIcons, FloatingIcon } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: any = null;
let _sqlDb: SqlJsDatabase | null = null;

function getDbPath(): string {
  // Use /tmp for Vercel serverless (writable)
  const dir = process.env.NODE_ENV === "production" ? "/tmp" : os.tmpdir();
  return path.join(dir, "al-nour-deco.db");
}

// Lazily create the drizzle instance
export async function getDb() {
  if (_sqlDb && _db) {
    try {
      _sqlDb.exec("SELECT 1");
      return _db;
    } catch (error) {
      console.error("[Database] Connection lost, reconnecting...", error);
      _db = null;
      _sqlDb = null;
    }
  }

  if (!_db) {
    try {
      const SQL = await initSqlJs(getWasmLoader());
      const dbPath = getDbPath();
      
      // Try to load existing database file
      if (fs.existsSync(dbPath)) {
        const buffer = fs.readFileSync(dbPath);
        _sqlDb = new SQL.Database(buffer);
      } else {
        _sqlDb = new SQL.Database();
      }

      // Ensure tables exist
      _sqlDb.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          openId TEXT NOT NULL UNIQUE,
          name TEXT,
          email TEXT,
          loginMethod TEXT,
          role TEXT DEFAULT 'user' NOT NULL CHECK(role IN ('user', 'admin')),
          createdAt TEXT NOT NULL DEFAULT (datetime('now')),
          updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
          lastSignedIn TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS admin_credentials (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL UNIQUE,
          passwordHash TEXT NOT NULL,
          createdAt TEXT NOT NULL DEFAULT (datetime('now')),
          updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS gallery_images (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          imageUrl TEXT NOT NULL,
          imageKey TEXT NOT NULL UNIQUE,
          title TEXT,
          description TEXT,
          displayOrder INTEGER DEFAULT 0,
          orientation TEXT DEFAULT 'horizontal' NOT NULL CHECK(orientation IN ('horizontal', 'vertical')),
          isCarousel TEXT DEFAULT 'no' NOT NULL CHECK(isCarousel IN ('yes', 'no')),
          createdAt TEXT NOT NULL DEFAULT (datetime('now')),
          updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS social_links (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          platform TEXT NOT NULL UNIQUE,
          url TEXT,
          createdAt TEXT NOT NULL DEFAULT (datetime('now')),
          updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS branding (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          type TEXT NOT NULL UNIQUE CHECK(type IN ('logo', 'banner')),
          imageUrl TEXT NOT NULL,
          imageKey TEXT NOT NULL,
          createdAt TEXT NOT NULL DEFAULT (datetime('now')),
          updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS floating_icons (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          type TEXT NOT NULL UNIQUE CHECK(type IN ('whatsapp', 'call')),
          phoneNumber TEXT NOT NULL,
          isEnabled TEXT DEFAULT 'yes' NOT NULL CHECK(isEnabled IN ('yes', 'no')),
          createdAt TEXT NOT NULL DEFAULT (datetime('now')),
          updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
        );
      `);

      // Save to file (sync after every write in production)
      if (process.env.NODE_ENV === "production") {
        try {
          fs.writeFileSync(dbPath, Buffer.from(_sqlDb.export()));
        } catch (e) {
          console.error("[Database] Failed to persist to disk:", e);
        }
      }

      _db = drizzle(_sqlDb);
      console.log("[Database] SQL.js connected successfully");
    } catch (error) {
      console.error("[Database] Failed to connect:", error);
      _db = null;
      _sqlDb = null;
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
    const values: any = {
      openId: user.openId,
      lastSignedIn: new Date().toISOString(),
    };

    if (user.name !== undefined) values.name = user.name ?? null;
    if (user.email !== undefined) values.email = user.email ?? null;
    if (user.loginMethod !== undefined) values.loginMethod = user.loginMethod ?? null;
    if (user.role !== undefined) values.role = user.role;
    else if (user.openId === ENV.ownerOpenId) values.role = 'admin';

    await db.insert(users).values(values).onConflictDoUpdate({
      target: [users.openId],
      set: {
        name: values.name ?? users.name,
        email: values.email ?? users.email,
        loginMethod: values.loginMethod ?? users.loginMethod,
        role: values.role ?? users.role,
        lastSignedIn: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
    saveDb();
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
  await db.insert(adminCredentials).values({ 
    username, 
    passwordHash,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  saveDb();
}

export async function updateAdminPassword(username: string, newPasswordHash: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(adminCredentials).set({ 
    passwordHash: newPasswordHash,
    updatedAt: new Date().toISOString(),
  }).where(eq(adminCredentials.username, username));
  saveDb();
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
    isCarousel: isCarousel || 'no',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  saveDb();
}

export async function deleteGalleryImage(imageKey: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(galleryImages).where(eq(galleryImages.imageKey, imageKey));
  saveDb();
}

export async function updateImageOrder(imageId: number, displayOrder: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(galleryImages).set({ displayOrder, updatedAt: new Date().toISOString() }).where(eq(galleryImages.id, imageId));
  saveDb();
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
    await db.update(socialLinks).set({ url, updatedAt: new Date().toISOString() }).where(eq(socialLinks.platform, platform));
  } else {
    await db.insert(socialLinks).values({ platform, url, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  saveDb();
}

export async function initializeSocialLinks() {
  const db = await getDb();
  if (!db) return;
  const platforms = ['facebook', 'instagram', 'twitter', 'x', 'youtube', 'snapchat', 'linkedin', 'tiktok'];
  for (const platform of platforms) {
    const existing = await getSocialLink(platform);
    if (!existing) {
      await db.insert(socialLinks).values({ platform, url: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
  }
  saveDb();
}

export async function updateGalleryImage(imageKey: string, updates: { title?: string; description?: string; orientation?: 'horizontal' | 'vertical'; isCarousel?: 'yes' | 'no' }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const setValues: any = { ...updates, updatedAt: new Date().toISOString() };
  await db.update(galleryImages).set(setValues).where(eq(galleryImages.imageKey, imageKey));
  saveDb();
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
    await db.update(branding).set({ imageUrl, imageKey, updatedAt: new Date().toISOString() }).where(eq(branding.type, type));
  } else {
    await db.insert(branding).values({ type, imageUrl, imageKey, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  saveDb();
}

export async function deleteBrandingImage(type: 'logo' | 'banner') {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(branding).where(eq(branding.type, type));
  saveDb();
}

// Floating icons queries
export async function getAllFloatingIcons() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(floatingIcons);
}

export async function getFloatingIcon(type: 'whatsapp' | 'call') {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(floatingIcons).where(eq(floatingIcons.type, type)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertFloatingIcon(type: 'whatsapp' | 'call', phoneNumber: string, isEnabled: 'yes' | 'no' = 'yes') {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getFloatingIcon(type);
  if (existing) {
    await db.update(floatingIcons).set({ phoneNumber, isEnabled, updatedAt: new Date().toISOString() }).where(eq(floatingIcons.type, type));
  } else {
    await db.insert(floatingIcons).values({ type, phoneNumber, isEnabled, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  saveDb();
}

export async function deleteFloatingIcon(type: 'whatsapp' | 'call') {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(floatingIcons).where(eq(floatingIcons.type, type));
  saveDb();
}

// Helper to persist db to disk
function saveDb() {
  if (process.env.NODE_ENV === "production" && _sqlDb) {
    try {
      const dbPath = getDbPath();
      fs.writeFileSync(dbPath, Buffer.from(_sqlDb.export()));
    } catch (e) {
      console.error("[Database] Failed to save to disk:", e);
    }
  }
}
