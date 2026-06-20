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

router.get('/revenue/monthly', authMiddleware, async (req, res) => {
  try {
    const yearStr = req.query.year as string | undefined;
    const monthStr = req.query.month as string | undefined;
    
    const year = yearStr ? parseInt(yearStr) : new Date().getFullYear();
    const month = monthStr ? parseInt(monthStr) : new Date().getMonth() + 1;

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return res.status(400).json({ message: 'Thời gian không hợp lệ.' });
    }

    const detail = await ReportService.getMonthlyDetail(year, month);
    return res.json(detail);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

export default router;
