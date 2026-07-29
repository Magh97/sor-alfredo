import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { requireAuth, requireRole } from '../auth.js';

const { mockVerify } = vi.hoisted(() => ({
  mockVerify: vi.fn(),
}));

vi.mock('jsonwebtoken', () => ({
  default: { verify: mockVerify },
}));

function makeReq(overrides: Partial<Request> = {}): Request {
  return {
    headers: {},
    user: undefined,
    ...overrides,
  } as unknown as Request;
}

const makeRes = () => ({}) as Response;
const makeNext = () => vi.fn() as NextFunction;

describe('requireAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should throw UNAUTHORIZED when no Authorization header', () => {
    const req = makeReq();
    const res = makeRes();
    const next = makeNext();

    expect(() => requireAuth(req, res, next)).toThrow('Token requerido');
  });

  it('should throw UNAUTHORIZED when Authorization header is not Bearer', () => {
    const req = makeReq({ headers: { authorization: 'Basic abc123' } });
    const res = makeRes();
    const next = makeNext();

    expect(() => requireAuth(req, res, next)).toThrow('Token requerido');
  });

  it('should throw UNAUTHORIZED when token is invalid/expired', () => {
    const req = makeReq({ headers: { authorization: 'Bearer bad-token' } });
    const res = makeRes();
    const next = makeNext();

    mockVerify.mockImplementation(() => {
      throw new Error('jwt expired');
    });

    expect(() => requireAuth(req, res, next)).toThrow('Token inválido o expirado');
  });

  it('should set req.user when token is valid (mock jwt.verify)', () => {
    const req = makeReq({ headers: { authorization: 'Bearer valid-token' } });
    const res = makeRes();
    const next = makeNext();

    mockVerify.mockReturnValue({
      userId: 42,
      role: 'admin',
      restaurantId: 1,
    });

    requireAuth(req, res, next);

    expect(req.user).toEqual({
      id: 42,
      role: 'admin',
      restaurantId: 1,
    });
    expect(next).toHaveBeenCalled();
  });
});

describe('requireRole', () => {
  it('should throw FORBIDDEN when role doesn\'t match', () => {
    const middleware = requireRole('admin', 'superadmin');
    const req = makeReq({
      user: { id: 1, role: 'waiter', restaurantId: 1 },
    });
    const res = makeRes();
    const next = makeNext();

    expect(() => middleware(req, res, next)).toThrow('Requiere rol: admin | superadmin');
  });

  it('should throw FORBIDDEN when req.user is undefined', () => {
    const middleware = requireRole('admin');
    const req = makeReq({ user: undefined });
    const res = makeRes();
    const next = makeNext();

    expect(() => middleware(req, res, next)).toThrow('Requiere rol: admin');
  });

  it('should call next() when role matches', () => {
    const middleware = requireRole('admin', 'superadmin');
    const req = makeReq({
      user: { id: 1, role: 'admin', restaurantId: 1 },
    });
    const res = makeRes();
    const next = makeNext();

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should call next() when using a single allowed role', () => {
    const middleware = requireRole('waiter');
    const req = makeReq({
      user: { id: 2, role: 'waiter', restaurantId: 1 },
    });
    const res = makeRes();
    const next = makeNext();

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
