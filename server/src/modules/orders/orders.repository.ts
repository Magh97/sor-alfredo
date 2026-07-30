import { eq, and, sql, inArray } from 'drizzle-orm';
import { db, schema } from '../../db/index.js';
import type { CreateOrderInput, AddItemsInput } from './orders.schema.js';

interface OrderFilters {
  status?: string;
  tableId?: number;
  userId?: number;
  page?: number;
  pageSize?: number;
}

export class OrdersRepository {
  static async findAll(restaurantId: number, filters: OrderFilters) {
    const conditions = [eq(schema.orders.restaurantId, restaurantId)];

    if (filters.status) {
      conditions.push(eq(schema.orders.status, filters.status as typeof schema.orders.status.default));
    }
    if (filters.tableId) {
      conditions.push(eq(schema.orders.tableId, filters.tableId));
    }
    if (filters.userId) {
      conditions.push(eq(schema.orders.userId, filters.userId));
    }

    const page = filters.page ?? 1;
    const pageSize = Math.min(filters.pageSize ?? 20, 100);
    const offset = (page - 1) * pageSize;

    const [ordersResult, countResult] = await Promise.all([
      db.select().from(schema.orders)
        .where(and(...conditions))
        .orderBy(schema.orders.createdAt)
        .limit(pageSize)
        .offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(schema.orders)
        .where(and(...conditions)),
    ]);

    return { data: ordersResult, total: Number(countResult[0]?.count ?? 0), page, pageSize };
  }

  static async findById(id: number, restaurantId: number) {
    return db.query.orders.findFirst({
      where: and(eq(schema.orders.id, id), eq(schema.orders.restaurantId, restaurantId)),
    });
  }

  static async findOrderWithItems(id: number, restaurantId: number) {
    const order = await db.query.orders.findFirst({
      where: and(eq(schema.orders.id, id), eq(schema.orders.restaurantId, restaurantId)),
      with: {
        table: true,
        user: { columns: { id: true, name: true } },
      },
    });

    if (!order) return null;

    const items = await db.select()
      .from(schema.orderItems)
      .where(eq(schema.orderItems.orderId, id));

    const itemsWithModifiers = await Promise.all(
      items.map(async (item) => {
        const modifierRows = await db.select()
          .from(schema.orderItemModifiers)
          .where(eq(schema.orderItemModifiers.orderItemId, item.id));

        return { ...item, modifiers: modifierRows };
      }),
    );

    return { ...order, items: itemsWithModifiers };
  }

  static async create(restaurantId: number, userId: number, input: CreateOrderInput) {
    const [order] = await db.insert(schema.orders)
      .values({ restaurantId, tableId: input.tableId, userId, status: 'draft', totalAmount: '0' })
      .returning();

    return this.addItemsToOrder(order, restaurantId, input.items);
  }

  private static async addItemsToOrder(order: typeof schema.orders.$inferSelect, restaurantId: number, items: CreateOrderInput['items']) {
    let totalAmount = '0';

    for (const itemInput of items) {
      const product = await db.query.products.findFirst({
        where: and(eq(schema.products.id, itemInput.productId), eq(schema.products.restaurantId, restaurantId)),
      });
      if (!product) throw Object.assign(new Error(`Producto ${itemInput.productId} no encontrado`), { productId: itemInput.productId });

      let modifiersTotal = '0';
      for (const modifierId of itemInput.modifierIds) {
        const modifier = await db.query.modifiers.findFirst({
          where: and(eq(schema.modifiers.id, modifierId), eq(schema.modifiers.restaurantId, restaurantId)),
        });
        if (modifier) {
          modifiersTotal = (parseFloat(modifiersTotal) + parseFloat(modifier.priceAdjustment)).toFixed(4);
        }
      }

      const unitPrice = product.basePrice;
      const quantity = itemInput.quantity;
      const subtotal = ((parseFloat(unitPrice) + parseFloat(modifiersTotal)) * quantity).toFixed(4);
      totalAmount = (parseFloat(totalAmount) + parseFloat(subtotal)).toFixed(4);

      const [orderItem] = await db.insert(schema.orderItems)
        .values({ orderId: order.id, productId: itemInput.productId, quantity, unitPrice, subtotal })
        .returning();

      if (itemInput.modifierIds.length > 0) {
        for (const modifierId of itemInput.modifierIds) {
          const modifier = await db.query.modifiers.findFirst({
            where: and(eq(schema.modifiers.id, modifierId), eq(schema.modifiers.restaurantId, restaurantId)),
          });
          if (modifier) {
            await db.insert(schema.orderItemModifiers).values({
              orderItemId: orderItem.id,
              modifierId,
              priceAdjustment: modifier.priceAdjustment,
            });
          }
        }
      }
    }

    await db.update(schema.orders)
      .set({ totalAmount })
      .where(eq(schema.orders.id, order.id));

    return db.query.orders.findFirst({
      where: eq(schema.orders.id, order.id),
    }) as Promise<typeof schema.orders.$inferSelect>;
  }

  static async addItems(id: number, restaurantId: number, items: AddItemsInput['items']) {
    const order = await db.query.orders.findFirst({
      where: and(eq(schema.orders.id, id), eq(schema.orders.restaurantId, restaurantId)),
    });
    if (!order) throw new Error('Orden no encontrada');

    return this.addItemsToOrder(order, restaurantId, items);
  }

  static async updateStatus(id: number, restaurantId: number, status: typeof schema.orders.status.default) {
    const data: Record<string, unknown> = { status };
    if (status === 'closed') {
      data.closedAt = new Date();
    }

    const [order] = await db.update(schema.orders)
      .set(data)
      .where(and(eq(schema.orders.id, id), eq(schema.orders.restaurantId, restaurantId)))
      .returning();
    return order ?? null;
  }

  static async cancelOrderItem(orderItemId: number) {
    const [item] = await db.update(schema.orderItems)
      .set({ status: 'cancelled', subtotal: '0', quantity: 0 })
      .where(eq(schema.orderItems.id, orderItemId))
      .returning();
    return item ?? null;
  }

  static async recalculateTotal(orderId: number) {
    const items = await db.select({ subtotal: schema.orderItems.subtotal })
      .from(schema.orderItems)
      .where(and(eq(schema.orderItems.orderId, orderId), sql`${schema.orderItems.status} != 'cancelled'`));

    const totalAmount = items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0).toFixed(4);

    await db.update(schema.orders)
      .set({ totalAmount })
      .where(eq(schema.orders.id, orderId));

    return totalAmount;
  }
}
