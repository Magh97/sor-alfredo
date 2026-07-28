# API

Base: `http://localhost:3000/api`

Standard headers: `Authorization: Bearer <jwt>` (except login).

Response format:
- Success: `{ data: T }` or `{ data: T[], meta: { page, pageSize, totalItems, totalPages } }`
- Error: `{ error: { code: string, message: string, details?: [{ field, reason }] } }`

Pagination: `?page=1&pageSize=20` (max 100).

---

## Auth

| Method | Path | Auth | Request Body | Response |
|--------|------|------|-------------|----------|
| POST | `/api/auth/login` | — | `{ email: string, password: string }` | `200 { token, refreshToken, user }` |
| POST | `/api/auth/refresh` | JWT | `{ refreshToken: string }` | `200 { token }` |

---

## Orders

| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| GET | `/api/orders` | JWT | `?page=1&pageSize=20&status=in_kitchen&tableId=5` | `200 PaginatedResponse<Order>` |
| POST | `/api/orders` | JWT | `{ tableId: int, items: [{ productId: int, quantity: int, modifiers?: [{ modifierId: int, quantity: int }] }] }` | `201 Order` |
| GET | `/api/orders/:id` | JWT | — | `200 Order` (with items[], modifiers[]) |
| PUT | `/api/orders/:id` | JWT | `{ items: [{ productId: int, quantity: int, modifiers?: [...] }] }` | `200 Order` |
| POST | `/api/orders/:id/send-to-kitchen` | JWT | — | `200 Order` |
| PUT | `/api/orders/:id/invoice` | JWT | — | `200 { invoice }` |
| POST | `/api/orders/:id/payment` | JWT | `{ amount: decimal, paymentMethod: cash|card|transfer, tipAmount?: decimal }` | `201 { payment, receipt }` |
| DELETE | `/api/orders/:id/items/:itemId` | JWT | — | `200 Order` |

---

## Tables

| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| GET | `/api/tables` | JWT | `?status=occupied` | `200 Table[]` |
| POST | `/api/tables` | admin | `{ number: int, name?: string, capacity?: int, positionX?: int, positionY?: int }` | `201 Table` |
| PUT | `/api/tables/:id` | admin | `{ name?, capacity?, positionX?, positionY? }` | `200 Table` |
| PUT | `/api/tables/:id/status` | JWT | `{ status: free|occupied|reserved|cleaning }` | `200 Table` |
| POST | `/api/tables/:id/transfer` | JWT | `{ targetTableId: int }` | `200 Order` |

---

## Catalog

| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| GET | `/api/catalog/products` | JWT | `?categoryId=2&search=pasta&available=true` | `200 Product[]` |
| POST | `/api/catalog/products` | admin | `{ name, description?, basePrice, categoryId?, imageUrl?, modifierIds?: int[] }` | `201 Product` |
| PUT | `/api/catalog/products/:id` | admin | `{ name?, description?, basePrice?, categoryId?, isAvailable? }` | `200 Product` |
| GET | `/api/catalog/categories` | JWT | — | `200 Category[]` |
| POST | `/api/catalog/categories` | admin | `{ name: string, sortOrder?: int }` | `201 Category` |
| GET | `/api/catalog/modifiers` | JWT | `?productId=5` | `200 Modifier[]` |
| POST | `/api/catalog/modifiers` | admin | `{ name: string, priceAdjustment?: decimal, productIds?: int[] }` | `201 Modifier` |
| PUT | `/api/catalog/modifiers/:id` | admin | `{ name?, priceAdjustment?, isAvailable? }` | `200 Modifier` |

---

## Users

| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| GET | `/api/users` | admin | `?role=waiter&isActive=true` | `200 User[]` |
| POST | `/api/users` | admin | `{ name, email, password, role }` | `201 User` |
| PUT | `/api/users/:id` | admin | `{ name?, email?, role?, isActive? }` | `200 User` |
| DELETE | `/api/users/:id` | admin | — | `200 User` (isActive=false) |

---

## Cash Register

| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| POST | `/api/cash-register/open` | cashier | `{ initialAmount: decimal }` | `201 CashRegister` |
| POST | `/api/cash-register/close` | cashier | — | `200 { report }` |
| GET | `/api/cash-register/current` | cashier | — | `200 CashRegister` (with payments[]) |
| GET | `/api/cash-register/history` | admin | `?from=YYYY-MM-DD&to=YYYY-MM-DD` | `200 CashRegister[]` |
| GET | `/api/tips` | admin | `?userId=3&from=YYYY-MM-DD&to=YYYY-MM-DD` | `200 TipDistribution[]` |

---

## Reports

| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| GET | `/api/reports/sales` | admin | `?from=YYYY-MM-DD&to=YYYY-MM-DD&groupBy=day|week|month` | `200 SalesReport` |
| GET | `/api/reports/top-products` | admin | `?from=YYYY-MM-DD&to=YYYY-MM-DD&limit=10` | `200 TopProduct[]` |
| GET | `/api/reports/orders-by-user` | admin | `?from=YYYY-MM-DD&to=YYYY-MM-DD` | `200 UserPerformance[]` |

---

## WebSocket Events

Connection: `ws://localhost:3000` (Socket.io, shared HTTP server).

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `order:new` | Server → KDS | `Order` | New order sent to kitchen display |
| `order:updated` | Server → KDS | `{ orderId: int, newItems: OrderItem[] }` | Additional items on active order |
| `order:cancelled` | Server → KDS | `{ orderId: int }` | Waiter cancelled order before preparation |
| `order:ready` | KDS → Server | `{ orderId: int }` | Cook marks order as ready |
| `order:status-changed` | Server → Waiter | `{ orderId: int, status: order_status }` | Status update notification |

---

## Error Codes

| Code | HTTP | Meaning |
|------|------|---------|
| `VALIDATION_ERROR` | 400 | Invalid or missing required fields |
| `UNAUTHORIZED` | 401 | Missing/invalid/expired token |
| `FORBIDDEN` | 403 | Role lacks permission |
| `NOT_FOUND` | 404 | Resource does not exist |
| `CONFLICT` | 409 | Business rule violation (invalid state transition, duplicate) |
| `TABLE_OCCUPIED` | 409 | Table already has an active order |
| `ORDER_CLOSED` | 409 | Order is closed, not modifiable |
| `PRODUCT_UNAVAILABLE` | 400 | Product is_available=false |
| `CASH_REGISTER_ALREADY_OPEN` | 409 | Cash register already open for this shift |
| `CASH_REGISTER_NOT_OPEN` | 409 | No open cash register to record payment |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
