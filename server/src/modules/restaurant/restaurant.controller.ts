import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { db, schema } from '../../db/index.js';
import { requireAuth, requireRole } from '../../shared/middleware/auth.js';

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

export const restaurantRouter = router;
