import express from 'express';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from '../server/routers';
import { createContext } from '../server/_core/context';

const app = express();

// Middleware الأساسية لزيادة حجم البيانات المسموح بها للصور
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// تسجيل tRPC Middleware لخدمة كافة الطلبات (بما فيها الأدمن والمعرض والهوية)
app.use(
  '/api/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext
  })
);

// دعم المسار البديل لـ tRPC لضمان التوافق
app.use(
  '/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext
  })
);

// نقطة فحص الحالة
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// تصدير التطبيق لـ Vercel
export default app;
