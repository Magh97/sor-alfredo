import { describe, it, expect } from 'vitest';
import { AppError } from '../errors.js';

describe('AppError', () => {
  it('should create AppError with code, message, and statusCode', () => {
    const error = new AppError('NOT_FOUND', 'Recurso no encontrado', 404);

    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(Error);
    expect(error.code).toBe('NOT_FOUND');
    expect(error.message).toBe('Recurso no encontrado');
    expect(error.statusCode).toBe(404);
    expect(error.name).toBe('AppError');
  });

  it('should include details when provided', () => {
    const details = [
      { field: 'email', reason: 'Email inválido' },
      { field: 'password', reason: 'Contraseña requerida' },
    ];
    const error = new AppError('VALIDATION_ERROR', 'Campos inválidos', 400, details);

    expect(error.details).toEqual(details);
    expect(error.details).toHaveLength(2);
  });

  it('should return correct JSON via toJSON()', () => {
    const error = new AppError('UNAUTHORIZED', 'Token requerido', 401);

    const json = error.toJSON();

    expect(json).toEqual({
      code: 'UNAUTHORIZED',
      message: 'Token requerido',
      details: undefined,
    });
  });

  it('should include details in toJSON() when present', () => {
    const details = [{ field: 'email', reason: 'Ya existe' }];
    const error = new AppError('CONFLICT', 'Duplicado', 409, details);

    const json = error.toJSON();

    expect(json).toEqual({
      code: 'CONFLICT',
      message: 'Duplicado',
      details,
    });
  });
});
