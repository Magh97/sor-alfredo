import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { db, schema } from '../../db/index.js';
import { requireAuth, requireRole } from '../../shared/middleware/auth.js';
import { AppError } from '../../shared/errors.js';
import { UpdateRestaurantSchema } from './restaurant.schema.js';

const router = Router();

router.get('/', requireAuth, requireRole('admin', 'superadmin'), async (req, res, next) => {
  try {
    const restaurant = await db.query.restaurants.findFirst({
      where: eq(schema.restaurants.id, req.user!.restaurantId),
      columns: { id: true, name: true, address: true, phone: true, createdAt: true },
    });

    if (!restaurant) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Restaurante no encontrado' } });
    }

    res.json({ data: restaurant });
  } catch (err) {
    next(err);
  }
});

router.put('/', requireAuth, requireRole('admin', 'superadmin'), async (req, res, next) => {
  try {
    const input = UpdateRestaurantSchema.parse(req.body);

    const [restaurant] = await db.update(schema.restaurants)
      .set(input)
      .where(eq(schema.restaurants.id, req.user!.restaurantId))
      .returning({
        id: schema.restaurants.id,
        name: schema.restaurants.name,
        address: schema.restaurants.address,
        phone: schema.restaurants.phone,
        createdAt: schema.restaurants.createdAt,
      });

    if (!restaurant) {
      throw new AppError('NOT_FOUND', 'Restaurante no encontrado', 404);
    }

    res.json({ data: restaurant });
  } catch (err) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ error: err.toJSON() });
    }
    next(err);
  }
});

export const restaurantRouter = router;
