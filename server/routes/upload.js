const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SERVER_UPLOADS = path.join(__dirname, '..', 'uploads');
const CLIENT_DIST_UPLOADS = path.join(__dirname, '..', '..', 'client', 'dist', 'uploads');
const CLIENT_PUB_UPLOADS = path.join(__dirname, '..', '..', 'client', 'public', 'uploads');

[SERVER_UPLOADS, CLIENT_DIST_UPLOADS, CLIENT_PUB_UPLOADS].forEach(dir => {
  if (!fs.existsSync(dir)) {
    try { fs.mkdirSync(dir, { recursive: true }); } catch (e) {}
  }
});

// Helper: Save buffer to all upload directories
function saveToUploadDirs(filename, buffer) {
  const targets = [SERVER_UPLOADS, CLIENT_DIST_UPLOADS, CLIENT_PUB_UPLOADS];
  targets.forEach(dir => {
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(path.join(dir, filename), buffer);
    } catch (e) {
      console.error('[Upload] Error saving to', dir, e.message);
    }
  });
}

// POST /api/upload
// Accepts JSON: { image: 'data:image/...;base64,...' | 'base64string', filename: 'optional.jpg' }
router.post('/', (req, res) => {
  try {
    const { image, filename: originalName } = req.body;
    if (!image) {
      return res.status(400).json({ success: false, error: 'No image data provided in request body.' });
    }

    let buffer;
    let ext = 'jpg';

    if (image.startsWith('data:')) {
      const match = image.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
      if (match) {
        let rawExt = match[1].toLowerCase();
        if (rawExt === 'jpeg') ext = 'jpg';
        else if (rawExt === 'svg+xml') ext = 'svg';
        else ext = rawExt;
        buffer = Buffer.from(match[2], 'base64');
      } else {
        const commaIdx = image.indexOf(',');
        buffer = Buffer.from(image.substring(commaIdx + 1), 'base64');
      }
    } else {
      buffer = Buffer.from(image, 'base64');
      if (originalName && path.extname(originalName)) {
        ext = path.extname(originalName).replace('.', '').toLowerCase();
      }
    }

    if (!buffer || buffer.length === 0) {
      return res.status(400).json({ success: false, error: 'Invalid or empty image data received.' });
    }

    // Generate unique, clean filename
    const hash = crypto.randomBytes(6).toString('hex');
    const timestamp = Date.now();
    const safeName = originalName 
      ? path.basename(originalName, path.extname(originalName)).replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 20)
      : 'material_photo';
    const finalFilename = `${safeName}_${timestamp}_${hash}.${ext}`;

    saveToUploadDirs(finalFilename, buffer);

    const publicUrl = `/uploads/${finalFilename}`;
    console.log(`[Upload] Successfully saved image: ${publicUrl} (${(buffer.length / 1024).toFixed(1)} KB)`);

    res.json({
      success: true,
      url: publicUrl,
      filename: finalFilename,
      sizeBytes: buffer.length,
      mimeType: `image/${ext === 'jpg' ? 'jpeg' : ext}`
    });
  } catch (err) {
    console.error('[Upload] Error processing image upload:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
