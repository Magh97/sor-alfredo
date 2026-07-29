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

vi.mock('../users.service.js', () => ({
  UsersService: {
    create: vi.fn(),
    update: vi.fn(),
    deactivate: vi.fn(),
  },
}));

vi.mock('../users.repository.js', () => ({
  UsersRepository: {
    findAll: vi.fn(),
    findById: vi.fn(),
    findByEmail: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
  },
}));

const { UsersService } = await import('../users.service.js');
const { UsersRepository } = await import('../users.repository.js');

const adminPayload = { userId: 1, role: 'admin', restaurantId: 1 };
const waiterPayload = { userId: 2, role: 'waiter', restaurantId: 1 };

function authHeader(token: string): string {
  return `Bearer ${token}`;
}

describe('Users Controller', () => {
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

  describe('GET /api/users', () => {
    it('should return 401 without auth token', async () => {
      const res = await request(app).get('/api/users');

      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });

    it('should return 403 for waiter role (use auth token for waiter)', async () => {
      jwtVerifyMock.mockReturnValue(waiterPayload);

      const res = await request(app)
        .get('/api/users')
        .set('Authorization', authHeader('waiter-token'));

      expect(res.status).toBe(403);
      expect(res.body.error).toBeDefined();
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('should return 200 with users array for admin role (use admin token, expect data array)', async () => {
      jwtVerifyMock.mockReturnValue(adminPayload);

      const mockUsers = [
        { id: 1, restaurantId: 1, name: 'Admin', email: 'admin@test.com', role: 'admin', isActive: true, createdAt: '2024-01-01T00:00:00.000Z' },
        { id: 2, restaurantId: 1, name: 'Waiter', email: 'waiter@test.com', role: 'waiter', isActive: true, createdAt: '2024-01-01T00:00:00.000Z' },
      ];

      vi.mocked(UsersRepository.findAll).mockResolvedValue(mockUsers as never);

      const res = await request(app)
        .get('/api/users')
        .set('Authorization', authHeader('admin-token'));

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.data).toEqual(mockUsers);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data).toHaveLength(2);
    });
  });

  describe('POST /api/users', () => {
    it('should create user with 201', async () => {
      jwtVerifyMock.mockReturnValue(adminPayload);

      const createdUser = {
        id: 3,
        restaurantId: 1,
        name: 'Nuevo Usuario',
        email: 'nuevo@test.com',
        role: 'waiter',
        isActive: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        passwordHash: 'hashed',
      };

      vi.mocked(UsersService.create).mockResolvedValue(createdUser as never);

      const res = await request(app)
        .post('/api/users')
        .set('Authorization', authHeader('admin-token'))
        .send({
          name: 'Nuevo Usuario',
          email: 'nuevo@test.com',
          password: 'secret123',
          role: 'waiter',
        });

      expect(res.status).toBe(201);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.name).toBe('Nuevo Usuario');
      expect(res.body.data.email).toBe('nuevo@test.com');
      expect(UsersService.create).toHaveBeenCalledWith(1, {
        name: 'Nuevo Usuario',
        email: 'nuevo@test.com',
        password: 'secret123',
        role: 'waiter',
      });
    });

    it('should return 409 on duplicate email', async () => {
      jwtVerifyMock.mockReturnValue(adminPayload);

      vi.mocked(UsersService.create).mockRejectedValue(
        new AppError('CONFLICT', 'Ya existe un usuario con ese email', 409),
      );

      const res = await request(app)
        .post('/api/users')
        .set('Authorization', authHeader('admin-token'))
        .send({
          name: 'Duplicado',
          email: 'existente@test.com',
          password: 'secret123',
          role: 'waiter',
        });

      expect(res.status).toBe(409);
      expect(res.body.error).toBeDefined();
      expect(res.body.error.code).toBe('CONFLICT');
      expect(res.body.error.message).toBe('Ya existe un usuario con ese email');
    });

    it('should return 500 when validation fails (ZodError passes through error handler)', async () => {
      jwtVerifyMock.mockReturnValue(adminPayload);

      const res = await request(app)
        .post('/api/users')
        .set('Authorization', authHeader('admin-token'))
        .send({
          email: 'notario@test.com',
          password: 'secret123',
          role: 'waiter',
        });

      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
