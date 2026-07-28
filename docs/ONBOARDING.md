# Onboarding -- SOR

> Tiempo estimado de setup: 10 minutos (con Docker)
> Stack: Node.js 24 + Express 5 + React 19 + PostgreSQL 18

---

## Quick Start (< 5 min con Docker)

```bash
git clone <repo-url> && cd sor
cp .env.example .env
docker compose up
```

Abrir:
- Frontend: http://localhost:5173
- API: http://localhost:3000
- KDS: http://localhost:5173/kds

---

## Stack

| Capa | Tecnologia | Dev-Kits |
|------|-----------|----------|
| Frontend | React 19 + Vite + Tailwind CSS | `react-core`, `react-components` |
| Backend | Node.js 24 + Express 5 + TypeScript | `nodejs-core`, `nodejs-express` |
| ORM | Drizzle | `nodejs-database` |
| Base de Datos | PostgreSQL 18 | `postgresql-core` |
| Tiempo Real | Socket.io | `nodejs-express` |
| CI/CD | GitHub Actions | `devops-cicd` |

---

## Arquitectura a Simple Vista

```mermaid
graph LR
    M[Mesero<br/>Tablet] -->|React SPA| API[Express API<br/>:3000]
    C[Cajero<br/>PC Caja] -->|React SPA| API
    A[Admin<br/>PC] -->|React SPA| API
    K[KDS Screen] -->|Socket.io| API
    API --> DB[(PostgreSQL<br/>:5432)]
```

### Estructura del Proyecto (planeada)

```
sor/
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── pages/           # Rutas: /mesero, /caja, /admin, /kds
│   │   ├── components/      # Componentes compartidos
│   │   ├── hooks/           # Custom hooks (useAuth, useSocket)
│   │   └── lib/             # Cliente API, utilidades
│   └── ...
├── server/                  # Express + TypeScript backend
│   ├── src/
│   │   ├── modules/         # Modulos: orders, tables, catalog, users, cash, reports, kds
│   │   │   ├── orders/
│   │   │   │   ├── orders.controller.ts
│   │   │   │   ├── orders.service.ts
│   │   │   │   ├── orders.repository.ts
│   │   │   │   └── orders.schema.ts
│   │   │   └── ...
│   │   ├── shared/          # Middleware (auth, error-handler), paginacion, errores
│   │   ├── db/              # Drizzle schema, migraciones, seed
│   │   └── index.ts         # Entry point, app setup
│   ├── drizzle.config.ts
│   └── ...
├── docs/                    # Documentacion del proyecto
│   ├── Sistema_Gestion_Ordenes_Restaurantes.md  # Especificacion completa
│   ├── ARCHITECTURE.md      # Diagramas C4 y descripcion de modulos
│   ├── API.md               # Contrato REST completo
│   ├── DATA_MODEL.md        # Modelo de datos + DDL + indices
│   ├── ONBOARDING.md        # Este archivo
│   └── adr/                 # Architecture Decision Records
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Modulos del Backend

### Orders (`server/src/modules/orders/`)
Flujo principal: creacion, envio a cocina, seguimiento de estados, pago.
- Patron: Controller-Service-Repository
- Estados de orden: `draft → in_kitchen → ready → delivered → paid → closed`
- Emite eventos Socket.io al cambiar de estado

### Tables (`server/src/modules/tables/`)
Mapa de mesas configurable, asignacion de ordenes, estado (libre/ocupada/limpieza).

### Catalog (`server/src/modules/catalog/`)
CRUD de platillos, complementos/modificadores y categorias.

### Users (`server/src/modules/users/`)
Gestion de usuarios, roles (waiter/cashier/admin/superadmin), auth JWT.

### Cash (`server/src/modules/cash/`)
Registro de pagos, corte de caja, distribucion de propinas.

### Reports (`server/src/modules/reports/`)
Ventas por periodo, top productos, desempeno por mesero.

### KDS (`server/src/modules/kds/`)
Maneja eventos Socket.io para la pantalla de cocina en tiempo real.

---

## Variables de Entorno (.env)

| Variable | Descripcion | Ejemplo | Obligatoria |
|----------|------------|---------|-------------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/sor` | Si |
| `JWT_SECRET` | Secreto para firmar tokens | `openssl rand -hex 32` | Si |
| `JWT_REFRESH_SECRET` | Secreto para refresh tokens | `openssl rand -hex 32` | Si |
| `CORS_ORIGIN` | Frontend URL | `http://localhost:5173` | Si |
| `PORT` | Puerto del servidor | `3000` | No (default: 3000) |
| `NODE_ENV` | Entorno | `development` | No |

---

## Base de Datos

```bash
# Generar migraciones desde schema Drizzle
npm run db:generate

# Aplicar migraciones
npm run db:migrate

# Datos de prueba (seed)
npm run db:seed
```

El seed crea:
- 1 restaurante
- Usuarios: admin@restaurant.com / mesero1@restaurant.com / cajero1@restaurant.com
- 10 mesas
- 20 platillos de ejemplo con categorias y modificadores

---

## Testing

```bash
# Unit + integration tests
npm test

# Solo backend
npm run test:server

# Solo frontend
npm run test:client

# Coverage
npm run test:coverage
```

Convenciones:
- Tests co-ubicados: `*.test.ts` junto al codigo que prueban
- Integration tests usan Testcontainers (PostgreSQL real)
- MSW para mock de API en tests de frontend

---

## Flujo de Desarrollo Tipico

1. **Definir el contrato:** Schema Zod en `orders.schema.ts`
2. **Repositorio:** Queries Drizzle en `orders.repository.ts`
3. **Servicio:** Logica de negocio en `orders.service.ts` (validacion, maquina de estados, eventos)
4. **Controller:** Handlers HTTP en `orders.controller.ts` (parseo, response, errores)
5. **Registrar rutas:** En `server/src/index.ts`
6. **Test:** `orders.service.test.ts` + `orders.controller.test.ts`

---

## Recursos

- **Especificacion completa:** [Sistema_Gestion_Ordenes_Restaurantes.md](Sistema_Gestion_Ordenes_Restaurantes.md)
- **Arquitectura detallada:** [ARCHITECTURE.md](ARCHITECTURE.md)
- **API Reference:** [API.md](API.md)
- **Modelo de Datos:** [DATA_MODEL.md](DATA_MODEL.md)
- **Decisiones de arquitectura:** [adr/](adr/)
