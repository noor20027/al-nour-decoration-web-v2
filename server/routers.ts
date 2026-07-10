import { getSessionCookieOptions } from "./_core/cookies.js";
import { COOKIE_NAME } from "../shared/const";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { hashPassword, verifyPassword } from "./_core/auth";
import {
  getAdminByUsername,
  createAdminCredentials,
  updateAdminPassword,
  getAllGalleryImages,
  addGalleryImage,
  deleteGalleryImage,
  updateGalleryImage,
  getCarouselImages,
  getAllSocialLinks,
  updateSocialLink,
  initializeSocialLinks,
  getBrandingImage,
  upsertBrandingImage,
  deleteBrandingImage,
  getAllFloatingIcons,
  getFloatingIcon,
  upsertFloatingIcon,
  deleteFloatingIcon,
} from "./db";
import { storagePut } from "./storage";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Admin authentication and management
  admin: router({
    login: publicProcedure
      .input(z.object({ username: z.string(), password: z.string() }))
      .mutation(async ({ input, ctx }) => {
        // First check environment variables for admin login
        const envAdminUser = process.env.ADMIN_USERNAME || 'admin';
        const envAdminPass = process.env.ADMIN_PASSWORD || 'admin';

        if (input.username === envAdminUser && input.password === envAdminPass) {
          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie('admin_session', 'admin_static_session', {
            ...cookieOptions,
            maxAge: 86400000,
          });
          return { success: true, adminId: 0 };
        }

        const admin = await getAdminByUsername(input.username);
        if (!admin || !verifyPassword(input.password, admin.passwordHash)) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });
        }
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie('admin_session', String(admin.id), {
          ...cookieOptions,
          maxAge: 86400000,
        });
        return { success: true, adminId: admin.id };
      }),

    logout: publicProcedure.mutation(({ ctx }) => {
      ctx.res.clearCookie('admin_session', { path: '/' });
      return { success: true };
    }),

    changePassword: publicProcedure
      .input(z.object({ username: z.string(), oldPassword: z.string(), newPassword: z.string() }))
      .mutation(async ({ input }) => {
        const admin = await getAdminByUsername(input.username);
        if (!admin || !verifyPassword(input.oldPassword, admin.passwordHash)) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid current password" });
        }
        const newHash = hashPassword(input.newPassword);
        await updateAdminPassword(input.username, newHash);
        return { success: true };
      }),
  }),

  // Gallery management
  gallery: router({
    getAll: publicProcedure.query(async () => {
      return await getAllGalleryImages();
    }),

    uploadImage: publicProcedure
      .input(
        z.object({
          fileName: z.string(),
          fileSize: z.number(),
          mimeType: z.string(),
          fileData: z.string(), // base64 encoded file data
        })
      )
      .mutation(async ({ input }) => {
        try {
          // Validate base64 data
          if (!input.fileData || input.fileData.length === 0) {
            throw new Error('Empty file data');
          }
          
          // Decode base64 to buffer
          const buffer = Buffer.from(input.fileData, 'base64');
          
          if (buffer.length === 0) {
            throw new Error('Invalid base64 data');
          }
          
          // Upload to storage
          const { key, url } = await storagePut(
            `gallery/${input.fileName}`,
            buffer,
            input.mimeType
          );
          
          return { success: true, imageUrl: url, imageKey: key };
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: `Upload failed: ${message}` });
        }
      }),

    add: publicProcedure
      .input(
        z.object({
          imageUrl: z.string().min(1),
          imageKey: z.string(),
          title: z.string().optional(),
          description: z.string().optional(),
          orientation: z.enum(['horizontal', 'vertical']).optional(),
          isCarousel: z.enum(['yes', 'no']).optional(),
        })
      )
      .mutation(async ({ input }) => {
        await addGalleryImage(input.imageUrl, input.imageKey, input.title, input.description, input.orientation, input.isCarousel);
        return { success: true };
      }),

    delete: publicProcedure
      .input(z.object({ imageKey: z.string() }))
      .mutation(async ({ input }) => {
        await deleteGalleryImage(input.imageKey);
        return { success: true };
      }),

    update: publicProcedure
      .input(
        z.object({
          imageKey: z.string(),
          title: z.string().optional(),
          description: z.string().optional(),
          orientation: z.enum(['horizontal', 'vertical']).optional(),
          isCarousel: z.enum(['yes', 'no']).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { imageKey, ...updates } = input;
        await updateGalleryImage(imageKey, updates);
        return { success: true };
      }),

    getCarousel: publicProcedure.query(async () => {
      return await getCarouselImages();
    }),
  }),

  // Social links management
  social: router({
    getAll: publicProcedure.query(async () => {
      return await getAllSocialLinks();
    }),

    update: publicProcedure
      .input(z.object({ platform: z.string(), url: z.string().url().nullable() }))
      .mutation(async ({ input }) => {
        await updateSocialLink(input.platform, input.url);
        return { success: true };
      }),

    initialize: publicProcedure.mutation(async () => {
      await initializeSocialLinks();
      return { success: true };
    }),
  }),

  branding: router({
    getLogo: publicProcedure.query(async () => {
      return await getBrandingImage('logo');
    }),

    getBanner: publicProcedure.query(async () => {
      return await getBrandingImage('banner');
    }),

    uploadLogo: publicProcedure
      .input(z.object({ fileName: z.string(), fileSize: z.number(), mimeType: z.string(), fileData: z.string() }))
      .mutation(async ({ input }) => {
        try {
          const buffer = Buffer.from(input.fileData, 'base64');
          const { key, url } = await storagePut(`branding/logo_${Date.now()}`, buffer, input.mimeType);
          await upsertBrandingImage('logo', url, key);
          return { success: true, imageUrl: url, imageKey: key };
        } catch (error) {
          console.error('[uploadLogo] Error:', error);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to upload logo' });
        }
      }),

    uploadBanner: publicProcedure
      .input(z.object({ fileName: z.string(), fileSize: z.number(), mimeType: z.string(), fileData: z.string() }))
      .mutation(async ({ input }) => {
        try {
          const buffer = Buffer.from(input.fileData, 'base64');
          const { key, url } = await storagePut(`branding/banner_${Date.now()}`, buffer, input.mimeType);
          await upsertBrandingImage('banner', url, key);
          return { success: true, imageUrl: url, imageKey: key };
        } catch (error) {
          console.error('[uploadBanner] Error:', error);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to upload banner' });
        }
      }),

    deleteLogo: publicProcedure.mutation(async () => {
      await deleteBrandingImage('logo');
      return { success: true };
    }),

    deleteBanner: publicProcedure.mutation(async () => {
      await deleteBrandingImage('banner');
      return { success: true };
    }),
  }),

  floatingIcons: router({
    getAll: publicProcedure.query(async () => {
      return await getAllFloatingIcons();
    }),
    get: publicProcedure
      .input(z.enum(['whatsapp', 'call']))
      .query(async ({ input }) => {
        return await getFloatingIcon(input);
      }),
    upsert: publicProcedure
      .input(z.object({ type: z.enum(['whatsapp', 'call']), phoneNumber: z.string(), isEnabled: z.enum(['yes', 'no']).optional() }))
      .mutation(async ({ input }) => {
        await upsertFloatingIcon(input.type, input.phoneNumber, input.isEnabled || 'yes');
        return { success: true };
      }),
    delete: publicProcedure
      .input(z.enum(['whatsapp', 'call']))
      .mutation(async ({ input }) => {
        await deleteFloatingIcon(input);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
