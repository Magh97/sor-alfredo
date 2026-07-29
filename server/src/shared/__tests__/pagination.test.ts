import { describe, it, expect } from 'vitest';
import { paginate, paginatedResponse } from '../pagination.js';
import type { PaginationParams } from '../pagination.js';

describe('paginate', () => {
  it('should paginate with default values (page=1, pageSize=20)', () => {
    const result = paginate({});

    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(20);
    expect(result.offset).toBe(0);
    expect(result.limit).toBe(20);
  });

  it('should accept custom page and pageSize', () => {
    const result = paginate({ page: '3', pageSize: '10' });

    expect(result.page).toBe(3);
    expect(result.pageSize).toBe(10);
    expect(result.offset).toBe(20);
    expect(result.limit).toBe(10);
  });

  it('should cap pageSize at 100', () => {
    const result = paginate({ page: '1', pageSize: '200' });

    expect(result.pageSize).toBe(100);
    expect(result.limit).toBe(100);
  });

  it('should calculate correct offset', () => {
    const result = paginate({ page: '5', pageSize: '25' });

    expect(result.offset).toBe(100);
  });

  it('should default page to 1 when page is not a valid number', () => {
    const result = paginate({ page: 'abc' });

    expect(result.page).toBe(1);
  });

  it('should default pageSize to 20 when pageSize is not a valid number', () => {
    const result = paginate({ pageSize: 'xyz' });

    expect(result.pageSize).toBe(20);
  });

  it('should clamp page to minimum of 1', () => {
    const result = paginate({ page: '-5' });

    expect(result.page).toBe(1);
  });

  it('should fall back to default when pageSize is 0 string (via || 20)', () => {
    const result = paginate({ pageSize: '0' });

    expect(result.pageSize).toBe(20);
  });
});

describe('paginatedResponse', () => {
  it('should return correct meta (totalPages, totalItems)', () => {
    const params: PaginationParams = { page: 1, pageSize: 20, offset: 0, limit: 20 };
    const data = [{ id: 1 }, { id: 2 }];

    const response = paginatedResponse(data, 45, params);

    expect(response.data).toEqual(data);
    expect(response.meta).toEqual({
      page: 1,
      pageSize: 20,
      totalItems: 45,
      totalPages: 3,
    });
  });

  it('should calculate totalPages as 1 when totalItems is less than pageSize', () => {
    const params: PaginationParams = { page: 1, pageSize: 50, offset: 0, limit: 50 };
    const data: string[] = [];

    const response = paginatedResponse(data, 5, params);

    expect(response.meta.totalPages).toBe(1);
    expect(response.meta.totalItems).toBe(5);
  });

  it('should calculate totalPages as 0 when totalItems is 0', () => {
    const params: PaginationParams = { page: 1, pageSize: 20, offset: 0, limit: 20 };
    const data: string[] = [];

    const response = paginatedResponse(data, 0, params);

    expect(response.meta.totalPages).toBe(0);
  });

  it('should preserve the given page and pageSize in meta', () => {
    const params: PaginationParams = { page: 3, pageSize: 15, offset: 30, limit: 15 };
    const data = [{ name: 'A' }];

    const response = paginatedResponse(data, 100, params);

    expect(response.meta.page).toBe(3);
    expect(response.meta.pageSize).toBe(15);
  });
});
