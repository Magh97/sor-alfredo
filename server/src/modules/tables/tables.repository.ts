import { eq, and } from 'drizzle-orm';
import { db, schema } from '../../db/index.js';
import type { CreateTableInput, UpdateTableInput } from './tables.schema.js';

export class TablesRepository {
  static async findAll(restaurantId: number) {
    return db.select()
      .from(schema.tables)
      .where(eq(schema.tables.restaurantId, restaurantId))
      .orderBy(schema.tables.number);
  }

  static async findById(id: number, restaurantId: number) {
    return db.query.tables.findFirst({
      where: and(eq(schema.tables.id, id), eq(schema.tables.restaurantId, restaurantId)),
    });
  }

  static async findByNumber(number: number, restaurantId: number) {
    return db.query.tables.findFirst({
      where: and(eq(schema.tables.number, number), eq(schema.tables.restaurantId, restaurantId)),
    });
  }

  static async create(restaurantId: number, input: CreateTableInput) {
    const [table] = await db.insert(schema.tables)
      .values({ ...input, restaurantId })
      .returning();
    return table;
  }

  static async update(id: number, restaurantId: number, input: UpdateTableInput) {
    const [table] = await db.update(schema.tables)
      .set(input)
      .where(and(eq(schema.tables.id, id), eq(schema.tables.restaurantId, restaurantId)))
      .returning();
    return table ?? null;
  }

  static async updateStatus(id: number, status: typeof schema.tables.status.default) {
    const [table] = await db.update(schema.tables)
      .set({ status })
      .where(eq(schema.tables.id, id))
      .returning();
    return table ?? null;
  }
}
