# Clean Code & TypeScript Best Practices — Alfredo's

Guía canónica para todo el código del proyecto. Todo PR debe cumplirla.

---

## 1. Naming

### Variables — nombres que revelan intención

```typescript
// ❌ Nombres que no dicen nada
const d = new Date();
const list = await fetchOrders();
const flag = true;
const data = response.json();

// ✅ Nombres que responden "¿qué es esto?"
const today = new Date();
const pendingOrders = await fetchOrders();
const isPaymentAuthorized = true;
const orderResult = await response.json();
```

### Booleanos: prefijo is/has/can/should

```typescript
const isActive = true;
const hasItems = order.items.length > 0;
const canCancel = order.status === 'draft';
const shouldNotify = order.totalAmount > 1000;
```

### Métodos: verbo + sustantivo

```typescript
// ✅
async function getOrderById(id: number): Promise<Order> { ... }
function calculateTotal(items: OrderItem[]): number { ... }
function canBeCancelled(order: Order): boolean { ... }

// ❌
async function order(id: number) { ... }       // ¿qué hace?
function total(items: OrderItem[]) { ... }      // ¿calcula o solo accede?
function process(data: unknown) { ... }         // ¿procesar qué?
```

### Clases: sustantivo, no verbo

```typescript
// ✅
class OrderService { }
class PaymentRepository { }
class AuthController { }

// ❌
class ProcessOrder { }       // ¿clase o método?
class OrderManager { }       // "Manager" = demasiado vago
class Utils { }              // basurero
class Helpers { }            // basurero
```

---

## 2. Tamaño

### Métodos: máximo ~30 líneas

```typescript
// ❌ 80 líneas mezclando validación, carga, lógica y persistencia
async function placeOrder(request: CreateOrderInput) {
  // 15 líneas de validación...
  // 20 líneas de carga de datos...
  // 30 líneas de lógica...
  // 15 líneas de guardado...
}

// ✅ Orquestador que delega
async function createOrder(userId: number, restaurantId: number, input: CreateOrderInput) {
  const table = await validateTable(input.tableId, restaurantId);
  const items = await validateAndPriceItems(input.items, restaurantId);
  const order = await OrdersRepository.create({ userId, restaurantId, ... }, items);
  await TablesRepository.updateStatus(table.id, 'occupied');
  return order;
}
```

### Archivos: máximo ~300 líneas

| Tamaño | Acción |
|--------|--------|
| < 100 líneas | Ideal |
| 100-200 | Aceptable si es cohesivo |
| 200-300 | Revisar. ¿2+ responsabilidades? |
| > 300 | Refactorizar a 2+ archivos |

---

## 3. Estructura de archivo

Cada módulo backend sigue: schema → repository → service → controller.

```typescript
// orders.schema.ts     — Zod schemas y tipos derivados
// orders.repository.ts — Drizzle queries. Solo retorna entidades.
// orders.service.ts    — Lógica de negocio. Nunca toca req/res.
// orders.controller.ts — Router Express. Parseo, llamada a service, respuesta.
```

Cada componente React sigue:

```typescript
// Componente principal exportado
// Sub-componentes internos (si son específicos de esta pantalla)
// Tipos locales
// Hook queries/mutations al final
```

---

## 4. Conditionals

### Early return sobre anidamiento

```typescript
// ❌ Pirámide de ifs
function validateOrder(order: Order) {
  if (order.items.length > 0) {
    if (order.tableId) {
      if (order.totalAmount > 0) {
        return true;
      }
    }
  }
  return false;
}

// ✅ Early returns
function validateOrder(order: Order) {
  if (order.items.length === 0) return false;
  if (!order.tableId) return false;
  if (order.totalAmount <= 0) return false;
  return true;
}
```

### No nullish coalescing `??` sobre `||`

```typescript
const pageSize = query.pageSize ?? 20;  // ✅ solo null/undefined
const pageSize = query.pageSize || 20;  // ❌ también 0, '', false
```

### No `!` non-null assertions

```typescript
const name = user!.name;         // ❌
const name = user?.name ?? '';   // ✅
```

---

## 5. Tipos

### No `any`

```typescript
function process(data: any) { ... }              // ❌
function process(data: Record<string, unknown>) { ... }  // ✅ si es genérico
function process(data: CreateOrderInput) { ... }         // ✅ ideal
```

### No `React.FC`

```typescript
const MyComponent: React.FC<Props> = ({ title }) => { ... }  // ❌
function MyComponent({ title }: Props) { ... }                // ✅
```

### No enums. Usar `as const`

```typescript
enum OrderStatus { Draft, InKitchen, Ready }  // ❌

const ORDER_STATUS = ['draft', 'in_kitchen', 'ready'] as const;  // ✅
type OrderStatus = (typeof ORDER_STATUS)[number];
```

### Tipos inferidos cuando sea posible

```typescript
const order = await OrdersRepository.findById(id, restaurantId);  // ✅ tipo inferido
const order: Order = await OrdersRepository.findById(id, restaurantId);  // ❌ redundante
```

---

## 6. Comentarios

### Explican POR QUÉ, no QUÉ

```typescript
// ❌ El código ya lo dice
// Get order by id
const order = await OrdersRepository.findById(id);

// ✅ Explica la decisión
// ponytail: in-memory Map for refresh tokens. Switch to Redis if we scale beyond 1 instance.
const REFRESH_TOKENS = new Map();

// ✅ Advierte
// WARNING: esta query no tiene índice. No usar en reportes de alto tráfico.
const allOrders = await db.select().from(orders);
```

### Prohibido

- Código comentado (Git tiene la historia)
- TODOs sin issue ID
- Comentarios redundantes

---

## 7. Exports

### Named exports siempre. No default exports.

```typescript
export class AppError extends Error { ... }   // ✅
export function cn(...inputs: ClassValue[]) { ... }  // ✅

export default function MyComponent() { ... }  // ❌
```

### No barrel exports (index.ts que re-exporta todo)

```typescript
// ❌ components/index.ts
export { Button } from './Button';
export { Card } from './Card';

// ✅ Importar directamente
import { Button } from '@/components/ui/Button';
```

---

## 8. Imports

### No imports relativos más allá de `../../`

```typescript
import { AppError } from '../../../shared/errors';  // ❌
import { AppError } from '@server/shared/errors';   // ✅ path alias
```

### No `import *` para iconos

```typescript
import * as Icons from 'lucide-react';  // ❌
import { Send, Trash2 } from 'lucide-react';  // ✅
```

---

## 9. Estilo

### Usar backticks para strings con interpolación

```typescript
const url = '/api/orders/' + id;                 // ❌
const url = `/api/orders/${id}`;                  // ✅
```

### Preferir const sobre let

```typescript
let order = await fetchOrder(id);  // ❌ si no se reasigna
const order = await fetchOrder(id);  // ✅
```

### No console.log en producción

```typescript
console.log('Order created:', order);  // ❌
logger.info({ orderId: order.id }, 'Order created');  // ✅
```

---

## 10. React específico

### Early returns para estados

```typescript
function OrdersPage() {
  const { data, isLoading, isError, error, refetch } = useQuery(...);

  if (isLoading) return <OrdersSkeleton />;
  if (isError) return <ErrorAlert message={error.message} onRetry={refetch} />;
  if (!data?.length) return <EmptyState icon={ClipboardList} title="Sin órdenes" />;

  return <div>{data.map(order => <OrderCard key={order.id} order={order} />)}</div>;
}
```

### cn() para clases condicionales. Nunca concatenación de strings.

```typescript
className={`px-4 ${isActive ? 'bg-primary' : ''}`}         // ❌
className={cn('px-4', isActive && 'bg-primary')}            // ✅
```

### Tailwind classes solamente. No inline styles ni CSS modules.

---

## 11. Express específico

### Controller → Service → Repository. Nunca saltar capas.

```typescript
// ❌ Controller accediendo a DB directamente
router.post('/', async (req, res) => {
  const [order] = await db.insert(orders).values(req.body).returning(); // NO
  res.json(order);
});

// ✅ Controller → Service → Repository
router.post('/', async (req, res) => {
  const input = CreateOrderSchema.parse(req.body);
  const order = await OrdersService.create(req.user.id, req.user.restaurantId, input);
  res.status(201).json({ data: order });
});
```

### restaurant_id en TODA query

```typescript
// ❌
const orders = await db.select().from(orders).where(eq(orders.status, 'in_kitchen'));

// ✅
const orders = await db.select().from(orders).where(
  and(eq(orders.restaurantId, restaurantId), eq(orders.status, 'in_kitchen'))
);
```

---

## 12. Convenciones de archivos

```
Componentes:   PascalCase.tsx       OrderCard.tsx
Hooks:         camelCase.ts         useOrderAge.ts
Utilidades:    camelCase.ts         formatCurrency.ts
Schemas:       <module>.schema.ts   orders.schema.ts
Tests:         <file>.test.ts       orders.service.test.ts
```

---

## Checklist de PR

- [ ] Nombres de variables/métodos/clases revelan intención
- [ ] Métodos < 30 líneas
- [ ] Archivos < 300 líneas
- [ ] No `any`, no `React.FC`, no enums, no default exports
- [ ] Early returns en condicionales
- [ ] Controller → Service → Repository. Sin saltos.
- [ ] `restaurant_id` en toda query
- [ ] No console.log, no código comentado
- [ ] Tailwind classes con cn(). Sin inline styles.
- [ ] Early returns para isLoading/isError/!data en React
- [ ] Tests co-ubicados con extensión `.test.ts`
