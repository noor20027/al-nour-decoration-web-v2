import { put } from '@vercel/blob';
import express from 'express';

const router = express.Router();

router.post('/api/upload', async (req, res) => {
  try {
    const { fileName, fileData, mimeType } = req.body;

    if (!fileName || !fileData) {
      return res.status(400).json({ error: 'Missing fileName or fileData' });
    }

    // Decode base64
    const buffer = Buffer.from(fileData, 'base64');
    
    // Upload to Vercel Blob
    const blob = await put(fileName, buffer, {
      access: 'public',
      contentType: mimeType || 'application/octet-stream',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return res.json({
      success: true,
      url: blob.url,
      pathname: blob.pathname,
    });
  } catch (error: any) {
    console.error('Direct upload error:', error);
    return res.status(500).json({
      error: 'Upload failed',
      details: error.message,
    });
  }
});

export default router;
