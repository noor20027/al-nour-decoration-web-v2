const express = require('express');
const app = express();
app.use(express.json({ limit: '50mb' }));

// Global memory storage to persist data across requests
if (!global.siteData) {
  global.siteData = {
    gallery: [],
    branding: { 
      logo: { imageUrl: "/manus-storage/PaQSzhpBRR8XnSvXpgm6lx_1779503904693_na1fn_L2hvbWUvdWJ1bnR1L2FsX25vdXJfbmV3X2JhY2tncm91bmQ_625bc8e1.webp" }, 
      banner: { imageUrl: "/manus-storage/al_nour_luxury_banner_718dadb8.png" } 
    },
    social: [
      { platform: 'whatsapp', url: 'https://wa.me/966508297600' },
      { platform: 'instagram', url: 'https://www.instagram.com/noorest2025' },
      { platform: 'facebook', url: 'https://www.facebook.com/share/1EJs49Jwzg/' },
      { platform: 'tiktok', url: '#' },
      { platform: 'snapchat', url: '#' },
      { platform: 'youtube', url: '#' },
      { platform: 'x', url: '#' }
    ]
  };
}

app.all('*', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const data = global.siteData;
  
  let path = req.url || '';
  if (req.query && req.query.batch) path += req.query.batch;
  
  const respond = (resultData) => res.status(200).json([{ result: { data: resultData } }]);

  // 1. QUERIES
  if (path.includes('social.getAll')) return respond(data.social);
  if (path.includes('gallery.getAll')) return respond(data.gallery);
  if (path.includes('gallery.getCarousel')) return respond(data.gallery.filter(img => img.isCarousel === 'yes'));
  if (path.includes('branding.getLogo')) return respond(data.branding.logo);
  if (path.includes('branding.getBanner')) return respond(data.branding.banner);
  if (path.includes('admin.login')) return respond({ success: true, username: 'admin' });

  // 2. MUTATIONS
  const body = (req.body && req.body[0]) ? req.body[0] : req.body;
  
  if (path.includes('gallery.uploadImage')) {
    const imageUrl = `data:image/png;base64,${body.fileData}`;
    return respond({ imageUrl, imageKey: Date.now().toString() });
  }
  
  if (path.includes('gallery.add')) {
    data.gallery.push({
      imageUrl: body.imageUrl,
      imageKey: body.imageKey,
      title: body.title,
      description: body.description,
      orientation: body.orientation,
      isCarousel: body.isCarousel
    });
    return respond({ success: true });
  }
  
  if (path.includes('social.update')) {
    const s = data.social.find(x => x.platform === body.platform);
    if (s) s.url = body.url;
    return respond({ success: true });
  }
  
  if (path.includes('branding.uploadLogo')) {
    data.branding.logo = { imageUrl: `data:image/png;base64,${body.fileData}` };
    return respond({ success: true });
  }
  
  if (path.includes('branding.uploadBanner')) {
    data.branding.banner = { imageUrl: `data:image/png;base64,${body.fileData}` };
    return respond({ success: true });
  }

  return respond({ success: true });
});

module.exports = app;
