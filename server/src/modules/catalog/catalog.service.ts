import { CatalogRepository } from './catalog.repository.js';
import { AppError } from '../../shared/errors.js';
import type {
  CreateCategoryInput, UpdateCategoryInput,
  CreateProductInput, UpdateProductInput,
  CreateModifierInput, UpdateModifierInput,
} from './catalog.schema.js';

export class CatalogService {
  static async listCategories(restaurantId: number) {
    return CatalogRepository.findAllCategories(restaurantId);
  }

  static async createCategory(restaurantId: number, input: CreateCategoryInput) {
    return CatalogRepository.createCategory(restaurantId, input);
  }

  static async updateCategory(id: number, restaurantId: number, input: UpdateCategoryInput) {
    const category = await CatalogRepository.findCategoryById(id, restaurantId);
    if (!category) throw new AppError('NOT_FOUND', 'Categoría no encontrada', 404);
    return CatalogRepository.updateCategory(id, restaurantId, input);
  }

  static async listProducts(restaurantId: number, filters?: { categoryId?: number; search?: string; availableOnly?: boolean }) {
    const products = await CatalogRepository.findAllProducts(restaurantId, filters);
    const enriched = await Promise.all(
      products.map(async (product) => {
        const modifierIds = await CatalogRepository.findProductModifierIds(product.id);
        return { ...product, modifierIds };
      }),
    );
    return enriched;
  }

  static async createProduct(restaurantId: number, input: CreateProductInput) {
    if (input.categoryId) {
      const category = await CatalogRepository.findCategoryById(input.categoryId, restaurantId);
      if (!category) throw new AppError('NOT_FOUND', 'Categoría no encontrada', 404);
    }

    if (input.modifierIds.length > 0) {
      const modifiers = await CatalogRepository.findAllModifiers(restaurantId);
      const modifierIdSet = new Set(modifiers.map((m) => m.id));
      for (const id of input.modifierIds) {
        if (!modifierIdSet.has(id)) throw new AppError('NOT_FOUND', `Modificador ${String(id)} no encontrado`, 404);
      }
    }

    return CatalogRepository.createProduct(restaurantId, input);
  }

  static async updateProduct(id: number, restaurantId: number, input: UpdateProductInput) {
    const product = await CatalogRepository.findProductById(id, restaurantId);
    if (!product) throw new AppError('NOT_FOUND', 'Producto no encontrado', 404);

    if (input.categoryId) {
      const category = await CatalogRepository.findCategoryById(input.categoryId, restaurantId);
      if (!category) throw new AppError('NOT_FOUND', 'Categoría no encontrada', 404);
    }

    if (input.modifierIds && input.modifierIds.length > 0) {
      const modifiers = await CatalogRepository.findAllModifiers(restaurantId);
      const modifierIdSet = new Set(modifiers.map((m) => m.id));
      for (const id of input.modifierIds) {
        if (!modifierIdSet.has(id)) throw new AppError('NOT_FOUND', `Modificador ${String(id)} no encontrado`, 404);
      }
    }

    return CatalogRepository.updateProduct(id, restaurantId, input);
  }

  static async listModifiers(restaurantId: number) {
    return CatalogRepository.findAllModifiers(restaurantId);
  }

  static async createModifier(restaurantId: number, input: CreateModifierInput) {
    return CatalogRepository.createModifier(restaurantId, input);
  }

  static async updateModifier(id: number, restaurantId: number, input: UpdateModifierInput) {
    const modifier = await CatalogRepository.findModifierById(id, restaurantId);
    if (!modifier) throw new AppError('NOT_FOUND', 'Modificador no encontrado', 404);
    return CatalogRepository.updateModifier(id, restaurantId, input);
  }
}
