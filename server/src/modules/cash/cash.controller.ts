import { Router } from 'express';
import { requireAuth, requireRole } from '../../shared/middleware/auth.js';
import { AppError } from '../../shared/errors.js';
import { CashService } from './cash.service.js';
import { OpenRegisterSchema, PaymentSchema } from './cash.schema.js';

const router = Router();

function cashierOrAdmin(roles: string[]) {
  return roles.includes('cashier') || roles.includes('admin') || roles.includes('superadmin');
}

router.post('/cash-register/open', requireAuth, async (req, res, next) => {
  try {
    if (!cashierOrAdmin([req.user!.role])) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Acceso denegado' } });
    }
    const input = OpenRegisterSchema.parse(req.body);
    const register = await CashService.openRegister(req.user!.restaurantId, req.user!.id, input);
    res.status(201).json({ data: register });
  } catch (err) {
    if (err instanceof AppError) return res.status(err.statusCode).json({ error: err.toJSON() });
    next(err);
  }
});

router.post('/cash-register/close', requireAuth, async (req, res, next) => {
  try {
    if (!cashierOrAdmin([req.user!.role])) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Acceso denegado' } });
    }
    const register = await CashService.closeRegister(req.user!.restaurantId);
    res.json({ data: register });
  } catch (err) {
    if (err instanceof AppError) return res.status(err.statusCode).json({ error: err.toJSON() });
    next(err);
  }
});

router.get('/cash-register/current', requireAuth, async (req, res, next) => {
  try {
    const register = await CashService.getCurrentRegister(req.user!.restaurantId);
    res.json({ data: register });
  } catch (err) {
    if (err instanceof AppError) return res.status(err.statusCode).json({ error: err.toJSON() });
    next(err);
  }
});

router.get('/cash-register/history', requireAuth, requireRole('admin', 'superadmin'), async (req, res, next) => {
  try {
    const history = await CashService.getRegisterHistory(req.user!.restaurantId);
    res.json({ data: history });
  } catch (err) { next(err); }
});

router.post('/orders/:orderId/payment', requireAuth, async (req, res, next) => {
  try {
    if (!cashierOrAdmin([req.user!.role])) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Acceso denegado' } });
    }
    const orderId = parseInt(req.params.orderId!, 10);
    const input = PaymentSchema.parse(req.body);
    const payment = await CashService.registerPayment(orderId, req.user!.restaurantId, req.user!.id, input);
    res.status(201).json({ data: payment });
  } catch (err) {
    if (err instanceof AppError) return res.status(err.statusCode).json({ error: err.toJSON() });
    next(err);
  }
});

router.get('/cash-register/tips', requireAuth, requireRole('admin', 'superadmin'), async (req, res, next) => {
  try {
    const tips = await CashService.getTips(req.user!.restaurantId);
    res.json({ data: tips });
  } catch (err) { next(err); }
});

export const cashRouter = router;
