import { Router, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { authMiddleware, AuthenticatedRequest } from '../middlewares/auth.js';

const router = Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === env.ADMIN_USERNAME && password === env.ADMIN_PASSWORD) {
    const token = jwt.sign(
      { username: env.ADMIN_USERNAME, role: 'admin' },
      env.JWT_SECRET,
      { expiresIn: '30d' } // Session valid for 30 days
    );
    return res.json({ token, username: env.ADMIN_USERNAME });
  }

  return res.status(401).json({ message: 'Tên tài khoản hoặc mật khẩu không chính xác.' });
});

router.get('/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  return res.json({ user: req.user });
});

export default router;
