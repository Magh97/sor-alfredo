import { eq, and, sql } from 'drizzle-orm';
import { db, schema } from '../../db/index.js';
import type {
  CreateCategoryInput, UpdateCategoryInput,
  CreateProductInput, UpdateProductInput,
  CreateModifierInput, UpdateModifierInput,
} from './catalog.schema.js';

export class CatalogRepository {
  static async findAllCategories(restaurantId: number) {
    return db.select()
      .from(schema.categories)
      .where(eq(schema.categories.restaurantId, restaurantId))
      .orderBy(schema.categories.sortOrder);
  }

  static async findCategoryById(id: number, restaurantId: number) {
    return db.query.categories.findFirst({
      where: and(eq(schema.categories.id, id), eq(schema.categories.restaurantId, restaurantId)),
    });
  }

  static async createCategory(restaurantId: number, input: CreateCategoryInput) {
    const [category] = await db.insert(schema.categories)
      .values({ ...input, restaurantId })
      .returning();
    return category;
  }

  static async updateCategory(id: number, restaurantId: number, input: UpdateCategoryInput) {
    const [category] = await db.update(schema.categories)
      .set(input)
      .where(and(eq(schema.categories.id, id), eq(schema.categories.restaurantId, restaurantId)))
      .returning();
    return category ?? null;
  }

  static async findAllProducts(restaurantId: number, filters?: { categoryId?: number; search?: string; availableOnly?: boolean }) {
    const conditions = [eq(schema.products.restaurantId, restaurantId)];

    if (filters?.categoryId) {
      conditions.push(eq(schema.products.categoryId, filters.categoryId));
    }
    if (filters?.availableOnly) {
      conditions.push(eq(schema.products.isAvailable, true));
    }
    if (filters?.search) {
      conditions.push(sql`to_tsvector('spanish', ${schema.products.name}) @@ plainto_tsquery('spanish', ${filters.search})`);
    }

    return db.select().from(schema.products).where(and(...conditions));
  }

  static async findProductById(id: number, restaurantId: number) {
    return db.query.products.findFirst({
      where: and(eq(schema.products.id, id), eq(schema.products.restaurantId, restaurantId)),
    });
  }

  static async createProduct(restaurantId: number, input: CreateProductInput) {
    const { modifierIds, ...data } = input;
    const [product] = await db.insert(schema.products)
      .values({ ...data, restaurantId })
      .returning();

    if (modifierIds.length > 0) {
      await db.insert(schema.productModifiers).values(
        modifierIds.map((modifierId) => ({ productId: product.id, modifierId })),
      );
    }

    return product;
  }

  static async updateProduct(id: number, restaurantId: number, input: UpdateProductInput) {
    const { modifierIds, ...data } = input;

    let product = null;
    if (Object.keys(data).length > 0) {
      const [updated] = await db.update(schema.products)
        .set(data)
        .where(and(eq(schema.products.id, id), eq(schema.products.restaurantId, restaurantId)))
        .returning();
      product = updated;
    } else {
      product = await this.findProductById(id, restaurantId);
    }

    if (modifierIds !== undefined) {
      await db.delete(schema.productModifiers)
        .where(eq(schema.productModifiers.productId, id));
      if (modifierIds.length > 0) {
        await db.insert(schema.productModifiers).values(
          modifierIds.map((modifierId) => ({ productId: id, modifierId })),
        );
      }
    }

    return product ?? null;
  }

  static async findAllModifiers(restaurantId: number) {
    return db.select()
      .from(schema.modifiers)
      .where(eq(schema.modifiers.restaurantId, restaurantId));
  }

  static async findModifierById(id: number, restaurantId: number) {
    return db.query.modifiers.findFirst({
      where: and(eq(schema.modifiers.id, id), eq(schema.modifiers.restaurantId, restaurantId)),
    });
  }

  static async findProductModifierIds(productId: number) {
    const rows = await db.select({ modifierId: schema.productModifiers.modifierId })
      .from(schema.productModifiers)
      .where(eq(schema.productModifiers.productId, productId));
    return rows.map((r) => r.modifierId);
  }

  static async createModifier(restaurantId: number, input: CreateModifierInput) {
    const [modifier] = await db.insert(schema.modifiers)
      .values({ ...input, restaurantId })
      .returning();
    return modifier;
  }

  static async updateModifier(id: number, restaurantId: number, input: UpdateModifierInput) {
    const [modifier] = await db.update(schema.modifiers)
      .set(input)
      .where(and(eq(schema.modifiers.id, id), eq(schema.modifiers.restaurantId, restaurantId)))
      .returning();
    return modifier ?? null;
  }
}
