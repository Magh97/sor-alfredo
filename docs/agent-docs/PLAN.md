# PLAN

Build order for Alfredo's. Follow phase sequence. Dependencies must resolve before proceeding.

## Phases

| # | Phase | Goal | DB Tables Added | Backend Files | Frontend Files |
|---|-------|------|-----------------|---------------|----------------|
| 0 | Scaffold | `docker compose up` → health check | All (skeleton) | 12 | 12 |
| 1 | Auth + Users + Layouts | Login, JWT, role guards, 4 layouts | users, restaurants | 8 | 7 |
| 2 | Catalog | Admin CRUD: products, categories, modifiers | categories, products, modifiers, product_modifiers | 4 | 6 |
| 3 | Tables + Orders | Waiter creates order → sends to kitchen | tables, orders, order_items, order_item_modifiers | 8 | 12 |
| 4 | KDS | Kitchen display real-time, dark theme | — | 1 | 5 |
| 5 | Cash + Payments | Cash register, payment registration, tips | cash_registers, payments, tip_distributions | 5 | 7 |
| 6 | Reports | Sales, top products, waiter performance | audit_logs | 4 | 5 |
| 7 | Polish + Deploy | Anti-slop, animations, E2E, production deploy | — | — | — |

## Phase 0 — Scaffold

### Root configs
```
package.json              workspaces: ["server","client"], scripts: dev, build, test, lint, typecheck, db:generate, db:migrate, db:seed
tsconfig.base.json        target:ES2022, module:NodeNext, strict:true, noUncheckedIndexedAccess:true
.env.example              6 vars: DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, CORS_ORIGIN, PORT, NODE_ENV
.gitignore                node_modules, dist, .env, *.log
docker-compose.yml        3 services: postgres(18-alpine), server(hot-reload), client(Vite HMR)
```

### Server scaffold
```
server/package.json       deps: express@5, cors, helmet, jsonwebtoken, bcryptjs, zod, drizzle-orm, pg, dotenv
                          dev: typescript, @types/*, drizzle-kit, tsx, vitest, supertest, testcontainers
server/tsconfig.json      extends ../tsconfig.base.json, paths: @server/*
server/drizzle.config.ts  schema: src/db/schema.ts, out: drizzle, dialect: postgresql
server/Dockerfile         multi-stage: build(tsc) → production(alpine, appuser, HEALTHCHECK)
server/Dockerfile.dev     node:24-alpine, npm ci, CMD npm run dev
```

### Server source files
```
server/src/index.ts       createServer(app) + Socket.io + graceful shutdown(SIGTERM/SIGINT)
server/src/app.ts         cors, helmet, json, auth routes, module routes, error handler
server/src/db/schema.ts   14 tables + 7 enums (Drizzle). All tables include restaurant_id.
server/src/db/index.ts    drizzle(postgres) instance + pool
server/src/db/seed.ts     1 restaurant(id=1), 3 users(admin/waiter/cashier), 10 tables, 4 categories, 20 products, 5 modifiers
server/src/shared/errors.ts            AppError class: code, message, statusCode, details, toJSON()
server/src/shared/middleware/error-handler.ts  catch → AppError.toJSON() or 500
server/src/shared/middleware/auth.ts            requireAuth (JWT verify → req.user), requireRole(...roles)
server/src/shared/middleware/validate.ts        validate(schema) middleware: Zod parse → next or 400
server/src/shared/pagination.ts                 paginate(query) helper: { page, pageSize, offset, limit }
server/src/shared/db-helpers.ts                 whereRestaurant(table, restaurantId): SQL
```

### Client scaffold
```
client/package.json       deps: react@19, react-dom@19, react-router-dom@7, @tanstack/react-query, socket.io-client, lucide-react, cva, clsx, tailwind-merge
                          dev: typescript, vite, @vitejs/plugin-react, tailwindcss@4, @tailwindcss/vite, vitest, @testing-library/*, jsdom, msw, playwright
client/tsconfig.json      extends ../tsconfig.base.json, paths: @/*
client/vite.config.ts     react plugin, tailwind plugin, server proxy: /api→:3000, /socket.io→:3000 (ws)
client/index.html         root div, meta viewport, font links: Playfair Display, JetBrains Mono, DM Sans, Caveat
client/Dockerfile         multi-stage: vite build → nginx:1.29-alpine, HEALTHCHECK
client/Dockerfile.dev     node:24-alpine, npm ci, CMD npm run dev
client/nginx.conf         SPA fallback, /api/ proxy→server:3000, /socket.io/ ws proxy, /assets/ immutable cache
```

### Client source files
```
client/src/main.tsx                 ReactDOM.createRoot, RouterProvider, QueryClientProvider
client/src/styles/index.css         @tailwind base/components/utilities, @font-face 4 fonts, Victorian tokens
client/src/lib/utils.ts             cn(clsx+tailwind-merge), formatCurrency(Intl.NumberFormat MXN), formatTime, cardRotation
client/src/lib/api.ts               fetch wrapper: base URL, JWT interceptor (Bearer), refresh on 401
client/src/lib/constants.ts         ORDER_STATUS, TABLE_STATUS, ROLES, PAYMENT_METHODS (as const arrays)
```

### CI/CD
```
.github/workflows/ci.yml
  PR→main: lint, typecheck, test-server(postgres service), test-client
  push→main: + test:e2e(Playwright chromium), docker build, Trivy scan, Cosign sign, push ghcr.io, deploy-staging, deploy-prod(manual)
```

### Result
`docker compose up` → PostgreSQL:5432, API :3000 (`/api/health` returns 200), Frontend :5173 (blank). No routes yet.

---

## Phase 1 — Auth + Users + Layouts

### Backend: auth module + users module
```
server/src/modules/auth/auth.schema.ts       LoginSchema { email:z.string().email(), password:z.string() }, RefreshSchema { refreshToken:z.string() }
server/src/modules/auth/auth.service.ts       login(email,password) → bcrypt compare → jwt.sign({userId,role,restaurantId}, JWT_SECRET, 8h) + refresh token(7d). refresh(token) → verify + issue new access.
server/src/modules/auth/auth.controller.ts    POST /api/auth/login, POST /api/auth/refresh
server/src/modules/users/users.schema.ts      CreateUserSchema, UpdateUserSchema, UserResponse
server/src/modules/users/users.repository.ts  findAll(restaurantId, filters), findById, create, update, softDelete
server/src/modules/users/users.service.ts     create: hash password, validate unique email. update: optional password change.
server/src/modules/users/users.controller.ts  GET /api/users (admin), POST /api/users (admin), PUT /api/users/:id (admin), DELETE /api/users/:id (admin)
```

### Frontend: login + layouts + users page
```
client/src/hooks/useAuth.ts              useQuery login → store token in memory, auto-refresh interceptor
client/src/app/login/page.tsx            Centered paper card (bg-surface, border 4px primary, clip-path irregular). Title: Playfair Display 900 hero-size. Email + password inputs (JetBrains Mono). Submit: Sans Bold uppercase.
client/src/components/layout/SidebarLayout.tsx   w-64 bg-surface, border-r border-primary. Nav items DM Sans bold 14px uppercase. UserMenu footer.
client/src/components/layout/BottomNavLayout.tsx  h-14 header + flex-1 main + h-16 bottom nav. Min 48px touch targets. bg-surface.
client/src/components/layout/KDSLayout.tsx        h-screen bg-kds-bg, cursor:none, onMount→requestFullscreen()+wakeLock
client/src/app/admin/users/page.tsx               Table: name, email, role badge, active toggle. Create/edit modal.
client/src/components/shared/StatusBadge.tsx       Role badges: waiter=accent, cashier=info, admin=primary
```

### Result
Login with `cajero1@restaurant.com` / `password123` → redirects to role-based route. 4 layouts render correctly. Admin can CRUD users.

---

## Phase 2 — Catalog

### Backend: catalog module
```
server/src/modules/catalog/catalog.schema.ts      CreateProductSchema, UpdateProductSchema, CreateCategorySchema, CreateModifierSchema
server/src/modules/catalog/catalog.repository.ts   findAllProducts(restaurantId, filters), findById, create, update. Same pattern for categories, modifiers. Product → modifier join via product_modifiers.
server/src/modules/catalog/catalog.service.ts      createProduct: validate category exists, basePrice>0. createModifier: validate name unique per restaurant.
server/src/modules/catalog/catalog.controller.ts   GET/POST /api/catalog/products, PUT /api/catalog/products/:id
                                                   GET/POST /api/catalog/categories
                                                   GET/POST/PUT /api/catalog/modifiers
```

### Frontend: admin catalog page
```
client/src/app/admin/catalog/page.tsx             Tabs: Products | Categories | Modifiers. Tab style: DM Sans bold 14px uppercase, active=bg-primary text-primary-foreground.
client/src/components/catalog/ProductForm.tsx      Modal: name(Playfair Display 700, 36px), price(JetBrains Mono 700, 24px, forest-green), category select, modifier multi-select, description(textarea)
client/src/components/catalog/CategoryList.tsx     Sortable list, inline edit
client/src/components/catalog/ModifierList.tsx     Name + price adjustment + available toggle
client/src/components/shared/SearchBar.tsx         Input with search icon, JetBrains Mono, debounced
client/src/components/shared/EmptyState.tsx         Script font(Caveat), centered: "Esta hoja está en blanco. El primer trazo es el más importante."
```

### Result
Admin creates categories, products, modifiers. Products appear in catalog. Search by name works (GIN index).

---

## Phase 3 — Tables + Orders

### Backend: tables module
```
server/src/modules/tables/tables.schema.ts        CreateTableSchema, UpdateTableSchema, ChangeStatusSchema
server/src/modules/tables/tables.repository.ts     findAll, findById, create, update, updateStatus
server/src/modules/tables/tables.service.ts        create: validate number unique per restaurant. changeStatus: validate transition.
server/src/modules/tables/tables.controller.ts     GET /api/tables, POST /api/tables(admin), PUT /api/tables/:id(admin), PUT /api/tables/:id/status, POST /api/tables/:id/transfer
```

### Backend: orders module
```
server/src/modules/orders/orders.schema.ts        CreateOrderSchema { tableId, items:[{productId, quantity, modifiers?:[{modifierId,quantity}]}] }
                                                   AddItemsSchema, InvoiceSchema
server/src/modules/orders/orders.repository.ts     findAll(filters, pagination), findById(with items.modifiers.modifier, table, user), create(transaction: order+items+modifiers), addItems, updateStatus, cancelItem, calculateTotals
server/src/modules/orders/orders.service.ts        STATE_MACHINE: draft→in_kitchen, in_kitchen→ready, ready→delivered, delivered→paid|partially_paid, partially_paid→paid, paid→closed
                                                   createOrder: validate table free, freeze unit_price, calc subtotals, update table→occupied
                                                   sendToKitchen: validate draft→in_kitchen, emit 'order:new'
                                                   addItems: validate status in [in_kitchen,ready], emit 'order:updated'
                                                   cancelItem: validate before in_kitchen, recalc total
                                                   generateInvoice: return order+items total with frozen prices
server/src/modules/orders/orders.controller.ts     GET /api/orders(?status,tableId,page,pageSize), POST /api/orders, GET /api/orders/:id
                                                   PUT /api/orders/:id (add items), POST /api/orders/:id/send-to-kitchen
                                                   DELETE /api/orders/:id/items/:itemId, PUT /api/orders/:id/invoice
```

### Frontend: mesero pages
```
client/src/app/mesero/orders/page.tsx              Header + order list. Loading=textile shimmer card. Empty="Ninguna orden activa. ¿Un café para empezar?". Error="El tintero se ha volcado." + retry.
client/src/app/mesero/tables/page.tsx              Grid of tables. Each: status color border (free=green, occupied=burgundy, reserved=gold, cleaning=navy), number(JetBrains Mono), capacity. Tap→create order or view active.
client/src/components/orders/OrderCard.tsx          Compound: Card.Header(mesa+time+StatusBadge), Card.Body(items list), Card.Footer(total+Mono Grotesk+action btn)
client/src/components/orders/NewOrderSheet.tsx      Slide-up sheet (touch). Step 1: select products by category tabs. Step 2: modifier picker per item. Step 3: review + send.
client/src/components/orders/ProductSelector.tsx    Grid 2-col, ProductCard: name(Playfair Display), price(JetBrains Mono, forest green), tap→add
client/src/components/orders/ModifierPicker.tsx     Checkboxes in Caveat script font, 16px, indented. Price adjustment inline.
client/src/components/orders/OrderDetailSheet.tsx   Full order detail: items+modifiers, total, actions(add items, send, cancel item)
client/src/components/tables/TableMap.tsx           CSS Grid, each table positioned via inline style(position_x,position_y). Free layout.
client/src/components/tables/TableButton.tsx        Card with status border, number(JetBrains Mono 32px), capacity label. cardRotation(index) for 1-2° tilt.
client/src/hooks/useOptimisticOrder.ts             Mutation: onMutate→update cache, onError→rollback, onSettled→invalidate
client/src/hooks/useSocket.ts                      Socket.io client: connect on mount, listen order:status-changed, update query cache
client/src/components/shared/Skeleton.tsx          Textile shimmer: bg-gradient-to-r from-surface via-accent/20 to-surface animate-shimmer. Variants: card(140px), row(56px), kds(280px).
```

### Result
Waiter on tablet: sees tables → taps occupied table → sees active order or creates new → selects products → picks modifiers → reviews → sends → order appears in KDS pipeline.

---

## Phase 4 — KDS

### Backend: kds module
```
server/src/modules/kds/kds.handler.ts              Socket.io event handlers registered in index.ts.
                                                   order:ready → validate in_kitchen→ready → update DB → emit order:status-changed to waiter
                                                   order:cancelled → remove from active orders set
                                                   On server boot: no extra routes. Events only.
```

### Frontend: KDS screen
```
client/src/app/kds/page.tsx                       On mount: socket.connect(), requestFullscreen(), wakeLock. Render grid.
client/src/components/kds/KDSHeader.tsx            Sticky header h-20 bg-kds-surface. Left: "Alfredo's Cocina" kds-lg. Right: clock(JetBrains Mono) + "N activas" counter.
client/src/components/kds/KDSOrderCard.tsx         Layout: top bar(order# Mono Grotesk 32px + mesa + timer), body(items list with modifiers), footer("LISTA" button kds size)
                                                   4 aging states via useOrderAge:
                                                     normal(<5min): border-kds-surface
                                                     attention(5-10min): border-accent animate-pulse
                                                     warning(10-15min): border-warning animate-pulse, AlertTriangle icon
                                                     critical(>15min): border-error animate-pulse bg-error/15, AlertTriangle icon
                                                   New order animation: slide-from-top+scale bounce+burgundy pulse 500ms
                                                   Done animation: slide-out-right+fade+scale-down 400ms
client/src/hooks/useOrderAge.ts                    useEffect + setInterval 10s: calc minutes since createdAt
```

### Result
KDS monitor (1920x1080): receives new orders, shows aging colors, cook taps "LISTA" → waiter notified. Full dark theme.

---

## Phase 5 — Cash + Payments

### Backend: cash module
```
server/src/modules/cash/cash.schema.ts             OpenRegisterSchema { initialAmount }, PaymentSchema { amount, paymentMethod, tipAmount? }
server/src/modules/cash/cash.repository.ts          findActiveRegister, openRegister, closeRegister, createPayment, findTips
server/src/modules/cash/cash.service.ts             openRegister: validate no active register. closeRegister: aggregate payments+totals, update status=closed, return report. registerPayment: validate order status delivered|partially_paid, calculate change, distribute tips(equal→split among waiter+cashier, individual→all to waiter), update order status(paid→closed, partially_paid→paid), emit status change. generateReceipt: format order+payment data.
server/src/modules/cash/cash.controller.ts          POST /api/cash-register/open (cashier), POST /api/cash-register/close (cashier)
                                                    GET /api/cash-register/current (cashier), GET /api/cash-register/history (admin)
                                                    POST /api/orders/:id/payment (cashier), GET /api/tips (admin)
```

### Frontend: caja pages
```
client/src/app/caja/orders/page.tsx                Full table of all orders. Columns: #id, Mesa, Mesero, Status(badge), Total, Actions. Filter by status, search by table#. Each row→tap→PaymentForm.
client/src/app/caja/register/page.tsx              Summary cards: Total ventas, Total propinas, Pagos por método(cash/card/transfer). Open/Close buttons. History table below.
client/src/components/cash/PaymentForm.tsx          Modal: order summary(items+total), method select(3 buttons), amount input, tip input, total with change calculation. Submit→receipt preview.
client/src/components/cash/CashRegisterSummary.tsx  Cards: opened at, sales total(JetBrains Mono), tips total, payment count.
client/src/components/cash/InvoicePreview.tsx       Paper-style receipt: torn border top, order items, totals, timestamp. "Sellado." stamp effect (red circle irregular border).
client/src/components/cash/TipDistribution.tsx      Table: employee name, role, tip amount, distribution type.
client/src/components/cash/OrderTable.tsx           Searchable, filterable table. Actions column: "Pagar" button.
```

### Result
Cashier opens register, processes payments throughout shift, closes register → receives report. Tips distributed correctly.

---

## Phase 6 — Reports

### Backend: reports module
```
server/src/modules/reports/reports.schema.ts       ReportQuerySchema { from, to, groupBy?, limit? }
server/src/modules/reports/reports.repository.ts    salesByPeriod: SUM(amount) GROUP BY date_trunc. topProducts: COUNT+SUM GROUP BY product. ordersByUser: COUNT+SUM GROUP BY user. cashHistory: select cash_registers.
server/src/modules/reports/reports.service.ts       Format numbers, calculate percentages, generate CSV string.
server/src/modules/reports/reports.controller.ts    GET /api/reports/sales, GET /api/reports/top-products, GET /api/reports/orders-by-user
```

### Frontend: admin reports page
```
client/src/app/admin/reports/page.tsx              Tabs: Ventas | Productos | Meseros | Caja
                                                    Date range picker (2 inputs, JetBrains Mono)
                                                    Sales tab: bar chart CSS-only (div heights proportional)
                                                    Products tab: ranked table, name+count+revenue
                                                    Meseros tab: table name+orders+total+avg
                                                    Export CSV button on each tab
client/src/components/reports/SalesChart.tsx        Pure CSS bar chart. Bars: bg-primary, height based on value ratio. Labels: JetBrains Mono.
client/src/components/reports/RankedTable.tsx       Numbered rows. Rank# in JetBrains Mono 700. Name in Playfair Display. Values in JetBrains Mono forest green.
```

### Result
Admin views dashboards, filters by date range, exports CSV.

---

## Phase 7 — Polish + Deploy

### Anti-slop checklist (every screen)
```
Loading:   Skeleton with textile shimmer. 3 variants. NEVER spinner.
Empty:     Script font(Caveat), centered, poetic. NEVER "No data found".
Error:     "El tintero se ha volcado." + ink stain SVG. NEVER "Something went wrong".
Colors:    No black(#000), no white(#fff), no purple gradients, no generic grays.
Borders:   0px radius or clip-path irregular. No rounded corners.
Shadows:   espresso tint only. No black shadows.
Fonts:     4-font collage per rules. No single-font pages.
Card grid: cardRotation(index) on mesero views.
KDS:       All text JetBrains Mono or DM Sans bold. No system-ui.
```

### Animations
```
Micro:     150-200ms ease-out. Button hover scale(1.02), press scale(0.97).
Page:      300-400ms cubic-bezier(0.4,0,0.2,1). Stagger children 50ms.
Modal:     scale(0.92)→1 + fade + overshoot, 300ms.
KDS new:   slide+scale+bounce+burgundy pulse, 500ms.
KDS done:  slide-out-right+fade+scale-down, 400ms.
prefers-reduced-motion: disable all.
```

### Accessibility
```
Touch:     min 48x48px (mesero). min 36x36px (desktop).
Focus:     visible ring primary 2px (desktop).
ARIA:      aria-label on icon buttons. aria-live polite on status changes. aria-live assertive on KDS new orders.
Roles:     role="button" on custom controls. role="listbox" on selects.
```

### E2E (Playwright)
```
test: login → create order with 2 items+modifiers → send to kitchen
test: KDS receives order, marks ready → waiter sees status change
test: cashier opens register → processes payment → closes register
test: admin creates product → waiter sees it in catalog
test: reports load with correct date range
```

### Deploy pipeline
```
Staging:  auto on push to main → docker build → trivy scan → cosign sign → push ghcr.io → deploy → smoke(health+login+order)
Prod:     manual approval → same flow → verify KDS real-time works
```

## Architecture constraints (every phase)

```
ALWAYS:  Controller→Service→Repository. Never skip layers.
ALWAYS:  Zod validation in controller layer (schema.parse before service call).
ALWAYS:  restaurant_id filter on every query. whereRestaurant() helper.
ALWAYS:  NUMERIC(19,4) for money. TIMESTAMPTZ for dates.
ALWAYS:  Early returns: isLoading→Skeleton, isError→ErrorAlert, !data→EmptyState.
ALWAYS:  Named exports. No default exports. No React.FC.
ALWAYS:  Co-located tests: <file>.test.ts.
ALWAYS:  cn() for classes. formatCurrency() for money. formatTime() for timestamps.
NEVER:   any type. console.log. inline styles. barrel imports. raw SQL in services.
NEVER:   spinner. "No data found". "Something went wrong". black(#000). white(#fff).
```

## Module file checklist (per module)

```
server/src/modules/<name>/
  <name>.schema.ts       Zod: Create/Update/Response schemas
  <name>.repository.ts   Drizzle: all DB queries, returns entities
  <name>.service.ts      Business logic, state machine, validations
  <name>.controller.ts   Express Router, handlers
  __tests__/
    <name>.service.test.ts
    <name>.controller.test.ts
```

## Key env vars

```
DATABASE_URL=postgresql://sor_user:sor_pass@localhost:5432/sor
JWT_SECRET=<openssl rand -hex 32>
JWT_REFRESH_SECRET=<openssl rand -hex 32>
CORS_ORIGIN=http://localhost:5173
PORT=3000
NODE_ENV=development
```
