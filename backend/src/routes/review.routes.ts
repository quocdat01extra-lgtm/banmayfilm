import { Router } from 'express';
import { ReviewService } from '../services/review.service.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

// GET all reviews for a product (and average stats) - Public
router.get('/:productId', async (req, res) => {
  try {
    const productId = req.params.productId;
    const reviews = await ReviewService.getByProductId(productId);
    const stats = await ReviewService.getAverageByProductId(productId);
    
    return res.json({
      reviews,
      stats
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

// POST a new review - Public
router.post('/:productId', async (req, res) => {
  try {
    const productId = req.params.productId;
    const { phone, rating, content } = req.body;

    if (!phone || !rating || !content) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin (phone, rating, content).' });
    }

    if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Đánh giá phải từ 1 đến 5 sao.' });
    }

    const review = await ReviewService.create({
      product_id: productId,
      phone,
      rating: parseInt(rating),
      content
    });

    return res.status(201).json(review);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

// DELETE a review - Admin
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    await ReviewService.delete(id);
    return res.json({ message: 'Xóa đánh giá thành công.' });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

export default router;
