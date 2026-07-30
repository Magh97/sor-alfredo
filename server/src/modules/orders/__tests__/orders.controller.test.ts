import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../../app.js';

const { jwtVerifyMock } = vi.hoisted(() => ({
  jwtVerifyMock: vi.fn(),
}));

vi.mock('jsonwebtoken', () => ({
  default: { verify: jwtVerifyMock },
}));

vi.mock('../../../index.js', () => ({
  io: {
    to: vi.fn().mockReturnValue({ emit: vi.fn() }),
  },
}));

vi.mock('../orders.service.js', () => ({
  OrdersService: {
    list: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    addItems: vi.fn(),
    sendToKitchen: vi.fn(),
    cancelItem: vi.fn(),
    generateInvoice: vi.fn(),
  },
}));

const { OrdersService } = await import('../orders.service.js');

const waiterPayload = { userId: 2, role: 'waiter', restaurantId: 1 };

describe('Orders Controller', () => {
  beforeAll(() => {
    vi.stubEnv('JWT_SECRET', 'test-secret');
    vi.stubEnv('JWT_REFRESH_SECRET', 'test-refresh-secret');
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/orders', () => {
    it('should return 401 without auth', async () => {
      const res = await request(app).get('/api/orders');

      expect(res.status).toBe(401);
    });

    it('should return paginated orders', async () => {
      jwtVerifyMock.mockReturnValue(waiterPayload);
      vi.mocked(OrdersService.list).mockResolvedValue({ data: [], total: 0, page: 1, pageSize: 20 } as never);

      const res = await request(app)
        .get('/api/orders?userId=2')
        .set('Authorization', 'Bearer waiter-token');

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
      expect(res.body.total).toBe(0);
    });
  });

  describe('POST /api/orders', () => {
    it('should create order for waiter role', async () => {
      jwtVerifyMock.mockReturnValue(waiterPayload);
      vi.mocked(OrdersService.create).mockResolvedValue({ id: 1, status: 'draft', totalAmount: '100' } as never);

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', 'Bearer waiter-token')
        .send({
          tableId: 1,
          items: [{ productId: 1, quantity: 1, modifierIds: [] }],
        });

      expect(res.status).toBe(201);
      expect(res.body.data.id).toBe(1);
      expect(res.body.data.status).toBe('draft');
    });

    it('should return 500 when items empty', async () => {
      jwtVerifyMock.mockReturnValue(waiterPayload);

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', 'Bearer waiter-token')
        .send({ tableId: 1, items: [] });

      expect(res.status).toBe(500);
    });
  });

  describe('POST /api/orders/:id/send-to-kitchen', () => {
    it('should send order to kitchen', async () => {
      jwtVerifyMock.mockReturnValue(waiterPayload);
      vi.mocked(OrdersService.sendToKitchen).mockResolvedValue({ id: 1, status: 'in_kitchen' } as never);

      const res = await request(app)
        .post('/api/orders/1/send-to-kitchen')
        .set('Authorization', 'Bearer waiter-token');

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('in_kitchen');
    });
  });

  describe('DELETE /api/orders/:id/items/:itemId', () => {
    it('should cancel order item', async () => {
      jwtVerifyMock.mockReturnValue(waiterPayload);
      vi.mocked(OrdersService.cancelItem).mockResolvedValue({ totalAmount: '50' } as never);

      const res = await request(app)
        .delete('/api/orders/1/items/5')
        .set('Authorization', 'Bearer waiter-token');

      expect(res.status).toBe(200);
    });
  });
});
