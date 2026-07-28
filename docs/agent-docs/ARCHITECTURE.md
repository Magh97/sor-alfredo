# ARCHITECTURE

## Dependency Graph

```
React SPA ──REST/JSON──► Express API ──► PostgreSQL
React SPA ──WebSocket──► Socket.io
KDS Screen ──WebSocket─► Socket.io (bidirectional)
Express API ◄──emit────► Socket.io (shared HTTP server :3000)
```

## Server Modules

Location: `server/src/modules/`

| Module | Path | Responsibility | Depends On |
|--------|------|---------------|------------|
| **orders** | `orders/` | CRUD orders, state machine, send-to-kitchen, invoice generation | tables, catalog, kds (events) |
| **tables** | `tables/` | CRUD tables, status changes, transfer orders between tables | orders |
| **catalog** | `catalog/` | CRUD products, categories, modifiers | — |
| **users** | `users/` | CRUD users, auth (login, refresh token), role management | — |
| **cash** | `cash/` | Payment registration, cash register open/close, tip distribution | orders, users |
| **reports** | `reports/` | Sales by period, top products, user performance | orders, cash |
| **kds** | `kds/` | Socket.io event handlers, order aging calculation, real-time dispatch | orders |
| **shared** | `../shared/` | Auth middleware (`requireAuth`, `requireRole`), error handler, pagination helper, `AppError` base class | — |

## Client Routes

Location: `client/src/app/`

| Route | Layout | User | Nav Items |
|-------|--------|------|-----------|
| `/mesero` | BottomNavLayout | Mesero | Ordenes, Mesas, Perfil |
| `/mesero/orders` | BottomNavLayout | Mesero | Order list + create flow |
| `/mesero/tables` | BottomNavLayout | Mesero | TableMap grid |
| `/caja` | SidebarLayout | Cajero | Ordenes, Caja, Reportes |
| `/caja/orders` | SidebarLayout | Cajero | All orders table + payment flow |
| `/caja/register` | SidebarLayout | Cajero | Cash register open/close/current |
| `/admin` | SidebarLayout | Admin | Catalogo, Usuarios, Reportes, Config |
| `/admin/catalog` | SidebarLayout | Admin | Products + categories + modifiers CRUD |
| `/admin/users` | SidebarLayout | Admin | Users table + create/edit modal |
| `/admin/reports` | SidebarLayout | Admin | Sales, top products, performance |
| `/kds` | KDSLayout (fullscreen dark) | — | Order grid, header with clock + counters |
| `/login` | Centered card | — | Email + password form |

## Data Flow (Main Use Case)

```
1. POST /api/orders
   Controller → orders.schema (validate) → orders.service (createOrder)
     → calc totals, validate products available, validate table not occupied
     → orders.repository (INSERT Order + OrderItems)
     → Socket.io emit 'order:new' → KDS receives

2. Socket.io 'order:ready'
   KDS → Server → orders.service (markReady)
     → validate status=in_kitchen → UPDATE status=ready
     → Socket.io emit 'order:status-changed' → Mesero receives

3. POST /api/orders/:id/payment
   Controller → orders.schema (validate) → cash.service (registerPayment)
     → validate order status, cash register open
     → cash.repository (INSERT Payment + TipDistributions)
     → orders.repository (UPDATE status=paid→closed)
     → return { payment, receipt }

4. POST /api/cash-register/close
   Controller → cash.service (closeRegister)
     → aggregate payments, tips
     → cash.repository (UPDATE status=closed, totals)
     → return { report }
```

## Order State Machine

```
draft ──► in_kitchen ──► ready ──► delivered ──► paid ──► closed
                                       │
                                       └──► partially_paid ──► paid
```

Valid transitions enforced in `orders.service.ts`:
- `draft → in_kitchen`: `sendToKitchen()`
- `in_kitchen → ready`: `markReady()` (via KDS event)
- `ready → delivered`: `markDelivered()`
- `delivered → paid`: `registerPayment()` (via cash module)
- `delivered → partially_paid`: `registerPartialPayment()`
- `partially_paid → paid`: `registerPayment()`
- `paid → closed`: auto on payment completion
- Any → throw CONFLICT if transition invalid

## Component Tree (Key Screens)

```
App
├── LoginPage
├── MeseroLayout
│   ├── BottomNav (Orders | Tables | Profile)
│   ├── OrdersPage
│   │   ├── OrderCard[] (compound: Header, Body, Footer)
│   │   │   └── StatusBadge
│   │   └── OrderDetailSheet
│   │       ├── OrderItemRow[]
│   │       ├── ProductSelector
│   │       │   ├── SearchBar
│   │       │   ├── CategoryTab[]
│   │       │   └── ProductCard[]
│   │       └── ModifierPicker
│   └── TablesPage
│       └── TableMap
│           └── TableButton[]
├── SidebarLayout (Cajero & Admin)
│   ├── Sidebar (nav items)
│   ├── Header (UserMenu)
│   └── Content (per-page)
│       ├── OrdersPage (cajero: full table + PaymentForm)
│       ├── CashRegisterPage
│       │   ├── SummaryCards
│       │   └── PaymentForm (for closing)
│       ├── CatalogPage (admin: CRUD tables)
│       └── UsersPage (admin: CRUD table)
└── KDSLayout
    ├── KDSHeader (clock, counters)
    └── KDSOrderCard[] (CSS Grid, dark theme)
        └── KDSOrderCard
            ├── Order number + Mesa + Timer
            ├── Item list
            └── "LISTA" button
```
