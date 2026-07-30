import { Router } from 'express';
import { requireAuth, requireRole } from '../../shared/middleware/auth.js';
import { AppError } from '../../shared/errors.js';
import { OrdersService } from './orders.service.js';
import { CreateOrderSchema, AddItemsSchema } from './orders.schema.js';

const router = Router();

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { status, tableId, userId, page, pageSize } = req.query;
    const result = await OrdersService.list(req.user!.restaurantId, {
      status: status as string | undefined,
      tableId: tableId ? parseInt(tableId as string, 10) : undefined,
      userId: userId ? parseInt(userId as string, 10) : undefined,
      page: page ? parseInt(page as string, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize as string, 10) : 20,
    });
    res.json(result);
  } catch (err) { next(err); }
});

router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const id = parseInt(req.params.id!, 10);
    const order = await OrdersService.getById(id, req.user!.restaurantId);
    res.json({ data: order });
  } catch (err) {
    if (err instanceof AppError) return res.status(err.statusCode).json({ error: err.toJSON() });
    next(err);
  }
});

router.post('/', requireAuth, requireRole('waiter'), async (req, res, next) => {
  try {
    const input = CreateOrderSchema.parse(req.body);
    const order = await OrdersService.create(req.user!.restaurantId, req.user!.id, input);
    res.status(201).json({ data: order });
  } catch (err) {
    if (err instanceof AppError) return res.status(err.statusCode).json({ error: err.toJSON() });
    next(err);
  }
});

router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const id = parseInt(req.params.id!, 10);
    const { items } = AddItemsSchema.parse(req.body);
    const order = await OrdersService.addItems(id, req.user!.restaurantId, items);
    res.json({ data: order });
  } catch (err) {
    if (err instanceof AppError) return res.status(err.statusCode).json({ error: err.toJSON() });
    next(err);
  }
});

router.post('/:id/send-to-kitchen', requireAuth, async (req, res, next) => {
  try {
    const id = parseInt(req.params.id!, 10);
    const order = await OrdersService.sendToKitchen(id, req.user!.restaurantId);
    const { io } = await import('../../index.js');
    io.to(String(req.user!.restaurantId)).emit('order:new', order);
    res.json({ data: order });
  } catch (err) {
    if (err instanceof AppError) return res.status(err.statusCode).json({ error: err.toJSON() });
    next(err);
  }
});

router.delete('/:id/items/:itemId', requireAuth, async (req, res, next) => {
  try {
    const orderId = parseInt(req.params.id!, 10);
    const itemId = parseInt(req.params.itemId!, 10);
    const result = await OrdersService.cancelItem(orderId, itemId, req.user!.restaurantId);
    res.json({ data: result });
  } catch (err) {
    if (err instanceof AppError) return res.status(err.statusCode).json({ error: err.toJSON() });
    next(err);
  }
});

router.put('/:id/invoice', requireAuth, async (req, res, next) => {
  try {
    const id = parseInt(req.params.id!, 10);
    const order = await OrdersService.generateInvoice(id, req.user!.restaurantId);
    res.json({ data: order });
  } catch (err) {
    if (err instanceof AppError) return res.status(err.statusCode).json({ error: err.toJSON() });
    next(err);
  }
});

export const ordersRouter = router;
