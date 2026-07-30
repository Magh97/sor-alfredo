import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../error-handler.js';
import { AppError } from '../../errors.js';

function makeRes() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
}

const makeReq = () => ({}) as Request;
const makeNext = () => vi.fn() as NextFunction;

describe('errorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should return statusCode and JSON body for AppError', () => {
    const err = new AppError('FORBIDDEN', 'Acceso denegado', 403);
    const req = makeReq();
    const res = makeRes();
    const next = makeNext();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'FORBIDDEN',
        message: 'Acceso denegado',
        details: undefined,
      },
    });
  });

  it('should return AppError with details in JSON body', () => {
    const details = [{ field: 'email', reason: 'Ya existe' }];
    const err = new AppError('CONFLICT', 'Duplicado', 409, details);
    const req = makeReq();
    const res = makeRes();
    const next = makeNext();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'CONFLICT',
        message: 'Duplicado',
        details,
      },
    });
  });

  it('should return 500 with INTERNAL_ERROR for generic Error', () => {
    const err = new Error('Algo explotó');
    const req = makeReq();
    const res = makeRes();
    const next = makeNext();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error inesperado del servidor',
      },
    });
  });

  it('should not expose stack traces', () => {
    const err = new Error('Error con stack');
    err.stack = 'Error: Error con stack\n    at Object.<anonymous> (file.ts:1:1)';
    const req = makeReq();
    const res = makeRes();
    const next = makeNext();

    errorHandler(err, req, res, next);

    const jsonArg = (res.json as ReturnType<typeof vi.fn>).mock.calls[0]?.[0];
    expect(jsonArg).toBeDefined();
    expect(jsonArg).not.toHaveProperty('stack');
    expect(jsonArg).not.toHaveProperty('error.stack');
    expect(JSON.stringify(jsonArg)).not.toContain('stack');
  });

  it('should log generic errors to console.error', () => {
    const err = new Error('Error inesperado');
    const req = makeReq();
    const res = makeRes();
    const next = makeNext();

    errorHandler(err, req, res, next);

    expect(console.error).toHaveBeenCalledWith('Unhandled error:', err);
  });
});
