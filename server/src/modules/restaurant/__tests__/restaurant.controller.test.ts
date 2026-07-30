import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../../app.js';

const { jwtVerifyMock } = vi.hoisted(() => ({
  jwtVerifyMock: vi.fn(),
}));

vi.mock('jsonwebtoken', () => ({
  default: { verify: jwtVerifyMock },
}));

const mockFindFirst = vi.fn();
const mockUpdate = vi.fn().mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockReturnValue({ returning: vi.fn() }) }) });

vi.mock('../../../db/index.js', () => ({
  db: {
    query: {
      restaurants: { findFirst: (...args: unknown[]) => mockFindFirst(...args) },
    },
    update: () => mockUpdate(),
  },
  schema: {
    restaurants: { id: 'id', name: 'name', address: 'address', phone: 'phone', createdAt: 'createdAt' },
  },
}));

const adminPayload = { userId: 1, role: 'admin', restaurantId: 1 };
const waiterPayload = { userId: 2, role: 'waiter', restaurantId: 1 };

describe('Restaurant Controller', () => {
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

  describe('GET /api/restaurant', () => {
    it('should return restaurant info for admin', async () => {
      jwtVerifyMock.mockReturnValue(adminPayload);
      mockFindFirst.mockResolvedValue({ id: 1, name: 'Alfredo', address: 'Calle 1', phone: '555', createdAt: '2024-01-01' });

      const res = await request(app)
        .get('/api/restaurant')
        .set('Authorization', 'Bearer admin-token');

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Alfredo');
    });

    it('should return 403 for waiter', async () => {
      jwtVerifyMock.mockReturnValue(waiterPayload);

      const res = await request(app)
        .get('/api/restaurant')
        .set('Authorization', 'Bearer waiter-token');

      expect(res.status).toBe(403);
    });

    it('should return 404 when restaurant not found', async () => {
      jwtVerifyMock.mockReturnValue(adminPayload);
      mockFindFirst.mockResolvedValue(null);

      const res = await request(app)
        .get('/api/restaurant')
        .set('Authorization', 'Bearer admin-token');

      expect(res.status).toBe(404);
    });
  });
});
