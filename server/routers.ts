import { getSessionCookieOptions } from "./_core/cookies";
import { COOKIE_NAME } from "../shared/const";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { hashPassword, verifyPassword } from "./_core/auth";
import {
  getAdminByUsername,
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
} from "./db";
import { storagePut } from "./storage";

export const appRouter = router({
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

  admin: router({
    login: publicProcedure
      .input(z.object({ username: z.string(), password: z.string() }))
      .mutation(async ({ input, ctx }) => {
        // تم إزالة كلمة المرور الافتراضية (admin/admin) لزيادة الأمان
        const admin = await getAdminByUsername(input.username);
        if (!admin || !verifyPassword(input.password, admin.passwordHash)) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "اسم المستخدم أو كلمة السر غير صحيحة" });
        }
        
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie("admin_session", String(admin.id), {
          ...cookieOptions,
          maxAge: 86400000, // 24 hours
        });
        return { success: true, adminId: admin.id };
      }),

    logout: publicProcedure.mutation(({ ctx }) => {
      ctx.res.clearCookie("admin_session", { path: "/" });
      return { success: true };
    }),

    changePassword: publicProcedure
      .input(z.object({ username: z.string(), oldPassword: z.string(), newPassword: z.string() }))
      .mutation(async ({ input }) => {
        const admin = await getAdminByUsername(input.username);
        if (!admin || !verifyPassword(input.oldPassword, admin.passwordHash)) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "كلمة السر الحالية غير صحيحة" });
        }
        const newHash = hashPassword(input.newPassword);
        await updateAdminPassword(input.username, newHash);
        return { success: true };
      }),
  }),

  gallery: router({
    getAll: publicProcedure.query(async () => {
      return await getAllGalleryImages();
    }),
    uploadImage: publicProcedure
      .input(z.object({ fileName: z.string(), fileSize: z.number(), mimeType: z.string(), fileData: z.string() }))
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.fileData, "base64");
        const { key, url } = await storagePut(`gallery/${input.fileName}`, buffer, input.mimeType);
        return { success: true, imageUrl: url, imageKey: key };
      }),
    add: publicProcedure
      .input(z.object({ imageUrl: z.string().min(1), imageKey: z.string(), title: z.string().optional(), description: z.string().optional(), orientation: z.enum(["horizontal", "vertical"]).optional(), isCarousel: z.enum(["yes", "no"]).optional() }))
      .mutation(async ({ input }) => {
        await addGalleryImage(input.imageUrl, input.imageKey, input.title, input.description, input.orientation, input.isCarousel);
        return { success: true };
      }),
    delete: publicProcedure.input(z.object({ imageKey: z.string() })).mutation(async ({ input }) => {
      await deleteGalleryImage(input.imageKey);
      return { success: true };
    }),
    update: publicProcedure.input(z.object({ imageKey: z.string(), title: z.string().optional(), description: z.string().optional(), orientation: z.enum(["horizontal", "vertical"]).optional(), isCarousel: z.enum(["yes", "no"]).optional() })).mutation(async ({ input }) => {
      const { imageKey, ...updates } = input;
      await updateGalleryImage(imageKey, updates);
      return { success: true };
    }),
    getCarousel: publicProcedure.query(async () => {
      return await getCarouselImages();
    }),
  }),

  social: router({
    getAll: publicProcedure.query(async () => {
      return await getAllSocialLinks();
    }),
    update: publicProcedure.input(z.object({ platform: z.string(), url: z.string().url().nullable() })).mutation(async ({ input }) => {
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
      return await getBrandingImage("logo");
    }),
    getBanner: publicProcedure.query(async () => {
      return await getBrandingImage("banner");
    }),
    saveBranding: publicProcedure.input(z.object({ type: z.enum(["logo", "banner"]), imageUrl: z.string(), imageKey: z.string() })).mutation(async ({ input }) => {
      await upsertBrandingImage(input.type, input.imageUrl, input.imageKey);
      return { success: true };
    }),
    uploadLogo: publicProcedure.input(z.object({ fileName: z.string(), fileSize: z.number(), mimeType: z.string(), fileData: z.string() })).mutation(async ({ input }) => {
      const buffer = Buffer.from(input.fileData, "base64");
      const { key, url } = await storagePut(`branding/logo_${Date.now()}`, buffer, input.mimeType);
      await upsertBrandingImage("logo", url, key);
      return { success: true, imageUrl: url, imageKey: key };
    }),
    uploadBanner: publicProcedure.input(z.object({ fileName: z.string(), fileSize: z.number(), mimeType: z.string(), fileData: z.string() })).mutation(async ({ input }) => {
      const buffer = Buffer.from(input.fileData, "base64");
      const { key, url } = await storagePut(`branding/banner_${Date.now()}`, buffer, input.mimeType);
      await upsertBrandingImage("banner", url, key);
      return { success: true, imageUrl: url, imageKey: key };
    }),
    deleteLogo: publicProcedure.mutation(async () => {
      await deleteBrandingImage("logo");
      return { success: true };
    }),
    deleteBanner: publicProcedure.mutation(async () => {
      await deleteBrandingImage("banner");
      return { success: true };
    }),
  }),
});

export type AppRouter = typeof appRouter;
