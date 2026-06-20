import { Router } from 'express';
import { ReportService } from '../services/report.service.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

router.get('/revenue', authMiddleware, async (req, res) => {
  try {
    const yearStr = req.query.year as string | undefined;
    const year = yearStr ? parseInt(yearStr) : new Date().getFullYear();

    if (isNaN(year)) {
      return res.status(400).json({ message: 'Năm không hợp lệ.' });
    }

    const report = await ReportService.getRevenueByYear(year);
    return res.json(report);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

export default router;
