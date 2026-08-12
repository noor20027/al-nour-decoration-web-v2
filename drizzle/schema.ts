import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  openId: text("openId").notNull().unique(),
  name: text("name"),
  email: text("email"),
  loginMethod: text("loginMethod"),
  role: text("role", { enum: ["user", "admin"] }).default("user").notNull(),
  createdAt: text("createdAt").notNull().default(new Date().toISOString()),
  updatedAt: text("updatedAt").notNull().default(new Date().toISOString()),
  lastSignedIn: text("lastSignedIn").notNull().default(new Date().toISOString()),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Admin credentials table
export const adminCredentials = sqliteTable("admin_credentials", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  passwordHash: text("passwordHash").notNull(),
  createdAt: text("createdAt").notNull().default(new Date().toISOString()),
  updatedAt: text("updatedAt").notNull().default(new Date().toISOString()),
});

export type AdminCredentials = typeof adminCredentials.$inferSelect;
export type InsertAdminCredentials = typeof adminCredentials.$inferInsert;

// Gallery images table
export const galleryImages = sqliteTable("gallery_images", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  imageUrl: text("imageUrl").notNull(),
  imageKey: text("imageKey").notNull().unique(),
  title: text("title"),
  description: text("description"),
  displayOrder: integer("displayOrder").default(0),
  orientation: text("orientation", { enum: ["horizontal", "vertical"] }).default("horizontal").notNull(),
  isCarousel: text("isCarousel", { enum: ["yes", "no"] }).default("no").notNull(),
  createdAt: text("createdAt").notNull().default(new Date().toISOString()),
  updatedAt: text("updatedAt").notNull().default(new Date().toISOString()),
});

export type GalleryImage = typeof galleryImages.$inferSelect;
export type InsertGalleryImage = typeof galleryImages.$inferInsert;

// Social links table
export const socialLinks = sqliteTable("social_links", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  platform: text("platform").notNull().unique(),
  url: text("url"),
  createdAt: text("createdAt").notNull().default(new Date().toISOString()),
  updatedAt: text("updatedAt").notNull().default(new Date().toISOString()),
});

export type SocialLink = typeof socialLinks.$inferSelect;
export type InsertSocialLink = typeof socialLinks.$inferInsert;

// Logo and banner table
export const branding = sqliteTable("branding", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type", { enum: ["logo", "banner"] }).notNull().unique(),
  imageUrl: text("imageUrl").notNull(),
  imageKey: text("imageKey").notNull(),
  createdAt: text("createdAt").notNull().default(new Date().toISOString()),
  updatedAt: text("updatedAt").notNull().default(new Date().toISOString()),
});

export type Branding = typeof branding.$inferSelect;
export type InsertBranding = typeof branding.$inferInsert;

// Floating icons table (WhatsApp and Call)
export const floatingIcons = sqliteTable("floating_icons", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type", { enum: ["whatsapp", "call"] }).notNull().unique(),
  phoneNumber: text("phoneNumber").notNull(),
  isEnabled: text("isEnabled", { enum: ["yes", "no"] }).default("yes").notNull(),
  createdAt: text("createdAt").notNull().default(new Date().toISOString()),
  updatedAt: text("updatedAt").notNull().default(new Date().toISOString()),
});

export type FloatingIcon = typeof floatingIcons.$inferSelect;
export type InsertFloatingIcon = typeof floatingIcons.$inferInsert;
