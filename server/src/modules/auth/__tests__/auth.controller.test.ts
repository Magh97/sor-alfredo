import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../../app.js';
import { AppError } from '../../../shared/errors.js';

const { mockLogin, mockRefresh } = vi.hoisted(() => ({
  mockLogin: vi.fn(),
  mockRefresh: vi.fn(),
}));

vi.mock('../auth.service.js', () => ({
  AuthService: {
    login: mockLogin,
    refresh: mockRefresh,
  },
}));

const validUser = {
  id: 1,
  name: 'Administrador',
  email: 'admin@restaurant.com',
  role: 'admin',
  restaurantId: 1,
};

const validLoginResponse = {
  token: 'jwt-token-abc',
  refreshToken: 'refresh-token-xyz',
  user: validUser,
};

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 200 with token, refreshToken, user on valid credentials', async () => {
    mockLogin.mockResolvedValue(validLoginResponse);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@restaurant.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.token).toBe('jwt-token-abc');
    expect(res.body.data.refreshToken).toBe('refresh-token-xyz');
    expect(res.body.data.user).toEqual({
      id: 1,
      name: 'Administrador',
      email: 'admin@restaurant.com',
      role: 'admin',
      restaurantId: 1,
    });
  });

  it('should return 401 on invalid email', async () => {
    mockLogin.mockRejectedValue(
      new AppError('UNAUTHORIZED', 'Credenciales inválidas', 401),
    );

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'noexiste@restaurant.com', password: 'password123' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('should return 401 on incorrect password', async () => {
    mockLogin.mockRejectedValue(
      new AppError('UNAUTHORIZED', 'Credenciales inválidas', 401),
    );

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@restaurant.com', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('should return 500 on invalid request body (missing password) via error handler', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@restaurant.com' });

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('should validate response shape for successful login', async () => {
    mockLogin.mockResolvedValue(validLoginResponse);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@restaurant.com', password: 'password123' });

    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data).toHaveProperty('refreshToken');
    expect(res.body.data).toHaveProperty('user');
    expect(res.body.data.user).toHaveProperty('id');
    expect(res.body.data.user).toHaveProperty('name');
    expect(res.body.data.user).toHaveProperty('email');
    expect(res.body.data.user).toHaveProperty('role');
    expect(res.body.data.user).toHaveProperty('restaurantId');
  });
});

describe('POST /api/auth/refresh', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 200 with new token when refresh token is valid', async () => {
    mockRefresh.mockReturnValue({ token: 'new-jwt-token' });

    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: 'valid-refresh-token' });

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.token).toBe('new-jwt-token');
  });

  it('should return 401 when refresh token is invalid', async () => {
    mockRefresh.mockImplementation(() => {
      throw new AppError('UNAUTHORIZED', 'Refresh token inválido o expirado', 401);
    });

    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: 'bad-refresh-token' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('should return 500 when refreshToken is missing (ZodError via error handler)', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({});

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});
