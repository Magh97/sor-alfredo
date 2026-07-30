import { Router } from 'express';
import { CreateUserSchema, UpdateUserSchema, ChangePasswordSchema } from './users.schema.js';
import { UsersService } from './users.service.js';
import { UsersRepository } from './users.repository.js';
import { requireAuth, requireRole } from '../../shared/middleware/auth.js';
import { AppError } from '../../shared/errors.js';

const router = Router();

router.get('/', requireAuth, requireRole('admin', 'superadmin'), async (req, res, next) => {
  try {
    const { role, isActive } = req.query;
    const users = await UsersRepository.findAll(
      req.user!.restaurantId,
      {
        role: role as string | undefined,
        isActive: isActive === 'false' ? false : isActive === 'true' ? true : undefined,
      },
    );
    res.json({ data: users });
  } catch (err) {
    next(err);
  }
});

router.post('/', requireAuth, requireRole('admin', 'superadmin'), async (req, res, next) => {
  try {
    const input = CreateUserSchema.parse(req.body);
    const user = await UsersService.create(req.user!.restaurantId, input);
    res.status(201).json({ data: user });
  } catch (err) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ error: err.toJSON() });
    }
    next(err);
  }
});

router.put('/:id', requireAuth, requireRole('admin', 'superadmin'), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id!, 10);
    const input = UpdateUserSchema.parse(req.body);
    const user = await UsersService.update(id, req.user!.restaurantId, input);
    res.json({ data: user });
  } catch (err) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ error: err.toJSON() });
    }
    next(err);
  }
});

router.delete('/:id', requireAuth, requireRole('admin', 'superadmin'), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id!, 10);
    const user = await UsersService.deactivate(id, req.user!.restaurantId);
    res.json({ data: user });
  } catch (err) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ error: err.toJSON() });
    }
    next(err);
  }
});

router.put('/me/password', requireAuth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = ChangePasswordSchema.parse(req.body);
    await UsersService.changePassword(req.user!.id, req.user!.restaurantId, currentPassword, newPassword);
    res.status(204).end();
  } catch (err) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ error: err.toJSON() });
    }
    next(err);
  }
});

export const usersRouter = router;
