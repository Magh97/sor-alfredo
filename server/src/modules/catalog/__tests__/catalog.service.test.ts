import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../catalog.repository.js', () => ({
  CatalogRepository: {
    findAllCategories: vi.fn(),
    findCategoryById: vi.fn(),
    createCategory: vi.fn(),
    updateCategory: vi.fn(),
    findAllProducts: vi.fn(),
    findProductById: vi.fn(),
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
    findAllModifiers: vi.fn(),
    findModifierById: vi.fn(),
    createModifier: vi.fn(),
    updateModifier: vi.fn(),
    findProductModifierIds: vi.fn().mockResolvedValue([]),
  },
}));

const { CatalogRepository } = await import('../catalog.repository.js');
const { CatalogService } = await import('../catalog.service.js');

describe('CatalogService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createProduct', () => {
    it('should create product with valid category', async () => {
      vi.mocked(CatalogRepository.findCategoryById).mockResolvedValue({ id: 1 } as never);
      vi.mocked(CatalogRepository.findAllModifiers).mockResolvedValue([]);
      vi.mocked(CatalogRepository.createProduct).mockResolvedValue({ id: 1, name: 'Test' } as never);

      const result = await CatalogService.createProduct(1, {
        name: 'Test', basePrice: '100', categoryId: 1, modifierIds: [],
      });

      expect(result).toBeDefined();
      expect(CatalogRepository.createProduct).toHaveBeenCalled();
    });

    it('should throw NOT_FOUND when category does not exist', async () => {
      vi.mocked(CatalogRepository.findCategoryById).mockResolvedValue(null);

      await expect(CatalogService.createProduct(1, {
        name: 'Test', basePrice: '100', categoryId: 999, modifierIds: [],
      })).rejects.toThrow('Categoría no encontrada');
    });

    it('should accept product without category', async () => {
      vi.mocked(CatalogRepository.findAllModifiers).mockResolvedValue([]);
      vi.mocked(CatalogRepository.createProduct).mockResolvedValue({ id: 1 } as never);

      const result = await CatalogService.createProduct(1, {
        name: 'Test', basePrice: '100', modifierIds: [],
      });

      expect(result).toBeDefined();
    });
  });

  describe('listProducts', () => {
    it('should return products', async () => {
      vi.mocked(CatalogRepository.findAllProducts).mockResolvedValue([{ id: 1, modifierIds: [] }] as never);

      const result = await CatalogService.listProducts(1, {});

      expect(result).toHaveLength(1);
    });
  });

  describe('updateModifier', () => {
    it('should throw NOT_FOUND when modifier missing', async () => {
      vi.mocked(CatalogRepository.findModifierById).mockResolvedValue(null);

      await expect(CatalogService.updateModifier(999, 1, { name: 'X' }))
        .rejects.toThrow('Modificador no encontrado');
    });
  });
});
