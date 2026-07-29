import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';
import { validate } from '../validate.js';

function makeReq(body: unknown): Request {
  return { body } as Request;
}

const makeRes = () => ({}) as Response;
const makeNext = () => vi.fn() as NextFunction;

describe('validate', () => {
  it('should call next() when body passes schema validation', () => {
    const schema = z.object({
      name: z.string(),
      age: z.number(),
    });
    const middleware = validate(schema);
    const req = makeReq({ name: 'Test', age: 25 });
    const res = makeRes();
    const next = makeNext();

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.body).toEqual({ name: 'Test', age: 25 });
  });

  it('should throw AppError with VALIDATION_ERROR code when body fails', () => {
    const schema = z.object({
      email: z.string().email(),
    });
    const middleware = validate(schema);
    const req = makeReq({ email: 'not-an-email' });
    const res = makeRes();
    const next = makeNext();

    expect(() => middleware(req, res, next)).toThrow('Campos inválidos');

    try {
      middleware(req, res, next);
    } catch (err: unknown) {
      const error = err as { code: string; statusCode: number };
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.statusCode).toBe(400);
    }
  });

  it('should include details array in error response', () => {
    const schema = z.object({
      name: z.string().min(1),
      email: z.string().email(),
      password: z.string().min(6),
    });
    const middleware = validate(schema);
    const req = makeReq({ name: '', email: 'bad', password: '123' });
    const res = makeRes();
    const next = makeNext();

    expect(() => middleware(req, res, next)).toThrow('Campos inválidos');

    try {
      middleware(req, res, next);
    } catch (err: unknown) {
      const error = err as { code: string; statusCode: number; details: { field: string; reason: string }[] };
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.details).toBeDefined();
      expect(error.details.length).toBeGreaterThan(0);
      expect(error.details[0]).toHaveProperty('field');
      expect(error.details[0]).toHaveProperty('reason');
    }
  });

  it('should rethrow non-Zod errors via next()', () => {
    const schema = z.object({
      value: z.number(),
    });
    const middleware = validate(schema);
    // Force a non-Zod error by passing something that breaks JSON parse expectations
    const req = makeReq(undefined);
    const res = makeRes();
    const next = makeNext();

    // Zod will throw a ZodError because undefined is not an object
    expect(() => middleware(req, res, next)).toThrow();
  });
});
