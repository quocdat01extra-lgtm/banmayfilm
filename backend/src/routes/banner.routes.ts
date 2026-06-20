import { Router } from 'express';
import { BannerService } from '../services/banner.service.js';
import { StorageService } from '../services/storage.service.js';
import { authMiddleware } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';

const router = Router();

// GET all banners - Public
router.get('/', async (req, res) => {
  try {
    const banners = await BannerService.getAll();
    return res.json(banners);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

// POST create banner - Admin
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng tải lên một hình ảnh.' });
    }

    const displayOrder = req.body.display_order ? parseInt(req.body.display_order) : 0;
    
    // Upload image to Supabase
    const imageUrl = await StorageService.uploadFile('banners', req.file);
    
    // Create database entry
    const banner = await BannerService.create(imageUrl, displayOrder);
    return res.status(201).json(banner);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

// PUT update banner - Admin
router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const id = req.params.id as string;
    const updates: { image_url?: string; display_order?: number } = {};

    if (req.body.display_order !== undefined) {
      updates.display_order = parseInt(req.body.display_order);
    }

    if (req.file) {
      // Upload new image
      updates.image_url = await StorageService.uploadFile('banners', req.file);
    }

    const banner = await BannerService.update(id, updates);
    return res.json(banner);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

// DELETE banner - Admin
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const id = req.params.id as string;
    await BannerService.delete(id);
    return res.json({ message: 'Xóa banner thành công.' });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

export default router;
