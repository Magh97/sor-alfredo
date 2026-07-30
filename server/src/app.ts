import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './shared/middleware/error-handler.js';
import { authRouter } from './modules/auth/auth.controller.js';
import { usersRouter } from './modules/users/users.controller.js';
import { restaurantRouter } from './modules/restaurant/restaurant.controller.js';
import { catalogRouter } from './modules/catalog/catalog.controller.js';
import { tablesRouter } from './modules/tables/tables.controller.js';
import { ordersRouter } from './modules/orders/orders.controller.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/restaurant', restaurantRouter);
app.use('/api/catalog', catalogRouter);
app.use('/api/tables', tablesRouter);
app.use('/api/orders', ordersRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

app.use(errorHandler);

export { app };
