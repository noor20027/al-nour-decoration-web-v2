import express from 'express';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from '../server/routers';
import { createContext } from '../server/_core/context';
import { put, handleUpload, type HandleUploadBody } from '@vercel/blob';

const app = express();

// Middleware الأساسية لزيادة حجم البيانات المسموح بها للصور
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// مسار الرفع المباشر البسيط جداً
app.post('/api/upload-blob', async (req, res) => {
  try {
    const { filename, fileData, mimeType } = req.body;
    
    if (!fileData) {
      return res.status(400).json({ error: 'No file data provided' });
    }

    // تحويل Base64 إلى Buffer
    const buffer = Buffer.from(fileData, 'base64');
    
    console.log('[API] Uploading to Vercel Blob:', filename);

    const blob = await put(filename, buffer, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
      contentType: mimeType
    });

    console.log('[API] Upload successful:', blob.url);

    res.json({
      success: true,
      url: blob.url,
      key: blob.pathname,
    });
  } catch (error: any) {
    console.error('[API] Upload error:', error);
    res.status(500).json({
      error: 'Upload failed',
      details: error.message,
    });
  }
});

// تسجيل tRPC Middleware
app.use(
  '/api/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext
  })
);

app.use(
  '/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext
  })
);

// مسار معالجة الرفع من طرف العميل لـ Vercel Blob
app.post('/api/upload/blob', async (req, res) => {
  try {
    const jsonResponse = await handleUpload({
      body: req.body as HandleUploadBody,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        // هنا يمكن إضافة التحقق من هوية المستخدم (Session check)
        // بما أن المستخدم مسجل الدخول في المتصفح، سنسمح بالرفع
        return {
          allowedContentTypes: [
            'image/jpeg', 
            'image/png', 
            'image/gif', 
            'image/webp', 
            'image/heic', 
            'image/heif', 
            'image/tiff', 
            'image/bmp',
            'image/x-adobe-dng'
          ],
          tokenPayload: JSON.stringify({
            // معلومات إضافية يمكن تمريرها
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // تم الرفع بنجاح
        console.log('Upload completed:', blob.url);
      },
    });

    res.json(jsonResponse);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// نقطة فحص الحالة
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;
