# Al-Nour Decoration - CDN Caching Issue

## Problem
- state.json in Vercel Blob is being served with stale/empty data from CDN cache
- When delete operations run, loadDb() reads CDN cached empty state, then saveDb() writes empty state
- This causes ALL gallery images and branding data to be lost!

## Root Cause
- Vercel Blob CDN cache doesn't respect cacheControlMaxAge: 0 immediately
- There's a propagation delay of several seconds to minutes
- When multiple operations happen quickly, each reads stale CDN data and writes over each other

## Solution Approach (FINAL)
1. Use `@vercel/blob` SDK `get()` with options for reads (authenticated, not CDN)
   - `get(pathname, { access: "public", useCache: false })` 
   - This uses Bearer token → goes through authenticated path → not CDN cached
   - BUT: we tested this and it returned 0 (empty) - maybe body reading failed
   
2. Alternative: Use `head()` + `get()` with ETag
   - `head()` returns ETag
   - `get()` with `ifNoneMatch` returns 304 if not changed

3. BEST SOLUTION: Use `@vercel/blob` `get()` with `access: "private"` and `useCache: false`
   - This adds `?cache=0` to the URL
   - For private blobs, this bypasses CDN entirely

4. Since state.json is "public" access, we can still read it as "private" with Bearer token
   - The Bearer token gives us authenticated access regardless of blob access level

## Key Finding
- `get()` requires options with `access: "public"` or `"private"`
- When `useCache: false` and `access: "private"`: adds `?cache=0` to URL
- When `access: "public"`: reads directly from Blob URL (may still be CDN cached)

## Files
- server/db.ts: contains loadDb() and saveDb()
- server/routers.ts: tRPC routers
- server/storage.ts: put() for images

## Current State (2026-08-15)
- state.json was accidentally emptied by delete operations reading stale CDN data
- Need to restore data AND fix the root cause
