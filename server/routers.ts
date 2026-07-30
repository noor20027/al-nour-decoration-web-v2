import { getSessionCookieOptions } from "./_core/cookies.js";
import { COOKIE_NAME } from "../shared/const.js";
import { systemRouter } from "./_core/systemRouter.js";
import { publicProcedure, router } from "./_core/trpc.js";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { hashPassword, verifyPassword } from "./_core/auth.js";
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
} from "./db.js";
import { storagePut } from "./storage.js";

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
        // التحقق المباشر من الثوابت المطلوبة admin / admin
        if (input.username === "admin" && input.password === "admin") {
          const cookieOptions = getSessionCookieOptions(ctx.req);
          
          // تعيين الجلسة على الكوكيز الافتراضي للنظام والكوكيز المخصص لضمان التوافق التام
          ctx.res.cookie(COOKIE_NAME, 'admin_static_session', {
            ...cookieOptions,
            maxAge: 86400000,
          });
          ctx.res.cookie('admin_session', 'admin_static_session', {
            ...cookieOptions,
            maxAge: 86400000,
          });
          return { success: true, adminId: 0 };
        }

        // في حال فشل المطابقة الثابتة يتم التحقق من قاعدة البيانات كخيار بديل
        const admin = await getAdminByUsername(input.username);
        if (!admin || !verifyPassword(input.password, admin.passwordHash)) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "بيانات الدخول غير صحيحة" });
        }

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, String(admin.id), {
          ...cookieOptions,
          maxAge: 86400000,
        });
        ctx.res.cookie('admin_session', String(admin.id), {
          ...cookieOptions,
          maxAge: 86400000,
        });
        return { success: true, adminId: admin.id };
      }),
    changePassword: publicProcedure
      .input(z.object({ oldPassword: z.string(), newPassword: z.string() }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user || ctx.user.id !== 0) {
          const admin = await getAdminByUsername('admin');
          if (!admin || !verifyPassword(input.oldPassword, admin.passwordHash)) {
            throw new TRPCError({ code: "UNAUTHORIZED", message: "كلمة المرور القديمة غير صحيحة" });
          }
          const newHash = hashPassword(input.newPassword);
          await updateAdminPassword(admin.id, newHash);
        }
        return { success: true };
      }),
  }),
  // Gallery and content management
  gallery: router({
    getAll: publicProcedure.query(async () => {
      return await getAllGalleryImages();
    }),
    add: publicProcedure
      .input(z.object({
        imageUrl: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        category: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await addGalleryImage(input);
      }),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        category: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await updateGalleryImage(input.id, input);
      }),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await deleteGalleryImage(input.id);
      }),
  }),
  carousel: router({
    getAll: publicProcedure.query(async () => {
      return await getCarouselImages();
    }),
  }),
  social: router({
    getAll: publicProcedure.query(async () => {
      const links = await getAllSocialLinks();
      if (links.length === 0) {
        await initializeSocialLinks();
        return await getAllSocialLinks();
      }
      return links;
    }),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        url: z.string(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        return await updateSocialLink(input.id, input.url, input.isActive);
      }),
  }),
  branding: router({
    get: publicProcedure.query(async () => {
      return await getBrandingImage();
    }),
    upsert: publicProcedure
      .input(z.object({ imageUrl: z.string() }))
      .mutation(async ({ input }) => {
        return await upsertBrandingImage(input.imageUrl);
      }),
    delete: publicProcedure.mutation(async () => {
      return await deleteBrandingImage();
    }),
  }),
  floatingIcons: router({
    getAll: publicProcedure.query(async () => {
      return await getAllFloatingIcons();
    }),
    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getFloatingIcon(input.id);
      }),
    upsert: publicProcedure
      .input(z.object({
        id: z.number().optional(),
        name: z.string(),
        icon: z.string(),
        url: z.string(),
        color: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        return await upsertFloatingIcon(input);
      }),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await deleteFloatingIcon(input.id);
      }),
  }),
  upload: router({
    image: publicProcedure
      .input(z.object({
        name: z.string(),
        type: z.string(),
        data: z.string(), // base64
      }))
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.data, 'base64');
        const url = await storagePut(input.name, buffer, input.type);
        return { url };
      }),
  }),
});

export type AppRouter = typeof appRouter;
