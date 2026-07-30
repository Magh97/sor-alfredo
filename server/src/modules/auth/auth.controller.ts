import { Router } from 'express';
import { LoginSchema, RefreshSchema } from './auth.schema.js';
import { AuthService } from './auth.service.js';
import { AppError } from '../../shared/errors.js';

const router = Router();

router.post('/login', async (req, res, next) => {
  try {
    const input = LoginSchema.parse(req.body);
    const result = await AuthService.login(input);
    res.json({ data: result });
  } catch (err) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ error: err.toJSON() });
    }
    next(err);
  }
});

router.post('/refresh', (req, res, next) => {
  try {
    const { refreshToken } = RefreshSchema.parse(req.body);
    const result = AuthService.refresh(refreshToken);
    res.json({ data: result });
  } catch (err) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ error: err.toJSON() });
    }
    next(err);
  }
});

export const authRouter = router;
