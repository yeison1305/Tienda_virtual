import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '../middleware/requireAdmin';

const router = Router();

// Bucket name in Supabase Storage - create this in Supabase Dashboard -> Storage
const BUCKET = 'uploads';

// Lazy Supabase client getter (ensures env vars are loaded)
function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
}

// Multer memory storage (file in buffer, not disk)
const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo imágenes (JPEG, PNG, WebP, GIF)'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Upload endpoint - requires admin
router.post('/', requireAdmin, upload.single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ningún archivo' });
    }

    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(req.file.originalname);
    const filename = `${req.file.fieldname}-${uniqueSuffix}${ext}`;

    // Upload to Supabase Storage
    const supabase = getSupabase();
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(filename, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return res.status(500).json({ error: 'Error al subir la imagen a Supabase' });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(filename);

    res.json({
      url: publicUrl,
      filename: data.path,
      originalName: req.file.originalname,
      size: req.file.size,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Error al subir la imagen' });
  }
});

export default router;