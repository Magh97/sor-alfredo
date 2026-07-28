# API Reference -- SOR

Base URL: `http://localhost:3000/api`

## Autenticacion

Todas las rutas excepto `POST /auth/login` requieren header:

```
Authorization: Bearer <jwt_token>
```

---

## Formato de Respuesta

### Exito (singular)

```json
{
  "data": {
    "id": 42,
    "status": "in_kitchen",
    "totalAmount": 450.00,
    "createdAt": "2026-07-28T15:30:00Z"
  }
}
```

### Exito (coleccion paginada)

```json
{
  "data": [ ... ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 87,
    "totalPages": 5
  }
}
```

### Error

```json
{
  "error": {
    "code": "ORDER_NOT_FOUND",
    "message": "La orden con ID 999 no existe",
    "details": [
      { "field": "orderId", "reason": "No se encontro ninguna orden con ese identificador" }
    ]
  }
}
```

---

## Auth

| Metodo | Ruta | Auth | Descripcion | Request Body | Response |
|--------|------|------|-------------|-------------|----------|
| POST | `/api/auth/login` | -- | Iniciar sesion | `{ email, password }` | `{ token, refreshToken, user }` |
| POST | `/api/auth/refresh` | JWT | Refrescar token | `{ refreshToken }` | `{ token }` |

---

## Ordenes

| Metodo | Ruta | Auth | Descripcion | Request / Params | Response |
|--------|------|------|-------------|-----------------|----------|
| GET | `/api/orders` | JWT | Listar ordenes | Query: `?page=1&pageSize=20&status=in_kitchen&tableId=5` | `PaginatedResponse<Order>` |
| POST | `/api/orders` | JWT | Crear orden | `{ tableId, items: [{ productId, quantity, modifiers?: [{ modifierId, quantity }] }] }` | `Order` (201) |
| GET | `/api/orders/:id` | JWT | Detalle de orden | Path: `id` | `Order` con `items` y `modifiers` |
| PUT | `/api/orders/:id` | JWT | Agregar items | `{ items: [{ productId, quantity, modifiers? }] }` | `Order` |
| POST | `/api/orders/:id/send-to-kitchen` | JWT | Enviar a cocina | -- | `Order` |
| PUT | `/api/orders/:id/invoice` | JWT | Generar cuenta | -- | `{ invoice }` |
| POST | `/api/orders/:id/payment` | JWT | Registrar pago | `{ amount, paymentMethod, tipAmount? }` | `{ payment, receipt }` (201) |
| DELETE | `/api/orders/:id/items/:itemId` | JWT | Cancelar item | Path: `id`, `itemId` | `Order` |

### Estados de Orden

```
draft → in_kitchen → ready → delivered → (partially_paid) → paid → closed
                                                              ↳ cancelled
```

---

## Mesas

| Metodo | Ruta | Auth | Descripcion | Request / Params | Response |
|--------|------|------|-------------|-----------------|----------|
| GET | `/api/tables` | JWT | Listar mesas | Query: `?status=occupied` | `Table[]` |
| POST | `/api/tables` | admin | Crear mesa | `{ number, name?, capacity?, positionX?, positionY? }` | `Table` (201) |
| PUT | `/api/tables/:id` | admin | Editar mesa | `{ name?, capacity?, positionX?, positionY? }` | `Table` |
| PUT | `/api/tables/:id/status` | JWT | Cambiar estado | `{ status }` | `Table` |
| POST | `/api/tables/:id/transfer` | JWT | Transferir orden | `{ targetTableId }` | `Order` |

### Estados de Mesa

```
free | occupied | reserved | cleaning
```

---

## Catalogo

| Metodo | Ruta | Auth | Descripcion | Request / Params | Response |
|--------|------|------|-------------|-----------------|----------|
| GET | `/api/catalog/products` | JWT | Listar platillos | Query: `?categoryId=2&search=pasta&available=true` | `Product[]` |
| POST | `/api/catalog/products` | admin | Crear platillo | `{ name, description?, basePrice, categoryId, imageUrl?, modifierIds? }` | `Product` (201) |
| PUT | `/api/catalog/products/:id` | admin | Modificar platillo | `{ name?, description?, basePrice?, categoryId?, isAvailable? }` | `Product` |
| GET | `/api/catalog/categories` | JWT | Listar categorias | -- | `Category[]` |
| POST | `/api/catalog/categories` | admin | Crear categoria | `{ name, sortOrder? }` | `Category` (201) |
| GET | `/api/catalog/modifiers` | JWT | Listar complementos | Query: `?productId=5` | `Modifier[]` |
| POST | `/api/catalog/modifiers` | admin | Crear complemento | `{ name, priceAdjustment, productIds? }` | `Modifier` (201) |
| PUT | `/api/catalog/modifiers/:id` | admin | Modificar complemento | `{ name?, priceAdjustment?, isAvailable? }` | `Modifier` |

---

## Usuarios

| Metodo | Ruta | Auth | Descripcion | Request / Params | Response |
|--------|------|------|-------------|-----------------|----------|
| GET | `/api/users` | admin | Listar usuarios | Query: `?role=waiter&isActive=true` | `User[]` |
| POST | `/api/users` | admin | Crear usuario | `{ name, email, password, role }` | `User` (201) |
| PUT | `/api/users/:id` | admin | Modificar usuario | `{ name?, email?, role?, isActive? }` | `User` |
| DELETE | `/api/users/:id` | admin | Desactivar usuario | -- | `User` (baja logica) |

### Roles

```
waiter | cashier | admin | superadmin
```

---

## Caja y Pagos

| Metodo | Ruta | Auth | Descripcion | Request / Params | Response |
|--------|------|------|-------------|-----------------|----------|
| POST | `/api/cash-register/open` | cashier | Abrir turno | `{ initialAmount }` | `CashRegister` (201) |
| POST | `/api/cash-register/close` | cashier | Cerrar turno | -- | `{ report }` |
| GET | `/api/cash-register/current` | cashier | Corte activo | -- | `CashRegister` con `payments` |
| GET | `/api/cash-register/history` | admin | Historico de cortes | Query: `?from=2026-07-01&to=2026-07-31` | `CashRegister[]` |
| GET | `/api/tips` | admin | Propinas por empleado | Query: `?userId=3&from=2026-07-01&to=2026-07-31` | `TipDistribution[]` |

### Metodos de Pago

```
cash | card | transfer
```

---

## Reportes

| Metodo | Ruta | Auth | Descripcion | Params | Response |
|--------|------|------|-------------|--------|----------|
| GET | `/api/reports/sales` | admin | Ventas por periodo | `?from=2026-07-01&to=2026-07-31&groupBy=day` | `SalesReport` |
| GET | `/api/reports/top-products` | admin | Productos mas vendidos | `?from=2026-07-01&to=2026-07-31&limit=10` | `TopProduct[]` |
| GET | `/api/reports/orders-by-user` | admin | Desempeno por mesero | `?from=2026-07-01&to=2026-07-31` | `UserPerformance[]` |

### Parametros de paginacion (comun a todas las listas)

| Parametro | Tipo | Default | Max |
|-----------|------|---------|-----|
| `page` | integer | 1 | -- |
| `pageSize` | integer | 20 | 100 |

---

## WebSocket -- Eventos del KDS

Conexion: `ws://localhost:3000` (Socket.io, mismo puerto HTTP)

| Evento | Direccion | Payload | Descripcion |
|--------|-----------|---------|-------------|
| `order:new` | Server → KDS | `Order` | Nueva orden enviada a cocina |
| `order:updated` | Server → KDS | `{ orderId, newItems: OrderItem[] }` | Items agregados a orden activa |
| `order:cancelled` | Server → KDS | `{ orderId }` | Mesero cancela orden en cocina |
| `order:ready` | KDS → Server | `{ orderId }` | Cocinero marca orden como lista |
| `order:status-changed` | Server → Mesero | `{ orderId, status }` | Notificacion de cambio de estado |

---

## Codigos de Error Comunes

| Codigo | Significado |
|--------|------------|
| `VALIDATION_ERROR` | Campos requeridos faltantes o invalidos |
| `UNAUTHORIZED` | Token ausente, invalido o expirado |
| `FORBIDDEN` | Rol sin permisos para esta accion |
| `NOT_FOUND` | Recurso no encontrado |
| `CONFLICT` | Violacion de regla de negocio |
| `TABLE_OCCUPIED` | La mesa ya tiene una orden activa |
| `ORDER_CLOSED` | La orden ya fue cerrada, no modificable |
| `PRODUCT_UNAVAILABLE` | El platillo no esta disponible |
| `CASH_REGISTER_ALREADY_OPEN` | Ya existe un turno de caja abierto |
| `CASH_REGISTER_NOT_OPEN` | No hay turno de caja abierto para registrar pago |
| `INTERNAL_ERROR` | Error inesperado del servidor |
