import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../../app.js';

const { jwtVerifyMock } = vi.hoisted(() => ({ jwtVerifyMock: vi.fn() }));

vi.mock('jsonwebtoken', () => ({ default: { verify: jwtVerifyMock } }));

vi.mock('../reports.service.js', () => ({
  ReportsService: {
    salesByPeriod: vi.fn(),
    topProducts: vi.fn(),
    ordersByUser: vi.fn(),
    cashHistory: vi.fn(),
  },
}));

const { ReportsService } = await import('../reports.service.js');

const adminPayload = { userId: 1, role: 'admin', restaurantId: 1 };
const waiterPayload = { userId: 2, role: 'waiter', restaurantId: 1 };

describe('Reports Controller', () => {
  beforeAll(() => {
    vi.stubEnv('JWT_SECRET', 'test');
    vi.stubEnv('JWT_REFRESH_SECRET', 'test-r');
  });
  afterAll(() => vi.unstubAllEnvs());
  beforeEach(() => vi.clearAllMocks());

  describe('GET /api/reports/sales', () => {
    it('should return 403 for waiter', async () => {
      jwtVerifyMock.mockReturnValue(waiterPayload);
      const res = await request(app).get('/api/reports/sales').set('Authorization', 'Bearer waiter-token');
      expect(res.status).toBe(403);
    });

    it('should return sales data for admin', async () => {
      jwtVerifyMock.mockReturnValue(adminPayload);
      vi.mocked(ReportsService.salesByPeriod).mockResolvedValue([{ period: new Date(), totalSales: '100' }] as never);

      const res = await request(app).get('/api/reports/sales?from=2026-01-01&to=2026-01-31&groupBy=day')
        .set('Authorization', 'Bearer admin-token');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /api/reports/top-products', () => {
    it('should return top products for admin', async () => {
      jwtVerifyMock.mockReturnValue(adminPayload);
      vi.mocked(ReportsService.topProducts).mockResolvedValue([{ productId: 1, productName: 'Tacos' }] as never);

      const res = await request(app).get('/api/reports/top-products?limit=5')
        .set('Authorization', 'Bearer admin-token');

      expect(res.status).toBe(200);
      expect(ReportsService.topProducts).toHaveBeenCalledWith(1, expect.any(String), expect.any(String), 5);
    });
  });

  describe('GET /api/reports/orders-by-user', () => {
    it('should return user performance for admin', async () => {
      jwtVerifyMock.mockReturnValue(adminPayload);
      vi.mocked(ReportsService.ordersByUser).mockResolvedValue([{ userId: 2, userName: 'Mesero', orderCount: 5 }] as never);

      const res = await request(app).get('/api/reports/orders-by-user')
        .set('Authorization', 'Bearer admin-token');

      expect(res.status).toBe(200);
      expect(res.body.data[0].userName).toBe('Mesero');
    });
  });

  describe('GET /api/reports/cash-history', () => {
    it('should return cash history for admin', async () => {
      jwtVerifyMock.mockReturnValue(adminPayload);
      vi.mocked(ReportsService.cashHistory).mockResolvedValue([{ id: 1, status: 'closed' }] as never);

      const res = await request(app).get('/api/reports/cash-history')
        .set('Authorization', 'Bearer admin-token');

      expect(res.status).toBe(200);
    });
  });
});
