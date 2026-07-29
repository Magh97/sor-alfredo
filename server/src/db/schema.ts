import {
  pgTable, serial, varchar, text, integer, numeric, boolean,
  timestamp, pgEnum, unique, index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const userRoleEnum = pgEnum('user_role', ['waiter', 'cashier', 'admin', 'superadmin']);
export const tableStatusEnum = pgEnum('table_status', ['free', 'occupied', 'reserved', 'cleaning']);
export const orderStatusEnum = pgEnum('order_status', ['draft', 'in_kitchen', 'ready', 'delivered', 'paid', 'partially_paid', 'closed']);
export const orderItemStatusEnum = pgEnum('order_item_status', ['pending', 'in_kitchen', 'ready', 'cancelled']);
export const paymentMethodEnum = pgEnum('payment_method', ['cash', 'card', 'transfer']);
export const tipDistributionTypeEnum = pgEnum('tip_distribution_type', ['equal', 'individual']);
export const cashRegisterStatusEnum = pgEnum('cash_register_status', ['open', 'closed']);

export const restaurants = pgTable('restaurants', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  address: varchar('address', { length: 200 }),
  phone: varchar('phone', { length: 20 }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  restaurantId: integer('restaurant_id').notNull().references(() => restaurants.id),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 150 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: userRoleEnum('role').notNull().default('waiter'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  idxUsersRestaurantRole: index('idx_users_restaurant_role').on(table.restaurantId, table.role),
}));

export const tables = pgTable('tables', {
  id: serial('id').primaryKey(),
  restaurantId: integer('restaurant_id').notNull().references(() => restaurants.id),
  number: integer('number').notNull(),
  name: varchar('name', { length: 50 }),
  capacity: integer('capacity').notNull().default(4),
  positionX: integer('position_x').default(0),
  positionY: integer('position_y').default(0),
  status: tableStatusEnum('status').notNull().default('free'),
}, (table) => ({
  unqRestaurantNumber: unique('unq_restaurant_table_number').on(table.restaurantId, table.number),
}));

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  restaurantId: integer('restaurant_id').notNull().references(() => restaurants.id),
  tableId: integer('table_id').notNull().references(() => tables.id),
  userId: integer('user_id').notNull().references(() => users.id),
  status: orderStatusEnum('status').notNull().default('draft'),
  totalAmount: numeric('total_amount', { precision: 19, scale: 4 }).notNull().default('0'),
  tipAmount: numeric('tip_amount', { precision: 19, scale: 4 }).default('0'),
  tipDistribution: tipDistributionTypeEnum('tip_distribution').default('equal'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  closedAt: timestamp('closed_at', { withTimezone: true }),
}, (table) => ({
  idxOrdersRestaurantStatus: index('idx_orders_restaurant_status').on(table.restaurantId, table.status),
  idxOrdersTable: index('idx_orders_table').on(table.tableId),
  idxOrdersUserCreated: index('idx_orders_user_created').on(table.userId, table.createdAt.desc()),
  idxOrdersStatusKitchen: index('idx_orders_status_kitchen')
    .on(table.status, table.createdAt)
    .where(sql`${table.status} = 'in_kitchen'`),
}));

export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: integer('product_id').notNull().references(() => products.id),
  quantity: integer('quantity').notNull(),
  unitPrice: numeric('unit_price', { precision: 19, scale: 4 }).notNull(),
  subtotal: numeric('subtotal', { precision: 19, scale: 4 }).notNull(),
  modifications: text('modifications'),
  status: orderItemStatusEnum('status').notNull().default('pending'),
}, (table) => ({
  idxOrderItemsOrder: index('idx_order_items_order').on(table.orderId),
}));

export const orderItemModifiers = pgTable('order_item_modifiers', {
  id: serial('id').primaryKey(),
  orderItemId: integer('order_item_id').notNull().references(() => orderItems.id, { onDelete: 'cascade' }),
  modifierId: integer('modifier_id').notNull().references(() => modifiers.id),
  quantity: integer('quantity').notNull().default(1),
  priceAdjustment: numeric('price_adjustment', { precision: 19, scale: 4 }).notNull().default('0'),
});

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  restaurantId: integer('restaurant_id').notNull().references(() => restaurants.id),
  name: varchar('name', { length: 50 }).notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  restaurantId: integer('restaurant_id').notNull().references(() => restaurants.id),
  categoryId: integer('category_id').references(() => categories.id),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  basePrice: numeric('base_price', { precision: 19, scale: 4 }).notNull(),
  imageUrl: varchar('image_url', { length: 500 }),
  isAvailable: boolean('is_available').notNull().default(true),
}, (table) => ({
  idxProductsRestaurantAvailable: index('idx_products_restaurant_available').on(table.restaurantId, table.isAvailable),
  idxProductsNameSearch: index('idx_products_name_search').using('gin', sql`to_tsvector('spanish', ${table.name})`),
}));

export const modifiers = pgTable('modifiers', {
  id: serial('id').primaryKey(),
  restaurantId: integer('restaurant_id').notNull().references(() => restaurants.id),
  name: varchar('name', { length: 100 }).notNull(),
  priceAdjustment: numeric('price_adjustment', { precision: 19, scale: 4 }).notNull().default('0'),
  isAvailable: boolean('is_available').notNull().default(true),
});

export const productModifiers = pgTable('product_modifiers', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  modifierId: integer('modifier_id').notNull().references(() => modifiers.id, { onDelete: 'cascade' }),
}, (table) => ({
  unqProductModifier: unique('unq_product_modifier').on(table.productId, table.modifierId),
}));

export const cashRegisters = pgTable('cash_registers', {
  id: serial('id').primaryKey(),
  restaurantId: integer('restaurant_id').notNull().references(() => restaurants.id),
  userId: integer('user_id').notNull().references(() => users.id),
  openedAt: timestamp('opened_at', { withTimezone: true }).notNull().defaultNow(),
  closedAt: timestamp('closed_at', { withTimezone: true }),
  initialAmount: numeric('initial_amount', { precision: 19, scale: 4 }).notNull().default('0'),
  totalSales: numeric('total_sales', { precision: 19, scale: 4 }).notNull().default('0'),
  totalTips: numeric('total_tips', { precision: 19, scale: 4 }).notNull().default('0'),
  status: cashRegisterStatusEnum('status').notNull().default('open'),
});

export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').notNull().references(() => orders.id),
  userId: integer('user_id').notNull().references(() => users.id),
  cashRegisterId: integer('cash_register_id').notNull().references(() => cashRegisters.id),
  amount: numeric('amount', { precision: 19, scale: 4 }).notNull(),
  paymentMethod: paymentMethodEnum('payment_method').notNull(),
  tipAmount: numeric('tip_amount', { precision: 19, scale: 4 }).notNull().default('0'),
  paidAt: timestamp('paid_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  idxPaymentsCashRegister: index('idx_payments_cash_register').on(table.cashRegisterId),
  idxPaymentsPaidAt: index('idx_payments_paid_at').on(table.paidAt),
}));

export const tipDistributions = pgTable('tip_distributions', {
  id: serial('id').primaryKey(),
  paymentId: integer('payment_id').notNull().references(() => payments.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id),
  amount: numeric('amount', { precision: 19, scale: 4 }).notNull(),
  distributionType: tipDistributionTypeEnum('distribution_type').notNull(),
}, (table) => ({
  idxTipsUser: index('idx_tips_user').on(table.userId, table.distributionType),
}));

export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  restaurantId: integer('restaurant_id').notNull().references(() => restaurants.id),
  userId: integer('user_id').notNull().references(() => users.id),
  entityType: varchar('entity_type', { length: 50 }).notNull(),
  entityId: integer('entity_id').notNull(),
  action: varchar('action', { length: 50 }).notNull(),
  oldValues: text('old_values'),
  newValues: text('new_values'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  idxAuditEntity: index('idx_audit_entity').on(table.entityType, table.entityId),
  idxAuditCreated: index('idx_audit_created').on(table.createdAt.desc()),
}));
