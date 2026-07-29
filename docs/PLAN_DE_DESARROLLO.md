# Plan de Desarrollo -- Alfredo's

> Stack: Node.js 24 + Express 5 + React 19 + PostgreSQL 18 + Socket.io
> Diseño: Victorian Brutalist (burgundy, paper textures, 4-font typography)
> Arquitectura: Controller-Service-Repository, 7 módulos backend, 4 actores

---

## Resumen de Fases

| Fase | Nombre | ¿Qué se logra? | Duración estimada |
|------|--------|----------------|-------------------|
| **0** | Scaffold | Proyecto ejecutable con `docker compose up` | Sesión 1 |
| **1** | Auth + Usuarios + Layouts | Login, JWT, 4 layouts funcionales, CRUD de usuarios | Sesión 2-3 |
| **2** | Catálogo | Admin crea menú completo (productos, categorías, modificadores) | Sesión 4 |
| **3** | Mesas + Órdenes | Mesero crea órdenes, envía a cocina, sigue estados | Sesión 5-7 |
| **4** | KDS | Pantalla de cocina en tiempo real con aging indicators | Sesión 8 |
| **5** | Caja y Pagos | Registro de pagos, corte de caja, distribución de propinas | Sesión 9-10 |
| **6** | Reportes | Dashboards de ventas, top productos, desempeño por mesero | Sesión 11 |
| **7** | Pulido + Deploy | Anti-slop, animaciones, E2E, deploy a producción | Sesión 12-13 |

---

## Fase 0: Scaffold y Fundamentos

### ¿Qué se construye?
Todo el armazón del proyecto para que `docker compose up` levante PostgreSQL, la API y el frontend. Sin pantallas todavía, pero con el 100% de la estructura de archivos, configuraciones y el kernel compartido.

### Entregables

**Configuración raíz:**
- `package.json` con workspaces para `server/` y `client/` y todos los scripts (dev, build, test, lint, typecheck, db:generate, db:migrate, db:seed)
- `tsconfig.base.json` con strict mode, ESM, path aliases
- `.env.example` con las 6 variables de entorno necesarias
- `docker-compose.yml` con 3 servicios: postgres (18-alpine), server (hot reload), client (Vite HMR)
- `.github/workflows/ci.yml` pipeline completo

**Servidor (`server/`):**
- Express 5 con TypeScript, CORS, helmet, JSON parsing
- Esquema Drizzle con las 14 tablas y 7 enums (todas con `restaurant_id` desde día 1)
- Seed de datos: 1 restaurante, 3 usuarios (admin, mesero, cajero), 10 mesas, 4 categorías, 20 productos, 5 modificadores
- Shared kernel: clase `AppError`, middleware de auth (`requireAuth`, `requireRole`), validador Zod, helper de paginación, helper `whereRestaurant`
- Graceful shutdown (SIGTERM/SIGINT)
- Health check en `GET /api/health`
- Dockerfiles (producción multi-stage + desarrollo con hot reload)

**Cliente (`client/`):**
- React 19 + Vite 6 + Tailwind CSS 4.3
- Configuración de Tailwind con tokens Victorian Brutalist:
  - Colores: burgundy (#6B1A2A), forest green (#2D4A22), antique gold (#C9A84C), paper (#EBDCC4), carbon (#1A1410)
  - 4 fuentes: Playfair Display (serif), JetBrains Mono (mono), DM Sans (bold sans), Caveat (script)
  - Escala tipográfica KDS: 24px a 80px
  - Sombras espresso-tint (nunca negro)
  - Animaciones: textile-shimmer, typewriter
- Utilidades: `cn()`, `formatCurrency()`, `formatTime()`, `cardRotation()`
- Cliente API con interceptor JWT y refresh automático
- Constantes del sistema (estados, roles, métodos de pago)
- Layouts base: SidebarLayout, BottomNavLayout, KDSLayout
- Dockerfiles (producción con nginx + desarrollo con HMR)
- nginx.conf con SPA fallback, proxy API y WebSocket

**CI/CD:**
- Lint → TypeCheck → Tests (servidor + cliente) → E2E → Build Docker → Trivy scan → Cosign sign → Push → Deploy staging → Deploy prod (con aprobación manual)

### Resultado esperado
```bash
docker compose up
# PostgreSQL corriendo en :5432
# API en :3000 → GET /api/health → { status: "ok" }
# Frontend en :5173 → pantalla en blanco (sin rutas aún)
```

---

## Fase 1: Auth, Usuarios y Layouts Base

### ¿Qué se construye?
El sistema de autenticación con JWT, la gestión de usuarios por el admin, y los 4 layouts responsivos para cada tipo de actor.

### Backend

**Módulo Auth (`server/src/modules/auth/`):**
| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/auth/login` | POST | Login con email + password → JWT (8h) + refresh token (7d) |
| `/api/auth/refresh` | POST | Refrescar access token con refresh token |

**Módulo Users (`server/src/modules/users/`):**
| Endpoint | Método | Auth | Descripción |
|----------|--------|------|-------------|
| `/api/users` | GET | admin | Listar usuarios con filtros por rol, estado |
| `/api/users` | POST | admin | Crear usuario (hash automático de password) |
| `/api/users/:id` | PUT | admin | Modificar usuario (nombre, email, rol, activo) |
| `/api/users/:id` | DELETE | admin | Desactivar usuario (baja lógica, preserva historial) |

**Roles disponibles:** `waiter`, `cashier`, `admin`, `superadmin`

**Middleware compartido:**
- `requireAuth`: Verifica JWT del header `Authorization: Bearer <token>`, extrae `userId`, `role`, `restaurantId` al `req.user`
- `requireRole(...roles)`: Restringe acceso a roles específicos

### Frontend

| Pantalla | Layout | Descripción |
|----------|--------|-------------|
| `/login` | Centered card | Formulario estilo Victorian: tarjeta de papel con borde burgundy 4px, título Playfair Display hero-size, inputs JetBrains Mono, botón DM Sans uppercase |
| `/mesero/*` | BottomNavLayout | Tablet: header 56px + contenido scrollable + nav inferior 64px con touch targets 48px |
| `/caja/*` | SidebarLayout | Desktop: sidebar 256px (DM Sans 14px uppercase) + header 56px + contenido |
| `/admin/*` | SidebarLayout | Mismo layout que cajero, distintos items de nav |
| `/admin/users` | SidebarLayout | Tabla CRUD: nombre, email, rol (badge de color), toggle activo/inactivo. Modal de creación/edición con clip-path irregular |

**Hook `useAuth`:**
- Almacena token en memoria (nunca localStorage)
- Interceptor automático: adjunta `Authorization` a todas las requests
- Refresh automático al recibir 401
- Redirección a `/login` si el refresh falla

### Resultado esperado
- Login con `admin@restaurant.com` / `password123` → redirige a `/admin`
- Login con `mesero1@restaurant.com` → redirige a `/mesero/orders`
- Admin puede crear, editar y desactivar usuarios
- Los 4 layouts renderizan correctamente con la paleta Victorian

---

## Fase 2: Catálogo

### ¿Qué se construye?
El administrador puede gestionar el menú completo: crear categorías, productos con precio e imagen, y modificadores ("sin cebolla", "extra queso"). Los meseros podrán consultarlo en modo lectura.

### Backend

**Módulo Catalog (`server/src/modules/catalog/`):**

| Endpoint | Método | Auth | Descripción |
|----------|--------|------|-------------|
| `/api/catalog/categories` | GET | JWT | Listar categorías (ordenadas por sort_order) |
| `/api/catalog/categories` | POST | admin | Crear categoría |
| `/api/catalog/products` | GET | JWT | Listar productos (filtros: categoryId, search, available) |
| `/api/catalog/products` | POST | admin | Crear producto (nombre, precio, categoría, modificadores) |
| `/api/catalog/products/:id` | PUT | admin | Modificar producto (incluyendo disponibilidad) |
| `/api/catalog/modifiers` | GET | JWT | Listar modificadores (filtro: productId) |
| `/api/catalog/modifiers` | POST | admin | Crear modificador (nombre, ajuste de precio) |
| `/api/catalog/modifiers/:id` | PUT | admin | Modificar modificador |

**Lógica de negocio:**
- Precio base > 0 (validación)
- Búsqueda full-text en español con índice GIN
- Productos se pueden desactivar sin eliminar (is_available = false)
- Modificadores se vinculan a productos vía tabla `product_modifiers`

### Frontend

| Pantalla | Descripción |
|----------|-------------|
| `/admin/catalog` | 3 tabs: Productos / Categorías / Modificadores. Tabs DM Sans bold 14px uppercase, activo con bg-primary |
| `ProductForm` | Modal con: nombre (Playfair Display 36px), precio (JetBrains Mono 24px forest-green), selector de categoría, multi-select de modificadores, descripción |
| `CategoryList` | Lista ordenable con inline edit |
| `ModifierList` | Nombre + ajuste de precio + toggle disponible |
| `SearchBar` | Input con ícono de búsqueda, JetBrains Mono, debounced |

**Estados especiales:**
- **Empty:** "Esta hoja está en blanco. El primer trazo es el más importante." (Caveat, centrado)
- **Loading:** Skeleton con textile shimmer (gradiente paper→gold→paper)
- **Error:** "El tintero se ha volcado." + mancha de tinta SVG

### Resultado esperado
- Admin crea categorías (Entradas, Platos Fuertes, Postres, Bebidas)
- Admin crea 20 productos con precios y modificadores
- Mesero puede ver el catálogo completo en su tablet
- Búsqueda de productos por nombre funciona con índice GIN

---

## Fase 3: Mesas y Órdenes (El Núcleo)

### ¿Qué se construye?
El flujo principal del restaurante. El mesero ve las mesas, crea órdenes asignadas a una mesa, agrega platillos con modificadores, revisa el resumen y envía a cocina. La orden sigue una máquina de estados estricta.

### Backend

**Módulo Tables (`server/src/modules/tables/`):**

| Endpoint | Método | Auth | Descripción |
|----------|--------|------|-------------|
| `/api/tables` | GET | JWT | Listar mesas con estado actual |
| `/api/tables` | POST | admin | Crear mesa (número, nombre, capacidad, posición) |
| `/api/tables/:id` | PUT | admin | Modificar mesa |
| `/api/tables/:id/status` | PUT | JWT | Cambiar estado (free/occupied/reserved/cleaning) |
| `/api/tables/:id/transfer` | POST | JWT | Transferir orden de una mesa a otra |

**Módulo Orders (`server/src/modules/orders/`):**

| Endpoint | Método | Auth | Descripción |
|----------|--------|------|-------------|
| `/api/orders` | GET | JWT | Listar órdenes con filtros (estado, mesa, mesero) y paginación |
| `/api/orders` | POST | JWT | Crear orden con items y modificadores |
| `/api/orders/:id` | GET | JWT | Detalle completo (items → modifiers → modifier info) |
| `/api/orders/:id` | PUT | JWT | Agregar items a orden activa |
| `/api/orders/:id/send-to-kitchen` | POST | JWT | Enviar a cocina + emitir `order:new` vía Socket.io |
| `/api/orders/:id/items/:itemId` | DELETE | JWT | Cancelar item individual |
| `/api/orders/:id/invoice` | PUT | JWT | Generar cuenta (vista previa del cobro) |

**Máquina de estados de órdenes:**

```
draft ──► in_kitchen ──► ready ──► delivered ──► paid ──► closed
                                    │
                                    └──► partially_paid ──► paid
```

- Cada transición se valida: si no es válida → error `CONFLICT`
- `unit_price` se congela al momento de crear la orden (no cambia si el admin modifica el precio después)
- `subtotal` = quantity × unit_price + suma de ajustes de modificadores
- Al crear orden: la mesa pasa a `occupied`
- `total_amount` se recalcula en cada modificación

**Eventos Socket.io emitidos:**
- `order:new` → al enviar a cocina
- `order:updated` → al agregar items
- `order:status-changed` → en cada cambio de estado

### Frontend

| Pantalla | Descripción |
|----------|-------------|
| `/mesero/tables` | Grid de mesas. Cada mesa: borde de color según estado (libre=verde, ocupada=burgundy, reservada=gold, limpieza=navy), número en JetBrains Mono 32px, capacidad. Efecto "diario personal": rotación 1-2° vía `cardRotation(index)` |
| `/mesero/orders` | Lista de órdenes activas del mesero. Cada OrderCard: Header (mesa, tiempo, StatusBadge), Body (lista de items), Footer (total + botón de acción) |

**Componentes clave:**

| Componente | Descripción |
|------------|-------------|
| `TableButton` | Tarjeta de mesa con estado visual. Tap → ver orden activa o crear nueva |
| `OrderCard` | Compound component: Header, Body, Footer con contexto compartido |
| `NewOrderSheet` | Slide-up sheet táctil para crear orden. Paso 1: seleccionar productos por tabs de categoría. Paso 2: elegir modificadores. Paso 3: revisar y enviar |
| `ProductSelector` | Grid 2 columnas. Cada producto: nombre (Playfair Display), precio (JetBrains Mono, forest green) |
| `ModifierPicker` | Checkboxes con texto en Caveat (script), 16px, indentado bajo el producto |
| `StatusBadge` | Badge rectangular sin bordes redondeados. 7 colores mapeados a estados |
| `Skeleton` | 3 variantes de textile shimmer: card (140px), row (56px), KDS (280px) |

**Hooks:**

| Hook | Descripción |
|------|-------------|
| `useOptimisticOrder` | Mutación con TanStack Query: onMutate actualiza caché, onError revierte, onSettled invalida |
| `useSocket` | Conexión Socket.io: escucha `order:status-changed`, actualiza caché de React Query |

### Resultado esperado
- Mesero en tablet ve el mapa de mesas
- Toca mesa libre → crea orden → selecciona platillos → agrega modificadores → revisa total → envía
- La orden aparece con estado "En Cocina"
- El mesero puede ver todas sus órdenes activas con su estado actual
- Agregar items adicionales a una orden existente funciona

---

## Fase 4: Pantalla de Cocina (KDS)

### ¿Qué se construye?
Un monitor de 32" montado en pared que muestra las órdenes entrantes en tiempo real. Los cocineros ven las órdenes y las marcan como listas. Tema oscuro, tipografía masiva, indicadores de envejecimiento.

### Backend

**Módulo KDS (`server/src/modules/kds/`):**
- No tiene endpoints REST, solo maneja eventos Socket.io
- `order:ready`: recibe del KDS → valida que la orden esté `in_kitchen` → cambia a `ready` → emite `order:status-changed` al mesero
- `order:cancelled`: remueve la orden del conjunto activo

### Frontend (pantalla completa, tema oscuro)

| Pantalla | Descripción |
|----------|-------------|
| `/kds` | Fullscreen. Al montar: `requestFullscreen()` + `navigator.wakeLock.request('screen')`. CSS: `cursor: none` |

**Componentes:**

| Componente | Descripción |
|------------|-------------|
| `KDSHeader` | Header fijo 80px, bg carbon. Izquierda: "Alfredo's Cocina" 48px. Derecha: reloj JetBrains Mono + contador "N activas" |
| `KDSOrderCard` | Layout de ticket impreso. Barra superior: #orden (JetBrains Mono 32px) + mesa + timer. Cuerpo: lista de items con modificadores. Footer: botón "LISTA" tamaño KDS (56px alto, 24px fuente). Animación de entrada: slide+scale+bounce+pulso burgundy 500ms. Animación de salida: slide-out derecha+fade+scale-down 400ms |

**Sistema de aging (useOrderAge):**

| Tiempo | Estado | Indicador visual |
|--------|--------|-----------------|
| <5 min | Normal | Sin indicador |
| 5-10 min | Atención | Borde antique gold, pulso |
| 10-15 min | Warning | Borde warning, pulso, ícono AlertTriangle |
| >15 min | Crítico | Borde error rojo, fondo error/15, pulso, AlertTriangle |

### Resultado esperado
- Monitor KDS (1920x1080): grid de 4 columnas con órdenes activas
- Nueva orden del mesero → aparece con animación de entrada
- Cocinero presiona "LISTA" → la orden sale del KDS, mesero recibe notificación
- Órdenes que envejecen cambian de color automáticamente

---

## Fase 5: Caja y Pagos

### ¿Qué se construye?
El cajero puede ver todas las órdenes, registrar pagos, abrir/cerrar turnos de caja y distribuir propinas. Se expande la máquina de estados de órdenes.

### Backend

**Módulo Cash (`server/src/modules/cash/`):**

| Endpoint | Método | Auth | Descripción |
|----------|--------|------|-------------|
| `/api/cash-register/open` | POST | cashier | Abrir turno con monto inicial |
| `/api/cash-register/close` | POST | cashier | Cerrar turno, calcular totales, generar reporte |
| `/api/cash-register/current` | GET | cashier | Ver corte activo con pagos del turno |
| `/api/cash-register/history` | GET | admin | Histórico de cortes con filtro por fecha |
| `/api/orders/:id/payment` | POST | cashier | Registrar pago de orden |
| `/api/tips` | GET | admin | Reporte de propinas por empleado |

**Lógica de negocio:**
- Solo puede haber un turno de caja abierto a la vez
- El pago requiere: orden en estado `delivered` o `partially_paid`
- Al pagar: se actualiza `total_sales` y `total_tips` del corte activo
- Pago completo → estado `paid` → `closed`
- Pago parcial → estado `partially_paid`
- Distribución de propinas:
  - **Equitativo (equal):** se reparte entre mesero (creador de la orden) y cajero
  - **Individual:** todo al mesero
- Al cerrar caja: se bloquean los pagos del turno

### Frontend

| Pantalla | Descripción |
|----------|-------------|
| `/caja/orders` | Tabla completa de órdenes. Columnas: #id, Mesa, Mesero, Estado (badge), Total, Acciones. Filtros por estado y búsqueda por #mesa. Cada fila → botón "Pagar" |
| `/caja/register` | Dashboard de caja: tarjetas resumen (ventas totales, propinas, pagos por método), botones abrir/cerrar, historial de cortes |

**Componentes clave:**

| Componente | Descripción |
|------------|-------------|
| `PaymentForm` | Modal: resumen de orden (items + total), selector de método (3 botones: cash/card/transfer), input de monto, input de propina, total con cambio calculado. Al confirmar → muestra recibo |
| `InvoicePreview` | Recibo estilo papel: borde rasgado superior, items de orden, subtotales, timestamp. Efecto de sello: "Sellado." en círculo rojo irregular |
| `CashRegisterSummary` | Tarjetas con: abierto desde (hora), ventas totales (JetBrains Mono), propinas totales, cantidad de pagos |
| `TipDistribution` | Tabla: empleado, rol, monto de propina, tipo de distribución |

### Resultado esperado
- Cajero abre turno con $500 iniciales
- Durante el turno: registra pagos de órdenes, elige método, agrega propina
- Cierra turno → recibe reporte con totales y desglose
- Admin puede ver propinas acumuladas por empleado

---

## Fase 6: Reportes

### ¿Qué se construye?
Dashboards para el administrador: ventas por período, productos más vendidos, desempeño por mesero. Exportación CSV.

### Backend

**Módulo Reports (`server/src/modules/reports/`):**

| Endpoint | Método | Auth | Descripción |
|----------|--------|------|-------------|
| `/api/reports/sales` | GET | admin | Ventas por período. Params: `from`, `to`, `groupBy` (day/week/month) |
| `/api/reports/top-products` | GET | admin | Productos más vendidos. Params: `from`, `to`, `limit` |
| `/api/reports/orders-by-user` | GET | admin | Desempeño por mesero. Params: `from`, `to` |
| `/api/cash-register/history` | GET | admin | Histórico de cortes de caja |

**Lógica:**
- Agregaciones SQL con `SUM`, `COUNT`, `GROUP BY`, `date_trunc`
- Formato de números con porcentajes
- Generación de CSV para exportación

### Frontend

| Pantalla | Descripción |
|----------|-------------|
| `/admin/reports` | 4 tabs: Ventas / Productos / Meseros / Caja. Selector de rango de fechas (2 inputs JetBrains Mono) |

**Componentes:**

| Componente | Descripción |
|------------|-------------|
| `SalesChart` | Gráfico de barras CSS puro (sin librería). Barras proporcionales en bg-primary. Labels JetBrains Mono |
| `RankedTable` | Filas numeradas. Rango# en JetBrains Mono 700. Nombre en Playfair Display. Valores en JetBrains Mono forest green |
| Botón Exportar | Descarga CSV de cualquier tabla/reporte |

### Resultado esperado
- Admin filtra por rango de fechas y ve ventas diarias/semanales/mensuales
- Ranking de productos más vendidos con cantidades e ingresos
- Tabla de desempeño por mesero: #órdenes, total vendido, promedio
- Exporta cualquier vista a CSV

---

## Fase 7: Pulido, Edge Cases y Deploy

### ¿Qué se construye?
La capa final de calidad. Estados de carga/vacío/error con el estilo Victorian Brutalist en cada pantalla. Animaciones y micro-interacciones. Tests end-to-end. Deploy a staging y producción.

### Anti-Slop Checklist (aplicar en TODAS las pantallas)

**Estados:**
- [ ] **Loading:** Skeleton con textile shimmer (gradiente paper→gold→paper). 3 variantes: card, row, KDS. **NUNCA spinner.**
- [ ] **Empty:** Texto poético en Caveat (script), centrado. Ej: "Esta hoja está en blanco. El primer trazo es el más importante." **NUNCA "No data found".**
- [ ] **Error:** Mensaje con personalidad + mancha de tinta SVG. Ej: "El tintero se ha volcado." + botón Reintentar. **NUNCA "Something went wrong".**

**Visual:**
- [ ] Sin negro puro (#000) en ningún lado → usar espresso (#2C1810) o carbon (#1A1410)
- [ ] Sin blanco puro (#fff) en fondos → usar paper (#FFFFFF con textura) o surface (#EBDCC4)
- [ ] Sin bordes redondeados → 0px o clip-path irregular
- [ ] Sombras solo con tint espresso, nunca negras
- [ ] Sin degradados púrpura/azul genéricos
- [ ] Tipografía con intención: 4 fuentes, cada una con su rol

### Animaciones

| Tipo | Timing | Easing |
|------|--------|--------|
| Micro-interacciones (hover, press) | 150-200ms | ease-out |
| Transiciones de página | 300-400ms | cubic-bezier(0.4, 0, 0.2, 1) |
| Entrada de cards (stagger) | 200ms c/u, 50ms delay | ease-out |
| Modal | 300ms | scale(0.92)→1 + fade + overshoot |
| KDS nueva orden | 500ms | slide+scale+bounce+pulso burgundy |
| KDS orden lista | 400ms | slide-out derecha+fade+scale-down |
| prefers-reduced-motion | — | Deshabilitar todo |

### Accesibilidad

- Touch targets ≥ 48x48px en mesero (tablet)
- Focus visible (anillo burgundy 2px) en desktop
- `aria-label` en todos los botones solo-icono
- `aria-live="polite"` en cambios de estado
- `aria-live="assertive"` en nuevas órdenes del KDS
- `role` attributes en controles custom (role="button", role="listbox")

### Tests End-to-End (Playwright)

```
1. Login → crear orden con 2 items + modificadores → enviar a cocina
2. KDS recibe orden → cocinero marca "LISTA" → mesero ve cambio de estado
3. Cajero abre caja → procesa pago → cierra caja → recibe reporte
4. Admin crea producto nuevo → mesero lo ve en catálogo
5. Reportes cargan datos correctos en rango de fechas
```

### Pipeline de Deploy

```
Push a main:
  1. Lint + TypeCheck + Tests
  2. Build Docker (multi-stage server + client)
  3. Trivy scan (bloquea en CRITICAL/HIGH)
  4. Cosign sign (keyless via GitHub OIDC)
  5. Push a ghcr.io
  6. Deploy automático a staging
  7. Smoke tests (health, login, crear orden)
  8. Deploy a producción (APROBACIÓN MANUAL REQUERIDA)
  9. Smoke tests en producción
  10. Verificar KDS recibe órdenes en prod
```

### Resultado esperado
- Sistema completo con anti-slop en cada pantalla
- Animaciones fluidas con respeto a prefers-reduced-motion
- Tests E2E cubren el flujo principal
- CI/CD deploya a staging automáticamente y a prod con aprobación
- KDS funcional en tiempo real en producción

---

## Dependencias entre Módulos

```
auth ────────────────────────────────────────────► (requerido por todo)
users ──► auth ──► shared
catalog ──► shared
tables ──► shared
orders ──► tables ──► catalog ──► shared
kds ──► orders ──► shared
cash ──► orders ──► tables ──► shared
reports ──► orders ──► cash ──► shared
```

## Base de Datos: Tablas por Fase

| Fase | Tablas nuevas | Total acumulado |
|------|--------------|-----------------|
| 0 | Todas (esqueleto) | 14 |
| 1 | restaurants, users (seed) | 14 |
| 2 | categories, products, modifiers, product_modifiers (completas) | 14 |
| 3 | tables, orders, order_items, order_item_modifiers (completas) | 14 |
| 4 | — (usa existentes) | 14 |
| 5 | cash_registers, payments, tip_distributions (completas) | 14 |
| 6 | audit_logs (completa) | 14 |
| 7 | — | 14 |

## Estructura de cada Módulo Backend

```
server/src/modules/<nombre>/
  <nombre>.schema.ts       Esquemas Zod: Create, Update, Response, Query params
  <nombre>.repository.ts   Drizzle queries: find, create, update. Retorna entidades.
  <nombre>.service.ts      Lógica de negocio: validaciones, state machine, eventos
  <nombre>.controller.ts   Router Express: handlers, parseo, llamada a service, respuesta
  __tests__/
    <nombre>.service.test.ts    Unit + integration (Testcontainers)
    <nombre>.controller.test.ts HTTP tests (Supertest)
```

## Variables de Entorno

| Variable | Ejemplo | Obligatoria |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://sor_user:sor_pass@localhost:5432/sor` | Sí |
| `JWT_SECRET` | `openssl rand -hex 32` | Sí |
| `JWT_REFRESH_SECRET` | `openssl rand -hex 32` | Sí |
| `CORS_ORIGIN` | `http://localhost:5173` | Sí |
| `PORT` | `3000` | No (default) |
| `NODE_ENV` | `development` | No |

---

> **Documentos de referencia:** `Sistema_Gestion_Ordenes_Restaurantes.md` (especificación), `ARCHITECTURE.md` (diagramas C4), `API.md` (contrato REST), `DATA_MODEL.md` (DDL + índices), `DESIGN_SYSTEM_EXPERIMENTAL.md` (tokens visuales), `agent-docs/PLAN.md` (versión para agentes IA)
