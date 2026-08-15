import { put, del, list, get } from "@vercel/blob";

// Simple JSON-based storage in Vercel Blob
// In-memory caching with TTL for fast reads + invalidation on writes

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

function getDefaultState(): DbState {
  return {
    users: [],
    adminCredentials: [
      {
        id: 1,
        username: "admin",
        passwordHash: "admin",
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

// Always fetch fresh from Blob using authenticated get() (not CDN cached)
export async function loadDb(): Promise<DbState> {
  const maxRetries = 3;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Use @vercel/blob get() with options - this uses Bearer token (not CDN cached)
      const result = await get(`${BLOB_PREFIX}state.json`, {
        access: "public",
        useCache: false,
      });
      if (result.blob) {
        // For Vercel Blob, when access is "public" and useCache is false,
        // it adds ?cache=0 to private URLs. For public, it reads directly.
        // We need to read the stream/body
        if (result.body) {
          // Read from stream
          const chunks: Buffer[] = [];
          for await (const chunk of result.body as any) {
            chunks.push(Buffer.from(chunk));
          }
          const text = Buffer.concat(chunks).toString();
          return JSON.parse(text) as DbState;
        }
      }
      throw new Error("Failed to read blob data");
    } catch (e) {
      if (attempt < maxRetries - 1) {
        await new Promise(r => setTimeout(r, 100 * (attempt + 1)));
      } else {
        console.log("[DB] No existing state found, using defaults");
        return getDefaultState();
      }
    }
  }
  return getDefaultState();
}



// Simple in-process async mutex to serialize writes within the same serverless instance
let savePromise: Promise<void> | null = null;

function withSaveMutex<T>(fn: () => Promise<T>): Promise<T> {
  const run = async () => {
    try {
      return await fn();
    } finally {
      // Small delay to let Blob CDN propagate
      await new Promise(r => setTimeout(r, 500));
    }
  };
  
  if (savePromise) {
    // Chain after existing save
    const result = savePromise.then(() => run());
    savePromise = result.catch(() => {});
    return result;
  } else {
    savePromise = run().catch(() => {});
    return run();
  }
}

// Save full DB state to Blob with mutex serialization and merge logic
export function saveDb(state: DbState): Promise<void> {
  return withSaveMutex(async () => {
    // Always re-read fresh state and merge our changes to prevent lost updates
    const freshState = await loadDb(); // always fresh read
    // Merge galleryImages: keep all from fresh state, add any missing from our state
    for (const img of state.galleryImages) {
      if (!freshState.galleryImages.find((f: any) => f.imageKey === img.imageKey)) {
        freshState.galleryImages.push(img);
      }
    }
    // Remove images that are in freshState but NOT in our state (deletions)
    freshState.galleryImages = freshState.galleryImages.filter((f: any) => 
      state.galleryImages.find((img: any) => img.imageKey === f.imageKey)
    );
    // Merge branding: take the latest from either
    for (const [key, val] of Object.entries(state.branding)) {
      freshState.branding[key] = val;
    }
    const json = JSON.stringify(freshState);
    await put(`${BLOB_PREFIX}state.json`, json, {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 0, // Prevent CDN caching - always serve fresh data
    });
    console.log("[DB] State saved to Blob storage");
  });
}

// User operations
export async function upsertUser(user: any): Promise<void> {
  const state = await loadDb();
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
  await saveDb(state);
}

export async function getUser(openId: string): Promise<any> {
  const state = await loadDb();
  return state.users.find((u: any) => u.openId === openId);
}

export { getUser as getUserByOpenId };

export async function getAllUsers(): Promise<any[]> {
  const state = await loadDb();
  return state.users;
}

export async function deleteUser(openId: string): Promise<void> {
  const state = await loadDb();
  state.users = state.users.filter((u: any) => u.openId !== openId);
  await saveDb(state);
}

// Admin operations
export async function getAdminByUsername(username: string): Promise<any> {
  const state = await loadDb();
  return state.adminCredentials.find((u: any) => u.username === username);
}

export async function upsertAdminCredential(cred: any): Promise<void> {
  const state = await loadDb();
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
  await saveDb(state);
}

export { upsertAdminCredential as updateAdminPassword };

// Gallery operations
export async function getAllGalleryImages(): Promise<any[]> {
  const state = await loadDb();
  return [...state.galleryImages].sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0));
}

export async function getCarouselImages(): Promise<any[]> {
  const state = await loadDb();
  return state.galleryImages.filter((img: any) => img.isCarousel === "yes");
}

export async function addGalleryImage(imageUrl: string, imageKey: string, title?: string, description?: string, orientation?: string, isCarousel?: string): Promise<void> {
  const state = await loadDb(); // fresh read to prevent lost updates
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
  await saveDb(state);
}

export async function updateGalleryImage(imageKey: string, updates: any): Promise<void> {
  const state = await loadDb(); // fresh read
  const idx = state.galleryImages.findIndex((img: any) => img.imageKey === imageKey);
  if (idx >= 0) {
    state.galleryImages[idx] = { ...state.galleryImages[idx], ...updates, updatedAt: new Date().toISOString() };
    await saveDb(state);
  }
}

export async function deleteGalleryImage(imageKey: string): Promise<void> {
  const state = await loadDb(); // fresh read
  state.galleryImages = state.galleryImages.filter((img: any) => img.imageKey !== imageKey);
  await saveDb(state);
}

export async function getGalleryImage(imageKey: string): Promise<any> {
  const state = await loadDb();
  return state.galleryImages.find((img: any) => img.imageKey === imageKey);
}

// Branding operations
export async function getBrandingImage(type: string): Promise<any> {
  const state = await loadDb();
  return state.branding[type] || null;
}

export async function upsertBrandingImage(type: string, imageUrl: string, imageKey: string): Promise<void> {
  const state = await loadDb(); // fresh read
  state.branding[type] = {
    id: Object.keys(state.branding).length + 1,
    type,
    imageUrl,
    imageKey,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await saveDb(state);
}

export async function deleteBrandingImage(type: string): Promise<void> {
  const state = await loadDb(); // fresh read
  delete state.branding[type];
  await saveDb(state);
}

// Social links
export async function getAllSocialLinks(): Promise<any[]> {
  const state = await loadDb();
  return state.socialLinks;
}

export async function upsertSocialLink(platform: string, url: string | null): Promise<void> {
  const state = await loadDb();
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
  await saveDb(state);
}

export { upsertSocialLink as updateSocialLink };

export async function initializeSocialLinks(): Promise<void> {
  const state = await loadDb();
  if (state.socialLinks.length === 0) {
    const defaults = ["facebook", "instagram", "twitter", "tiktok", "snapchat", "youtube", "linkedin", "whatsapp"];
    state.socialLinks = defaults.map((platform, i) => ({
      id: i + 1,
      platform,
      url: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    await saveDb(state);
  }
}

// Floating icons
export async function getAllFloatingIcons(): Promise<any[]> {
  const state = await loadDb();
  return state.floatingIcons;
}

export async function getFloatingIcon(type: string): Promise<any> {
  const state = await loadDb();
  return state.floatingIcons.find((icon: any) => icon.type === type);
}

export async function upsertFloatingIcon(type: string, phoneNumber: string, isEnabled?: string): Promise<void> {
  const state = await loadDb();
  const idx = state.floatingIcons.findIndex((i: any) => i.type === type);
  if (idx >= 0) {
    state.floatingIcons[idx] = { ...state.floatingIcons[idx], type, phoneNumber, isEnabled: isEnabled || 'yes', updatedAt: new Date().toISOString() };
  } else {
    state.floatingIcons.push({
      type,
      phoneNumber,
      isEnabled: isEnabled || 'yes',
      id: state.floatingIcons.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  await saveDb(state);
}

export async function deleteFloatingIcon(type: string): Promise<void> {
  const state = await loadDb();
  state.floatingIcons = state.floatingIcons.filter((i: any) => i.type !== type);
  await saveDb(state);
}

// SEO
export async function getSeo(): Promise<any> {
  const state = await loadDb();
  return state.seo;
}

export async function updateSeo(updates: any): Promise<void> {
  const state = await loadDb();
  state.seo = { ...state.seo, ...updates };
  await saveDb(state);
}
