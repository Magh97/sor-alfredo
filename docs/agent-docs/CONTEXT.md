# CONTEXT

Read this first. It describes the project, stack, structure, and key entry points.

## Project

SOR — Sistema de Gestion de Ordenes para Restaurantes.
Digitaliza flujo mesa→orden→cocina→pago en restaurante de servicio a mesa.

## Actors & Devices

| Actor | Device | Access |
|-------|--------|--------|
| Mesero | Tablet 10", touch | Own orders, tables, catalog (read-only) |
| Cajero | PC Desktop | All orders, payments, cash register |
| Admin | PC Desktop | Full access: catalog, users, reports, config |
| KDS | 32" monitor, wall-mounted | No login. Displays incoming kitchen orders in real time |

## Stack

Node 24, Express 5, TypeScript, React 19, Vite, Tailwind 4.3, PostgreSQL 18, Drizzle, Socket.io, shadcn/ui, lucide-react, Space Grotesk, JWT Bearer auth.

See `STACK.md` for full version table.

## Repo Structure

```
sor/
├── server/src/          Express backend
│   ├── modules/         orders/ tables/ catalog/ users/ cash/ reports/ kds/
│   │   └── <module>/
│   │       ├── <module>.controller.ts
│   │       ├── <module>.service.ts
│   │       ├── <module>.repository.ts
│   │       └── <module>.schema.ts
│   ├── shared/          middleware, errors, pagination
│   ├── db/              Drizzle schema, migrations, seed
│   └── index.ts         Entry point, app setup
├── client/src/          React + Vite frontend
│   ├── app/             Routes: /mesero /caja /admin /kds /login
│   ├── components/
│   │   ├── ui/          shadcn/ui primitives
│   │   ├── orders/      OrderCard, ProductSelector, ModifierPicker
│   │   ├── tables/      TableMap
│   │   ├── cash/        PaymentForm, CashRegister
│   │   ├── kds/         KDSOrderCard
│   │   ├── layout/      SidebarLayout, BottomNavLayout
│   │   └── shared/      StatusBadge, EmptyState, ErrorAlert, SearchBar, UserMenu
│   ├── hooks/           useAuth, useOrders, useSocket, useOrderAge, useOptimisticOrder
│   └── lib/             utils (cn, formatCurrency, formatTime), api client
├── docs/                Full human documentation
│   ├── agent-docs/      Agent-optimized docs (these files)
│       ├── CONTEXT.md       <-- you are here
│       ├── STACK.md         Dependency versions
│       ├── RULES.md         Always/Never constraints
│       ├── ARCHITECTURE.md  Module dependency graph + routes + data flow
│       ├── SCHEMA.md        Database tables, enums, indexes
│       ├── API.md           All endpoints + WebSocket events
│       ├── PATTERNS.md      Reusable code patterns
│       ├── DESIGN.md        Design tokens, colors, typography, layouts
│       └── WORKFLOWS.md     Developer workflows
│   └── adr/             Architecture Decision Records (4 decisions)
├── docker-compose.yml
├── .env.example
└── README.md
```

## Key Files

| File | Purpose |
|------|---------|
| `server/src/index.ts` | Express app setup, middleware, route registration |
| `server/src/db/schema.ts` | Drizzle schema (source of truth for DB) |
| `server/src/shared/middleware/auth.ts` | JWT verification + role guards |
| `client/src/app/layout.tsx` | Root layout |
| `client/src/lib/utils.ts` | cn(), formatCurrency(), formatTime() |
| `docker-compose.yml` | Local dev environment (postgres + server + client) |
| `.env.example` | Required environment variables template |
| `docs/adr/` | Architecture Decision Records (4 ADRs: stack, auth, realtime, multi-sucursal) |

## Ports

| Service | Port |
|---------|------|
| Express API + Socket.io | 3000 |
| React Vite dev server | 5173 |
| PostgreSQL | 5432 |

## Read Order

1. `CONTEXT.md` (this file)
2. `STACK.md` → versions and dev-kits
3. `RULES.md` → constraints before editing
4. `ARCHITECTURE.md` → where things are
5. `SCHEMA.md` → data shape
6. `API.md` → contracts
7. `PATTERNS.md` → how to implement
8. `DESIGN.md` → visual tokens
9. `WORKFLOWS.md` → common tasks
