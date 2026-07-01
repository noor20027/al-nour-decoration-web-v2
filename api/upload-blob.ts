import { put } from '@vercel/blob';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const formData = req.body;
    
    // في بيئة Vercel، يتم استقبال FormData كـ Buffer
    // نحتاج إلى معالجة الملف من req.file أو من middleware
    
    // للآن، سنستخدم طريقة بسيطة - نتوقع أن يكون الملف في req.file
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const filename = req.body.filename || `upload-${Date.now()}`;
    
    console.log('[API] Uploading file:', filename);

    // استخدام @vercel/blob للرفع
    const blob = await put(filename, req.file.buffer, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    console.log('[API] Upload successful:', blob.url);

    return res.status(200).json({
      success: true,
      url: blob.url,
      key: blob.pathname,
    });
  } catch (error: any) {
    console.error('[API] Upload error:', error);
    return res.status(500).json({
      error: 'Upload failed',
      details: error.message,
    });
  }
}
