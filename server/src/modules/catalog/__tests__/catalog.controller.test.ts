import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../../app.js';

const { jwtVerifyMock } = vi.hoisted(() => ({
  jwtVerifyMock: vi.fn(),
}));

vi.mock('jsonwebtoken', () => ({
  default: { verify: jwtVerifyMock },
}));

vi.mock('../catalog.service.js', () => ({
  CatalogService: {
    listCategories: vi.fn(),
    createCategory: vi.fn(),
    updateCategory: vi.fn(),
    listProducts: vi.fn(),
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
    listModifiers: vi.fn(),
    createModifier: vi.fn(),
    updateModifier: vi.fn(),
  },
}));

const { CatalogService } = await import('../catalog.service.js');

const adminPayload = { userId: 1, role: 'admin', restaurantId: 1 };
const waiterPayload = { userId: 2, role: 'waiter', restaurantId: 1 };

describe('Catalog Controller', () => {
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

  describe('GET /api/catalog/categories', () => {
    it('should return categories for any authenticated user', async () => {
      jwtVerifyMock.mockReturnValue(waiterPayload);
      vi.mocked(CatalogService.listCategories).mockResolvedValue([{ id: 1, name: 'Entradas' }] as never);

      const res = await request(app)
        .get('/api/catalog/categories')
        .set('Authorization', 'Bearer waiter-token');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('POST /api/catalog/products', () => {
    it('should return 403 for waiter', async () => {
      jwtVerifyMock.mockReturnValue(waiterPayload);

      const res = await request(app)
        .post('/api/catalog/products')
        .set('Authorization', 'Bearer waiter-token')
        .send({ name: 'Test', basePrice: '50' });

      expect(res.status).toBe(403);
    });

    it('should create product for admin', async () => {
      jwtVerifyMock.mockReturnValue(adminPayload);
      vi.mocked(CatalogService.createProduct).mockResolvedValue({ id: 1, name: 'Test' } as never);

      const res = await request(app)
        .post('/api/catalog/products')
        .set('Authorization', 'Bearer admin-token')
        .send({ name: 'Test', basePrice: '50' });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('Test');
    });
  });

  describe('GET /api/catalog/products', () => {
    it('should filter by search query', async () => {
      jwtVerifyMock.mockReturnValue(waiterPayload);
      vi.mocked(CatalogService.listProducts).mockResolvedValue([{ id: 1 }] as never);

      const res = await request(app)
        .get('/api/catalog/products?search=guacamole')
        .set('Authorization', 'Bearer waiter-token');

      expect(res.status).toBe(200);
      expect(CatalogService.listProducts).toHaveBeenCalledWith(1, expect.objectContaining({ search: 'guacamole' }));
    });
  });

  describe('POST /api/catalog/modifiers', () => {
    it('should create modifier for admin', async () => {
      jwtVerifyMock.mockReturnValue(adminPayload);
      vi.mocked(CatalogService.createModifier).mockResolvedValue({ id: 1 } as never);

      const res = await request(app)
        .post('/api/catalog/modifiers')
        .set('Authorization', 'Bearer admin-token')
        .send({ name: 'Sin sal', priceAdjustment: '0' });

      expect(res.status).toBe(201);
    });
  });
});
