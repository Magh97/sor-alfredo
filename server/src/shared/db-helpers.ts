import { sql, type SQL } from 'drizzle-orm';
import type { PgTable } from 'drizzle-orm/pg-core';

type TableWithRestaurant = PgTable & { restaurantId: ReturnType<typeof import('drizzle-orm/pg-core').integer> };

export function whereRestaurant(table: TableWithRestaurant, restaurantId: number): SQL {
  return sql`${table.restaurantId} = ${restaurantId}`;
}
