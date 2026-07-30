import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../../app.js';

const { jwtVerifyMock } = vi.hoisted(() => ({ jwtVerifyMock: vi.fn() }));

vi.mock('jsonwebtoken', () => ({ default: { verify: jwtVerifyMock } }));

vi.mock('../cash.service.js', () => ({
  CashService: {
    openRegister: vi.fn(),
    closeRegister: vi.fn(),
    getCurrentRegister: vi.fn(),
    getRegisterHistory: vi.fn(),
    registerPayment: vi.fn(),
    getTips: vi.fn(),
  },
}));

const { CashService } = await import('../cash.service.js');

const cashierPayload = { userId: 3, role: 'cashier', restaurantId: 1 };
const waiterPayload = { userId: 2, role: 'waiter', restaurantId: 1 };

describe('Cash Controller', () => {
  beforeAll(() => {
    vi.stubEnv('JWT_SECRET', 'test');
    vi.stubEnv('JWT_REFRESH_SECRET', 'test-r');
  });

  afterAll(() => vi.unstubAllEnvs());

  beforeEach(() => vi.clearAllMocks());

  describe('POST /api/cash-register/open', () => {
    it('should open register for cashier', async () => {
      jwtVerifyMock.mockReturnValue(cashierPayload);
      vi.mocked(CashService.openRegister).mockResolvedValue({ id: 1 } as never);

      const res = await request(app).post('/api/cash-register/open')
        .set('Authorization', 'Bearer cashier-token').send({ initialAmount: '500' });

      expect(res.status).toBe(201);
    });

    it('should return 403 for waiter', async () => {
      jwtVerifyMock.mockReturnValue(waiterPayload);

      const res = await request(app).post('/api/cash-register/open')
        .set('Authorization', 'Bearer waiter-token').send({ initialAmount: '500' });

      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/cash-register/close', () => {
    it('should close register', async () => {
      jwtVerifyMock.mockReturnValue(cashierPayload);
      vi.mocked(CashService.closeRegister).mockResolvedValue({ id: 1, totalSales: '100' } as never);

      const res = await request(app).post('/api/cash-register/close')
        .set('Authorization', 'Bearer cashier-token');

      expect(res.status).toBe(200);
      expect(res.body.data.totalSales).toBe('100');
    });
  });

  describe('POST /api/orders/:id/payment', () => {
    it('should register payment', async () => {
      jwtVerifyMock.mockReturnValue(cashierPayload);
      vi.mocked(CashService.registerPayment).mockResolvedValue({ id: 1 } as never);

      const res = await request(app).post('/api/orders/1/payment')
        .set('Authorization', 'Bearer cashier-token')
        .send({ amount: '100', paymentMethod: 'cash', tipAmount: '10' });

      expect(res.status).toBe(201);
    });
  });
});
