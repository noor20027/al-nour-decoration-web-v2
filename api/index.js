// Vercel Serverless Function Handler
// This file serves as the entry point for Vercel to handle all API requests

import express from 'express';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { createConnection } from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { TRPCError, initTRPC } from '@trpc/server';

// Initialize Express app
const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Database connection
let _db = null;
let _connection = null;

async function getDb() {
  if (!process.env.DATABASE_URL) {
    console.warn('[DB] No DATABASE_URL provided');
    return null;
  }

  if (_connection && _db) {
    try {
      await _connection.ping();
      return _db;
    } catch (error) {
      console.error('[DB] Connection lost, reconnecting...', error);
      try {
        await _connection.end();
      } catch (e) {
        // Ignore
      }
      _db = null;
      _connection = null;
    }
  }

  if (!_db) {
    try {
      _connection = await createConnection(process.env.DATABASE_URL);
      _db = drizzle(_connection);
      console.log('[DB] Connected successfully');
      
      // Auto-create tables
      try {
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
        console.log('[DB] Tables ensured');
      } catch (tableErr) {
        console.error('[DB] Error ensuring tables:', tableErr);
      }
    } catch (error) {
      console.error('[DB] Failed to connect:', error);
      _db = null;
      _connection = null;
    }
  }
  return _db;
}

// Simple in-memory fallback storage
let memoryStorage = {
  branding: {
    logo: null,
    banner: null
  }
};

// tRPC Setup
const t = initTRPC.create();
const router = t.router;
const publicProcedure = t.procedure;

const appRouter = router({
  branding: router({
    getLogo: publicProcedure.query(async () => {
      const db = await getDb();
      if (db) {
        try {
          const result = await db.execute(sql`SELECT imageUrl, imageKey FROM branding WHERE type = 'logo' LIMIT 1`);
          if (result[0] && result[0].length > 0) {
            return { imageUrl: result[0][0].imageUrl, imageKey: result[0][0].imageKey };
          }
        } catch (e) {
          console.error('[DB] Error getting logo:', e);
        }
      }
      return memoryStorage.branding.logo;
    }),
    
    getBanner: publicProcedure.query(async () => {
      const db = await getDb();
      if (db) {
        try {
          const result = await db.execute(sql`SELECT imageUrl, imageKey FROM branding WHERE type = 'banner' LIMIT 1`);
          if (result[0] && result[0].length > 0) {
            return { imageUrl: result[0][0].imageUrl, imageKey: result[0][0].imageKey };
          }
        } catch (e) {
          console.error('[DB] Error getting banner:', e);
        }
      }
      return memoryStorage.branding.banner;
    }),
    
    uploadLogo: publicProcedure
      .input(z.object({ fileName: z.string(), fileSize: z.number(), mimeType: z.string(), fileData: z.string() }))
      .mutation(async ({ input }) => {
        try {
          const imageUrl = `/manus-storage/logo_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
          const imageKey = `branding/logo_${Date.now()}`;
          
          // Try to save to database
          const db = await getDb();
          if (db) {
            try {
              await db.execute(sql`
                INSERT INTO branding (type, imageUrl, imageKey) 
                VALUES ('logo', ${imageUrl}, ${imageKey})
                ON DUPLICATE KEY UPDATE imageUrl = ${imageUrl}, imageKey = ${imageKey}
              `);
              console.log('[DB] Logo saved to database');
            } catch (e) {
              console.error('[DB] Error saving logo:', e);
            }
          }
          
          // Also save to memory
          memoryStorage.branding.logo = { imageUrl, imageKey };
          
          return { success: true, imageUrl, imageKey };
        } catch (error) {
          console.error('[API] Logo upload error:', error);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to upload logo' });
        }
      }),
    
    uploadBanner: publicProcedure
      .input(z.object({ fileName: z.string(), fileSize: z.number(), mimeType: z.string(), fileData: z.string() }))
      .mutation(async ({ input }) => {
        try {
          const imageUrl = `/manus-storage/banner_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
          const imageKey = `branding/banner_${Date.now()}`;
          
          // Try to save to database
          const db = await getDb();
          if (db) {
            try {
              await db.execute(sql`
                INSERT INTO branding (type, imageUrl, imageKey) 
                VALUES ('banner', ${imageUrl}, ${imageKey})
                ON DUPLICATE KEY UPDATE imageUrl = ${imageUrl}, imageKey = ${imageKey}
              `);
              console.log('[DB] Banner saved to database');
            } catch (e) {
              console.error('[DB] Error saving banner:', e);
            }
          }
          
          // Also save to memory
          memoryStorage.branding.banner = { imageUrl, imageKey };
          
          return { success: true, imageUrl, imageKey };
        } catch (error) {
          console.error('[API] Banner upload error:', error);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to upload banner' });
        }
      })
  })
});

// Create context
function createContext() {
  return {};
}

// Register tRPC middleware
app.use(
  '/api/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext
  })
);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Export for Vercel
export default app;
