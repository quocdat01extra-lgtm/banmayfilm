import { Router } from 'express';
import { ProductService } from '../services/product.service.js';
import { StorageService } from '../services/storage.service.js';
import { authMiddleware } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';

const router = Router();

// GET all products - Public
router.get('/', async (req, res) => {
  try {
    const categoryId = req.query.category_id as string | undefined;
    const products = await ProductService.getAll(categoryId);
    return res.json(products);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

// GET single product - Public
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id as string;
    const product = await ProductService.getById(id);
    return res.json(product);
  } catch (err: any) {
    return res.status(404).json({ message: err.message });
  }
});

// POST create product - Admin
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, category_id, specifications, price, quantity, is_active, allow_preorder, color_variants } = req.body;
    
    if (!name || !category_id || price === undefined || quantity === undefined) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin bắt buộc.' });
    }

    const product = await ProductService.create({
      name,
      category_id,
      specifications: specifications || '',
      price: parseInt(price),
      quantity: parseInt(quantity),
      is_active: is_active !== undefined ? is_active : true,
      allow_preorder: allow_preorder !== undefined ? allow_preorder : false,
      color_variants: color_variants
    });
    
    return res.status(201).json(product);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

// PUT update product - Admin
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const id = req.params.id as string;
    const updates = { ...req.body };

    if (updates.price !== undefined) updates.price = parseInt(updates.price);
    if (updates.quantity !== undefined) updates.quantity = parseInt(updates.quantity);

    const product = await ProductService.update(id, updates);
    return res.json(product);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

// DELETE product - Admin
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const id = req.params.id as string;
    await ProductService.delete(id);
    return res.json({ message: 'Xóa sản phẩm thành công.' });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

// POST upload product media - Admin
router.post('/:id/media', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const id = req.params.id as string;
    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng tải lên một tập tin.' });
    }

    const displayOrder = req.body.display_order ? parseInt(req.body.display_order) : 0;
    
    // Determine media type (image or video)
    const mediaType = req.file.mimetype.startsWith('video') ? 'video' : 'image';

    // Upload to Supabase Storage
    const mediaUrl = await StorageService.uploadFile('products', req.file);

    // Save to database
    const media = await ProductService.addMedia(id, mediaUrl, mediaType, displayOrder);
    
    return res.status(201).json(media);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

// DELETE product media - Admin
router.delete('/:id/media/:mediaId', authMiddleware, async (req, res) => {
  try {
    const mediaId = req.params.mediaId as string;
    await ProductService.deleteMedia(mediaId);
    return res.json({ message: 'Xóa ảnh/video sản phẩm thành công.' });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

export default router;
