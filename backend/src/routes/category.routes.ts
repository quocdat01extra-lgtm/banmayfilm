import { Router } from 'express';
import { CategoryService } from '../services/category.service.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const categories = await CategoryService.getAll();
    return res.json(categories);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

export default router;
