import { Router } from 'express';
import { requireAuth, requireRole } from '../../shared/middleware/auth.js';
import { ReportsService } from './reports.service.js';

const router = Router();

router.get('/sales', requireAuth, requireRole('admin', 'superadmin'), async (req, res, next) => {
  try {
    const from = (req.query.from as string) ?? new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    const to = (req.query.to as string) ?? new Date().toISOString().split('T')[0];
    const groupBy = (req.query.groupBy as string) === 'week' ? 'week' : (req.query.groupBy as string) === 'month' ? 'month' : 'day';

    const sales = await ReportsService.salesByPeriod(req.user!.restaurantId, from, to, groupBy);
    res.json({ data: sales });
  } catch (err) { next(err); }
});

router.get('/top-products', requireAuth, requireRole('admin', 'superadmin'), async (req, res, next) => {
  try {
    const from = (req.query.from as string) ?? new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    const to = (req.query.to as string) ?? new Date().toISOString().split('T')[0];
    const limit = parseInt((req.query.limit as string) ?? '10', 10);

    const products = await ReportsService.topProducts(req.user!.restaurantId, from, to, limit);
    res.json({ data: products });
  } catch (err) { next(err); }
});

router.get('/orders-by-user', requireAuth, requireRole('admin', 'superadmin'), async (req, res, next) => {
  try {
    const from = (req.query.from as string) ?? new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    const to = (req.query.to as string) ?? new Date().toISOString().split('T')[0];

    const orders = await ReportsService.ordersByUser(req.user!.restaurantId, from, to);
    res.json({ data: orders });
  } catch (err) { next(err); }
});

router.get('/cash-history', requireAuth, requireRole('admin', 'superadmin'), async (req, res, next) => {
  try {
    const history = await ReportsService.cashHistory(req.user!.restaurantId);
    res.json({ data: history });
  } catch (err) { next(err); }
});

export const reportsRouter = router;
