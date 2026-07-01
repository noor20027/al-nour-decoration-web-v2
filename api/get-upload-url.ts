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

    // Generate unique filename with timestamp
    const uniqueId = uuidv4();
    const ext = filename.split('.').pop();
    const uniqueFilename = `${type}/${uniqueId}.${ext}`;

    // Construct the Vercel Blob upload URL
    // This is the standard way to upload to Vercel Blob
    const uploadUrl = `https://blob.vercel-storage.com/upload?filename=${encodeURIComponent(uniqueFilename)}`;

    console.log('[Upload API] Generated upload URL for:', uniqueFilename);

    return res.status(200).json({
      uploadUrl: uploadUrl,
      filename: uniqueFilename,
      blobUrl: `https://wfykl3k1ry0wjacl.public.blob.vercel-storage.com/${uniqueFilename}`
    });
  } catch (error: any) {
    console.error('[Upload API] Error:', error);
    return res.status(500).json({
      error: 'Failed to generate upload URL',
      details: error.message,
    });
  }
}
