import { eq, and, gte, lte, sql, count, sum } from 'drizzle-orm';
import { db, schema } from '../../db/index.js';

export class ReportsRepository {
  static async salesByPeriod(restaurantId: number, from: string, to: string, groupBy: 'day' | 'week' | 'month') {
    const truncFn = groupBy === 'month'
      ? sql`date_trunc('month', ${schema.payments.paidAt})`
      : groupBy === 'week'
      ? sql`date_trunc('week', ${schema.payments.paidAt})`
      : sql`date_trunc('day', ${schema.payments.paidAt})`;

    return db.select({
      period: truncFn,
      totalSales: sum(schema.payments.amount),
      totalTips: sum(schema.payments.tipAmount),
      paymentCount: count(schema.payments.id),
    })
      .from(schema.payments)
      .innerJoin(schema.orders, eq(schema.payments.orderId, schema.orders.id))
      .where(and(
        eq(schema.orders.restaurantId, restaurantId),
        gte(schema.payments.paidAt, new Date(from)),
        lte(schema.payments.paidAt, new Date(to)),
      ))
      .groupBy(truncFn)
      .orderBy(truncFn);
  }

  static async topProducts(restaurantId: number, from: string, to: string, limit: number) {
    return db.select({
      productId: schema.orderItems.productId,
      productName: schema.products.name,
      totalQuantity: sum(schema.orderItems.quantity).mapWith(Number),
      totalRevenue: sum(schema.orderItems.subtotal).mapWith(Number),
    })
      .from(schema.orderItems)
      .innerJoin(schema.products, eq(schema.orderItems.productId, schema.products.id))
      .innerJoin(schema.orders, eq(schema.orderItems.orderId, schema.orders.id))
      .where(and(
        eq(schema.orders.restaurantId, restaurantId),
        gte(schema.orders.createdAt, new Date(from)),
        lte(schema.orders.createdAt, new Date(to)),
        sql`${schema.orderItems.status} != 'cancelled'`,
      ))
      .groupBy(schema.orderItems.productId, schema.products.name)
      .orderBy(sql`SUM(${schema.orderItems.quantity}) DESC`)
      .limit(limit);
  }

  static async ordersByUser(restaurantId: number, from: string, to: string) {
    return db.select({
      userId: schema.orders.userId,
      userName: schema.users.name,
      orderCount: count(schema.orders.id).mapWith(Number),
      totalSales: sum(schema.orders.totalAmount).mapWith(Number),
    })
      .from(schema.orders)
      .innerJoin(schema.users, eq(schema.orders.userId, schema.users.id))
      .where(and(
        eq(schema.orders.restaurantId, restaurantId),
        gte(schema.orders.createdAt, new Date(from)),
        lte(schema.orders.createdAt, new Date(to)),
      ))
      .groupBy(schema.orders.userId, schema.users.name)
      .orderBy(sql`SUM(${schema.orders.totalAmount}) DESC`);
  }
}
