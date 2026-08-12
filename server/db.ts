import { put, get, del, list } from "@vercel/blob";

// Simple JSON-based storage in Vercel Blob
// This is more reliable than SQLite-in-Blob because:
// 1. No WASM loading issues
// 2. No binary serialization issues
// 3. Direct JSON read/write with proper error handling

const BLOB_PREFIX = "db/";

interface DbState {
  users: any[];
  adminCredentials: any[];
  galleryImages: any[];
  carouselImages: any[];
  branding: Record<string, any>;
  socialLinks: any[];
  floatingIcons: any[];
  seo: Record<string, any>;
}

let _cache: DbState | null = null;
let _cacheExpiry = 0;
const CACHE_TTL = 5000; // 5 second cache

function getDefaultState(): DbState {
  return {
    users: [],
    adminCredentials: [
      {
        id: 1,
        username: "admin",
        passwordHash: "admin", // Static fallback
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    galleryImages: [],
    carouselImages: [],
    branding: {},
    socialLinks: [],
    floatingIcons: [],
    seo: {
      metaTitle: "مؤسسة النور للديكور | AL NOUR DECORATION EST",
      metaDescription:
        "مؤسسة النور للديكور - خبرة تزيد عن 15 سنة في مجال الديكور والإضاءة الاحترافية",
    },
  };
}

// Load full DB state from Blob
export async function loadDb(): Promise<DbState> {
  // Use cache if valid
  if (_cache && Date.now() < _cacheExpiry) {
    return _cache;
  }

  try {
    // Try to load the full state JSON
    const blob = await get(`${BLOB_PREFIX}state.json`);
    const text = await blob.text();
    const state: DbState = JSON.parse(text);
    _cache = state;
    _cacheExpiry = Date.now() + CACHE_TTL;
    return state;
  } catch (e) {
    // No existing state, return default
    console.log("[DB] No existing state found, using defaults");
    _cache = getDefaultState();
    _cacheExpiry = Date.now() + CACHE_TTL;
    return _cache;
  }
}

// Save full DB state to Blob
export async function saveDb(state: DbState): Promise<void> {
  try {
    const json = JSON.stringify(state);
    await put(`${BLOB_PREFIX}state.json`, json, {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    console.log("[DB] State saved to Blob storage");
    _cache = state;
    _cacheExpiry = Date.now() + CACHE_TTL;
  } catch (e) {
    console.error("[DB] Failed to save state:", e);
    throw e;
  }
}

// In-memory state (loaded once, modified, then saved)
let _state: DbState | null = null;

async function getState(): Promise<DbState> {
  if (!_state) {
    _state = await loadDb();
  }
  return _state;
}

function markDirty() {
  // Force reload on next request (don't cache dirty state)
  _cacheExpiry = 0;
}

// User operations
export async function upsertUser(user: any): Promise<void> {
  const state = await getState();
  const idx = state.users.findIndex((u: any) => u.openId === user.openId);
  if (idx >= 0) {
    state.users[idx] = { ...state.users[idx], ...user, updatedAt: new Date().toISOString() };
  } else {
    state.users.push({
      ...user,
      id: state.users.length > 0 ? Math.max(...state.users.map((u: any) => u.id)) + 1 : 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  markDirty();
  await saveDb(state);
}

export async function getUser(openId: string): Promise<any> {
  const state = await getState();
  return state.users.find((u: any) => u.openId === openId);
}

export async function getAllUsers(): Promise<any[]> {
  const state = await getState();
  return state.users;
}

export async function deleteUser(openId: string): Promise<void> {
  const state = await getState();
  state.users = state.users.filter((u: any) => u.openId !== openId);
  markDirty();
  await saveDb(state);
}

// Admin operations
export async function getAdminByUsername(username: string): Promise<any> {
  const state = await getState();
  return state.adminCredentials.find((u: any) => u.username === username);
}

export async function upsertAdminCredential(cred: any): Promise<void> {
  const state = await getState();
  const idx = state.adminCredentials.findIndex((u: any) => u.username === cred.username);
  if (idx >= 0) {
    state.adminCredentials[idx] = { ...state.adminCredentials[idx], ...cred, updatedAt: new Date().toISOString() };
  } else {
    state.adminCredentials.push({
      ...cred,
      id: state.adminCredentials.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  markDirty();
  await saveDb(state);
}

// Gallery operations
export async function getAllGalleryImages(): Promise<any[]> {
  const state = await getState();
  return [...state.galleryImages].sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0));
}

export async function getCarouselImages(): Promise<any[]> {
  const state = await getState();
  return state.galleryImages.filter((img: any) => img.isCarousel === "yes");
}

export async function addGalleryImage(imageUrl: string, imageKey: string, title?: string, description?: string, orientation?: string, isCarousel?: string): Promise<void> {
  const state = await getState();
  const maxOrder = state.galleryImages.length > 0
    ? Math.max(...state.galleryImages.map((img: any) => img.displayOrder || 0))
    : 0;
  state.galleryImages.push({
    id: state.galleryImages.length > 0 ? Math.max(...state.galleryImages.map((img: any) => img.id)) + 1 : 1,
    imageUrl,
    imageKey,
    title: title || null,
    description: description || null,
    displayOrder: maxOrder + 1,
    orientation: orientation || "horizontal",
    isCarousel: isCarousel || "no",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  markDirty();
  await saveDb(state);
}

export async function updateGalleryImage(imageKey: string, updates: any): Promise<void> {
  const state = await getState();
  const idx = state.galleryImages.findIndex((img: any) => img.imageKey === imageKey);
  if (idx >= 0) {
    state.galleryImages[idx] = { ...state.galleryImages[idx], ...updates, updatedAt: new Date().toISOString() };
    markDirty();
    await saveDb(state);
  }
}

export async function deleteGalleryImage(imageKey: string): Promise<void> {
  const state = await getState();
  state.galleryImages = state.galleryImages.filter((img: any) => img.imageKey !== imageKey);
  markDirty();
  await saveDb(state);
}

export async function getGalleryImage(imageKey: string): Promise<any> {
  const state = await getState();
  return state.galleryImages.find((img: any) => img.imageKey === imageKey);
}

// Branding operations
export async function getBrandingImage(type: string): Promise<any> {
  const state = await getState();
  return state.branding[type] || null;
}

export async function upsertBrandingImage(type: string, imageUrl: string, imageKey: string): Promise<void> {
  const state = await getState();
  state.branding[type] = {
    id: Object.keys(state.branding).length + 1,
    type,
    imageUrl,
    imageKey,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  markDirty();
  await saveDb(state);
}

export async function deleteBrandingImage(type: string): Promise<void> {
  const state = await getState();
  delete state.branding[type];
  markDirty();
  await saveDb(state);
}

// Social links
export async function getAllSocialLinks(): Promise<any[]> {
  const state = await getState();
  return state.socialLinks;
}

export async function upsertSocialLink(platform: string, url: string | null): Promise<void> {
  const state = await getState();
  const idx = state.socialLinks.findIndex((s: any) => s.platform === platform);
  if (idx >= 0) {
    state.socialLinks[idx] = { ...state.socialLinks[idx], url, updatedAt: new Date().toISOString() };
  } else if (url) {
    state.socialLinks.push({
      id: state.socialLinks.length + 1,
      platform,
      url,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  markDirty();
  await saveDb(state);
}

export async function initializeSocialLinks(): Promise<void> {
  const state = await getState();
  if (state.socialLinks.length === 0) {
    const defaults = [
      "facebook", "instagram", "twitter", "tiktok",
      "snapchat", "youtube", "linkedin", "whatsapp",
    ];
    state.socialLinks = defaults.map((platform, i) => ({
      id: i + 1,
      platform,
      url: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    markDirty();
    await saveDb(state);
  }
}

// Floating icons
export async function getAllFloatingIcons(): Promise<any[]> {
  const state = await getState();
  return state.floatingIcons;
}

export async function getFloatingIcon(type: string): Promise<any> {
  const state = await getState();
  return state.floatingIcons.find((icon: any) => icon.type === type);
}

export async function upsertFloatingIcon(icon: any): Promise<void> {
  const state = await getState();
  const idx = state.floatingIcons.findIndex((i: any) => i.type === icon.type);
  if (idx >= 0) {
    state.floatingIcons[idx] = { ...state.floatingIcons[idx], ...icon, updatedAt: new Date().toISOString() };
  } else {
    state.floatingIcons.push({
      ...icon,
      id: state.floatingIcons.length > 10 ? 1 : state.floatingIcons.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  markDirty();
  await saveDb(state);
}

export async function deleteFloatingIcon(type: string): Promise<void> {
  const state = await getState();
  state.floatingIcons = state.floatingIcons.filter((i: any) => i.type !== type);
  markDirty();
  await saveDb(state);
}

// SEO
export async function getSeo(): Promise<any> {
  const state = await getState();
  return state.seo;
}

export async function updateSeo(updates: any): Promise<void> {
  const state = await getState();
  state.seo = { ...state.seo, ...updates };
  markDirty();
  await saveDb(state);
}
// Alias for backward compatibility
export { getUser as getUserByOpenId };

// Additional aliases
export { upsertAdminCredential as updateAdminPassword };
export { upsertSocialLink as updateSocialLink };
