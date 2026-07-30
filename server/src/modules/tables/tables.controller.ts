import { Router } from 'express';
import { requireAuth, requireRole } from '../../shared/middleware/auth.js';
import { AppError } from '../../shared/errors.js';
import { TablesService } from './tables.service.js';
import { CreateTableSchema, UpdateTableSchema, ChangeStatusSchema } from './tables.schema.js';

const router = Router();

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const tables = await TablesService.list(req.user!.restaurantId);
    res.json({ data: tables });
  } catch (err) { next(err); }
});

router.post('/', requireAuth, requireRole('admin', 'superadmin'), async (req, res, next) => {
  try {
    const input = CreateTableSchema.parse(req.body);
    const table = await TablesService.create(req.user!.restaurantId, input);
    res.status(201).json({ data: table });
  } catch (err) {
    if (err instanceof AppError) return res.status(err.statusCode).json({ error: err.toJSON() });
    next(err);
  }
});

router.put('/:id', requireAuth, requireRole('admin', 'superadmin'), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id!, 10);
    const input = UpdateTableSchema.parse(req.body);
    const table = await TablesService.update(id, req.user!.restaurantId, input);
    res.json({ data: table });
  } catch (err) {
    if (err instanceof AppError) return res.status(err.statusCode).json({ error: err.toJSON() });
    next(err);
  }
});

router.put('/:id/status', requireAuth, async (req, res, next) => {
  try {
    const id = parseInt(req.params.id!, 10);
    const { status } = ChangeStatusSchema.parse(req.body);
    const table = await TablesService.changeStatus(id, req.user!.restaurantId, status);
    res.json({ data: table });
  } catch (err) {
    if (err instanceof AppError) return res.status(err.statusCode).json({ error: err.toJSON() });
    next(err);
  }
});

export const tablesRouter = router;
