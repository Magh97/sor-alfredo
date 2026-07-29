# PATTERNS

Reusable code patterns. Follow these when implementing any feature.

## Controller-Service-Repository

Every backend module follows this structure:

```
<module>.controller.ts   Router + handlers: parse req, validate (Zod), call service, format response
<module>.service.ts      Business logic: validations, state machine, calculations, event emission
<module>.repository.ts   Drizzle queries: all DB access, returns entities (never HTTP types)
<module>.schema.ts       Zod schemas: CreateX, UpdateX, XResponse, shared types
```

```typescript
// Example: orders.controller.ts
import { Router } from 'express';
import { z } from 'zod';
import { CreateOrderSchema } from './orders.schema';
import { OrdersService } from './orders.service';

const router = Router();

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const input = CreateOrderSchema.parse(req.body);
    const order = await OrdersService.createOrder(req.user.id, req.user.restaurantId, input);
    res.status(201).json({ data: order });
  } catch (err) {
    if (err instanceof AppError) return res.status(err.statusCode).json({ error: err.toJSON() });
    next(err);
  }
});

export const ordersRouter = router;



// Example: orders.service.ts
export class OrdersService {
  static async createOrder(userId: number, restaurantId: number, input: CreateOrderInput): Promise<Order> {
    const table = await TablesRepository.findById(input.tableId, restaurantId);
    if (!table) throw new AppError('NOT_FOUND', 'Mesa no encontrada', 404);
    if (table.status === 'occupied') throw new AppError('TABLE_OCCUPIED', 'La mesa ya tiene una orden activa', 409);

    const items = await this.validateAndPriceItems(input.items, restaurantId);
    const totalAmount = items.reduce((sum, i) => sum + i.subtotal, 0);

    const order = await OrdersRepository.create({
      restaurantId, tableId: input.tableId, userId, status: 'draft', totalAmount,
    }, items);

    await TablesRepository.updateStatus(table.id, 'occupied');
    return order;
  }
}

// Example: orders.repository.ts
import { db } from '../../db';
import { orders, orderItems } from '../../db/schema';
import { eq } from 'drizzle-orm';

export class OrdersRepository {
  static async findById(id: number, restaurantId: number) {
    return db.query.orders.findFirst({
      where: and(eq(orders.id, id), eq(orders.restaurantId, restaurantId)),
      with: { items: { with: { modifiers: true } } },
    });
  }

  static async create(orderData: InsertOrder, items: InsertOrderItem[]) {
    return db.transaction(async (tx) => {
      const [order] = await tx.insert(orders).values(orderData).returning();
      await tx.insert(orderItems).values(items.map(i => ({ ...i, orderId: order.id })));
      return order;
    });
  }
}
```

## State Machine

Order status transitions enforced in service:

```typescript
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  draft:         ['in_kitchen'],
  in_kitchen:    ['ready'],
  ready:         ['delivered'],
  delivered:     ['paid', 'partially_paid'],
  partially_paid:['paid'],
  paid:          ['closed'],
  closed:        [],
};

function validateTransition(current: OrderStatus, next: OrderStatus): void {
  const allowed = VALID_TRANSITIONS[current];
  if (!allowed || !allowed.includes(next)) {
    throw new AppError('CONFLICT', `Transicion invalida: ${current} → ${next}`, 409);
  }
}
```

## Auth Middleware

```typescript
// server/src/shared/middleware/auth.ts
import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) throw new AppError('UNAUTHORIZED', 'Token requerido', 401);

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.user = { id: payload.userId, role: payload.role, restaurantId: payload.restaurantId };
    next();
  } catch {
    throw new AppError('UNAUTHORIZED', 'Token invalido o expirado', 401);
  }
}

export function requireRole(...roles: string[]) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new AppError('FORBIDDEN', `Requiere rol: ${roles.join('|')}`, 403);
    }
    next();
  };
}
```

## Restaurant Scope Helper

```typescript
// server/src/shared/db-helpers.ts
import { SQL, sql } from 'drizzle-orm';

export function whereRestaurant(table: AnyTable, restaurantId: number): SQL {
  return sql`${table.restaurantId} = ${restaurantId}`;
}
```

## Error Class

```typescript
// server/src/shared/errors.ts
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400,
    public details?: { field: string; reason: string }[],
  ) {
    super(message);
  }

  toJSON() {
    return { code: this.code, message: this.message, details: this.details };
  }
}
```

## Optimistic Update (React)

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

function useUpdateOrderStatus(orderId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newStatus: OrderStatus) =>
      api.put(`/api/orders/${orderId}/status`, { status: newStatus }),

    onMutate: async (newStatus) => {
      await queryClient.cancelQueries({ queryKey: ['orders'] });
      const previous = queryClient.getQueryData<Order[]>(['orders']);

      queryClient.setQueryData<Order[]>(['orders'], (old) =>
        old?.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
      );

      return { previous };
    },

    onError: (_err, _vars, context) => {
      queryClient.setQueryData(['orders'], context?.previous);
      toast({ title: 'Error al actualizar', variant: 'destructive' });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
```

## React State Pattern (Loading/Error/Empty)

```typescript
function OrdersPage() {
  const { data, isLoading, isError, error, refetch } = useQuery({ queryKey: ['orders'], queryFn: fetchOrders });

  if (isLoading) return <OrdersSkeleton />;
  if (isError) return <ErrorAlert message={error.message} onRetry={() => refetch()} />;
  if (!data || data.length === 0) return <EmptyState icon={ClipboardList} title="Sin ordenes" description="Crea una nueva orden para empezar" />;

  return (
    <div className="grid gap-3">
      {data.map((order) => <OrderCard key={order.id} order={order} />)}
    </div>
  );
}
```

## Compound Component (Card)

```typescript
interface CardContextValue { isHovered: boolean; setIsHovered: (v: boolean) => void; }
const CardContext = createContext<CardContextValue | null>(null);

function Card({ children, className, onClick }: CardProps) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <CardContext value={{ isHovered, setIsHovered }}>
      <article className={cn('rounded-[var(--radius-card)] bg-surface shadow-card', isHovered && 'shadow-card-hover', className)}
        onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} onClick={onClick}>
        {children}
      </article>
    </CardContext>
  );
}
Card.Header = ({ children }) => <header className="border-b px-4 py-3">{children}</header>;
Card.Body = ({ children }) => <div className="px-4 py-3">{children}</div>;
Card.Footer = ({ children }) => { const ctx = useContext(CardContext); return <footer className="border-t px-4 py-3">{children}</footer>; };
```

## KDS Order Aging Hook

```typescript
function useOrderAge(createdAt: string): number {
  const [minutes, setMinutes] = useState(0);
  useEffect(() => {
    const update = () => setMinutes((Date.now() - new Date(createdAt).getTime()) / 60000);
    update();
    const id = setInterval(update, 10000);
    return () => clearInterval(id);
  }, [createdAt]);
  return minutes;
}

// Usage in KDSOrderCard:
const minutes = useOrderAge(order.createdAt);
const kdsVariant = minutes > 15 ? 'critical' : minutes > 10 ? 'warning' : minutes > 5 ? 'attention' : 'normal';
```

## File Naming Convention

```
Component:    PascalCase.tsx        OrderCard.tsx
Hook:         camelCase, use-       useOrderAge.ts
Util:         camelCase             formatCurrency.ts
Schema:       <module>.schema.ts    orders.schema.ts
Test:         <file>.test.ts        orders.service.test.ts
CSS:          None (Tailwind only)
```

## Test Pattern (AAA)

```typescript
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';

describe('OrdersService', () => {
  describe('createOrder', () => {
    it('should create order with valid items', async () => {
      // Arrange
      const input = { tableId: 1, items: [{ productId: 1, quantity: 2 }] };
      vi.spyOn(TablesRepository, 'findById').mockResolvedValue({ id: 1, status: 'free' });
      vi.spyOn(ProductsRepository, 'findByIds').mockResolvedValue([{ id: 1, basePrice: 100 }]);

      // Act
      const order = await OrdersService.createOrder(1, 1, input);

      // Assert
      expect(order.status).toBe('draft');
      expect(order.totalAmount).toBe(200);
    });

    it('should throw CONFLICT when transition is invalid', async () => {
      // Arrange
      const order = { status: 'closed' };

      // Act & Assert
      expect(() => validateTransition(order.status, 'paid')).toThrow(AppError);
    });
  });
});
```

## Drizzle Query Pattern

```typescript
// Find with relations
const order = await db.query.orders.findFirst({
  where: and(eq(orders.id, id), eq(orders.restaurantId, restaurantId)),
  with: {
    items: {
      with: { modifiers: { with: { modifier: true } } },
      orderBy: (items, { asc }) => [asc(items.id)],
    },
    table: true,
    user: { columns: { id: true, name: true } },
  },
});

// Paginated query
const [data, total] = await Promise.all([
  db.select().from(orders)
    .where(and(eq(orders.restaurantId, restaurantId), ...filters))
    .limit(pageSize).offset((page - 1) * pageSize)
    .orderBy(desc(orders.createdAt)),
  db.select({ count: count() }).from(orders)
    .where(and(eq(orders.restaurantId, restaurantId), ...filters)),
]);
```

## Conditionals and Formatting

```typescript
// cn() for conditional Tailwind classes
import { cn } from '@/lib/utils';
<button className={cn('px-4 py-2 rounded-[var(--radius-control)] font-display font-bold', variant==='primary' && 'bg-primary text-primary-foreground', disabled && 'opacity-50')} />

// formatCurrency — always use this, never inline formatting
import { formatCurrency, formatTime } from '@/lib/utils';
formatCurrency(1500)   // "$1,500.00"
formatCurrency(99.5)   // "$99.50"
formatTime(new Date()) // "15:42"
```
