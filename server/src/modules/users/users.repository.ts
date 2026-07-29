import { eq, and, type SQL } from 'drizzle-orm';
import { db, schema } from '../../db/index.js';
import type { CreateUserInput, UpdateUserInput } from './users.schema.js';

export class UsersRepository {
  static async findAll(restaurantId: number, filters?: { role?: string; isActive?: boolean }) {
    const conditions: SQL[] = [eq(schema.users.restaurantId, restaurantId)];

    if (filters?.role) {
      conditions.push(eq(schema.users.role, filters.role as typeof schema.users.role.default));
    }
    if (filters?.isActive !== undefined) {
      conditions.push(eq(schema.users.isActive, filters.isActive));
    }

    return db.select({
      id: schema.users.id,
      restaurantId: schema.users.restaurantId,
      name: schema.users.name,
      email: schema.users.email,
      role: schema.users.role,
      isActive: schema.users.isActive,
      createdAt: schema.users.createdAt,
    }).from(schema.users).where(and(...conditions));
  }

  static async findById(id: number, restaurantId: number) {
    return db.query.users.findFirst({
      where: and(eq(schema.users.id, id), eq(schema.users.restaurantId, restaurantId)),
    });
  }

  static async findByEmail(email: string) {
    return db.query.users.findFirst({
      where: eq(schema.users.email, email),
    });
  }

  static async create(data: CreateUserInput & { restaurantId: number; passwordHash: string }) {
    const [user] = await db.insert(schema.users).values(data).returning();
    return user;
  }

  static async update(id: number, restaurantId: number, data: UpdateUserInput & { passwordHash?: string }) {
    const [user] = await db.update(schema.users)
      .set(data)
      .where(and(eq(schema.users.id, id), eq(schema.users.restaurantId, restaurantId)))
      .returning();
    return user ?? null;
  }

  static async softDelete(id: number, restaurantId: number) {
    const [user] = await db.update(schema.users)
      .set({ isActive: false })
      .where(and(eq(schema.users.id, id), eq(schema.users.restaurantId, restaurantId)))
      .returning();
    return user ?? null;
  }
}
