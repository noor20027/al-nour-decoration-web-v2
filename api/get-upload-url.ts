import { VercelBlobError } from '@vercel/blob';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { filename, type } = req.body;

    if (!filename || !type) {
      return res.status(400).json({ error: 'Missing filename or type' });
    }

    // Generate unique filename
    const uniqueId = uuidv4();
    const ext = filename.split('.').pop();
    const uniqueFilename = `${type}/${uniqueId}.${ext}`;

    // Use the Vercel Blob API to get an upload URL
    const response = await fetch('https://blob.vercel-storage.com/api/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'multipart',
        filename: uniqueFilename,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Vercel Blob API error:', error);
      throw new Error(`Vercel Blob API error: ${response.status}`);
    }

    const data = await response.json();

    return res.status(200).json({
      uploadUrl: data.url,
      filename: uniqueFilename,
    });
  } catch (error: any) {
    console.error('Upload URL generation error:', error);
    return res.status(500).json({
      error: 'Failed to generate upload URL',
      details: error.message,
    });
  }
}
