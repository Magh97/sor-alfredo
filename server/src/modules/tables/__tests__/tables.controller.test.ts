import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../../app.js';
import { AppError } from '../../../shared/errors.js';

const { jwtVerifyMock } = vi.hoisted(() => ({
  jwtVerifyMock: vi.fn(),
}));

vi.mock('jsonwebtoken', () => ({
  default: { verify: jwtVerifyMock },
}));

vi.mock('../tables.service.js', () => ({
  TablesService: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    changeStatus: vi.fn(),
  },
}));

const { TablesService } = await import('../tables.service.js');

const adminPayload = { userId: 1, role: 'admin', restaurantId: 1 };
const waiterPayload = { userId: 2, role: 'waiter', restaurantId: 1 };

describe('Tables Controller', () => {
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

  describe('GET /api/tables', () => {
    it('should return 401 without auth token', async () => {
      const res = await request(app).get('/api/tables');

      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });

    it('should return 200 with tables array', async () => {
      jwtVerifyMock.mockReturnValue(waiterPayload);
      const mockTables = [{ id: 1, number: 1, status: 'free' }, { id: 2, number: 2, status: 'occupied' }];
      vi.mocked(TablesService.list).mockResolvedValue(mockTables as never);

      const res = await request(app)
        .get('/api/tables')
        .set('Authorization', 'Bearer waiter-token');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
    });
  });

  describe('POST /api/tables', () => {
    it('should return 403 for waiter', async () => {
      jwtVerifyMock.mockReturnValue(waiterPayload);

      const res = await request(app)
        .post('/api/tables')
        .set('Authorization', 'Bearer waiter-token')
        .send({ number: 99, capacity: 4 });

      expect(res.status).toBe(403);
    });

    it('should create table with 201 for admin', async () => {
      jwtVerifyMock.mockReturnValue(adminPayload);
      vi.mocked(TablesService.create).mockResolvedValue({ id: 1, number: 99 } as never);

      const res = await request(app)
        .post('/api/tables')
        .set('Authorization', 'Bearer admin-token')
        .send({ number: 99, capacity: 4 });

      expect(res.status).toBe(201);
      expect(res.body.data.number).toBe(99);
    });
  });

  describe('PUT /api/tables/:id/status', () => {
    it('should change table status', async () => {
      jwtVerifyMock.mockReturnValue(waiterPayload);
      vi.mocked(TablesService.changeStatus).mockResolvedValue({ id: 1, status: 'occupied' } as never);

      const res = await request(app)
        .put('/api/tables/1/status')
        .set('Authorization', 'Bearer waiter-token')
        .send({ status: 'occupied' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('occupied');
    });
  });
});
