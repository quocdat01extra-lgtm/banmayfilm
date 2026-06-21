import { Router } from 'express';
import { PreorderService } from '../services/preorder.service.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

// POST submit new order - Public
router.post('/', async (req, res) => {
  try {
    const {
      customer_name,
      phone,
      city,
      delivery_method,
      address,
      pickup_datetime,
      payment_method,
      note,
      items,
      total_price
    } = req.body;

    if (!customer_name || !phone || !city || !delivery_method || !payment_method || !items || !items.length || total_price === undefined) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin đặt hàng.' });
    }

    const order = await PreorderService.create({
      customer_name,
      phone,
      city,
      delivery_method,
      address,
      pickup_datetime,
      payment_method,
      note,
      items,
      total_price: parseInt(total_price)
    });

    return res.status(201).json(order);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
});

// GET all orders - Admin
router.get('/', authMiddleware, async (req, res) => {
  try {
    const orders = await PreorderService.getAll();
    return res.json(orders);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

// GET single order - Admin
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const id = req.params.id as string;
    const order = await PreorderService.getById(id);
    return res.json(order);
  } catch (err: any) {
    return res.status(404).json({ message: err.message });
  }
});

// PUT update order - Admin
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const id = req.params.id as string;
    const updates = { ...req.body };

    if (updates.total_price !== undefined) {
      updates.total_price = parseInt(updates.total_price);
    }

    const order = await PreorderService.update(id, updates);
    return res.json(order);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

export default router;
