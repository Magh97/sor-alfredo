# Estrategia de Testing -- SOR

---

## Herramientas

| Herramienta | Proposito | Stack |
|-------------|-----------|-------|
| **Vitest** | Unit + Integration tests (backend y frontend) | `nodejs-testing` |
| **Playwright** | E2E tests (flujos completos usuario) | `nodejs-testing` |
| **Testcontainers** | PostgreSQL real en integration tests (no mock) | `nodejs-testing` |
| **MSW** (Mock Service Worker) | Mock de API en tests de frontend | `nodejs-testing` |
| **Supertest** | HTTP assertions en tests de controllers Express | `nodejs-testing` |

---

## Piramide de Testing

```
       ┌──────┐
       │ E2E  │  5%  -- Playwright. Flujos criticos completos.
       │      │
     ┌─┴──────┴─┐
     │ Integration │ 35%  -- Vitest + Testcontainers. Modulos completos.
     │    Tests    │
   ┌─┴────────────┴─┐
   │   Unit Tests     │ 60%  -- Vitest. Servicios, repositorios, schemas.
   │                  │
   └──────────────────┘
```

---

## Convenciones Generales

- **Ubicacion:** Co-ubicados con el codigo fuente: `*.test.ts` junto al archivo que prueban.
- **Patron:** AAA (Arrange, Act, Assert) o Given-When-Then para E2E.
- **Naming:** `describe('OrdersService', () => { it('should create order with valid items', ...) })`.
- **Mocking:** Preferir integracion real sobre mocks. Mock solo APIs externas (MSW) y dependencias no deterministas (Date, Math.random).
- **Coverage threshold CI:** 80% lineas, 75% branches. Configurado en `vitest.config.ts`.
- **No snapshot testing.** Fragil, dificil de mantener, poco valor en este tipo de sistema.

---

## Backend Testing

### Unit Tests -- Servicios

Archivos: `server/src/modules/*/__tests__/*.service.test.ts`

Que probar:
- Maquina de estados de ordenes (`draft → in_kitchen → ready → ...`)
- Validacion de reglas de negocio (ej: no se puede pagar una orden en draft)
- Calculo de totales: precio base + modificadores con price_adjustment
- Distribucion de propinas (equitativa vs individual)
- Transformacion de entidades a DTOs de respuesta API

Ejemplo:

```typescript
// orders.service.test.ts
import { describe, it, expect } from 'vitest';
import { OrdersService } from '../orders.service';

describe('OrdersService', () => {
  describe('createOrder', () => {
    it('should create order with calculated totals', async () => {
      // Arrange: repositorio mock con producto base
      // Act: service.createOrder({ tableId: 1, items: [...] })
      // Assert: totalAmount = sum(subtotals), status = 'draft'
    });

    it('should reject order with unavailable products', async () => {
      // Arrange: producto is_available = false
      // Act + Assert: throw PRODUCT_UNAVAILABLE
    });

    it('should reject modification of closed order', async () => {
      // Arrange: orden status = 'closed'
      // Act + Assert: throw ORDER_CLOSED
    });
  });
});
```

### Integration Tests -- Controllers

Archivos: `server/src/modules/*/__tests__/*.controller.test.ts`

Que probar:
- HTTP status codes correctos (201 Created, 400 Validation, 401 Unauthorized)
- Middleware de autenticacion y autorizacion por rol
- Formato de respuesta estandar (data/meta, error/code/message)
- Transacciones reales en PostgreSQL (Testcontainers)

```typescript
// orders.controller.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { createApp } from '../../app';

describe('POST /api/orders', () => {
  let container;
  let app;
  let authToken;

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:18-alpine').start();
    app = createApp({ databaseUrl: container.getConnectionUri() });
    // Seed: crear restaurant, usuario mesero, producto, mesa
    authToken = await loginAsWaiter(app);
  });

  it('should create order and return 201', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ tableId: 1, items: [{ productId: 1, quantity: 2 }] });

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('draft');
    expect(res.body.data.totalAmount).toBeGreaterThan(0);
  });

  it('should return 401 without token', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({ tableId: 1, items: [{ productId: 1, quantity: 1 }] });

    expect(res.status).toBe(401);
  });

  afterAll(async () => {
    await container.stop();
  });
});
```

---

## Frontend Testing

### Unit Tests -- Hooks y Utilidades

Archivos: `client/src/**/*.test.ts`

Que probar:
- `useAuth`: login, logout, refresh token, redirect si no autenticado
- `useOrders`: filtros, paginacion, creacion, envio a cocina
- `useSocket`: conexion, desconexion, recepcion de eventos del KDS
- Utilidades de formato (precio, fecha, estado traducido)

### Integration Tests -- Componentes

Que probar (Vitest + jsdom o happy-dom):
- `OrderForm`: seleccion de mesa, busqueda de productos, cantidades, envio
- `KDScreen`: renderizado de ordenes, ordenamiento FIFO, boton "Lista"
- `CashRegister`: registro de pago, seleccion de metodo, propina

### E2E Tests -- Playwright

Archivos: `tests/e2e/*.spec.ts`

Flujos criticos a probar:

| Flujo | Descripcion | Criticidad |
|-------|-------------|------------|
| **F1: Orden completa** | Mesero crea orden → envia a cocina → cocina marca lista → cajero registra pago | Critico |
| **F2: Modificar orden activa** | Mesero agrega items a orden en cocina → KDS muestra items nuevos marcados | Alto |
| **F3: Cancelar item** | Mesero cancela item antes de envio a cocina → total recalcula | Alto |
| **F4: Corte de caja** | Cajero abre turno → registra pagos → cierra turno → genera reporte | Alto |
| **F5: Auth + roles** | Mesero no puede acceder a admin → Admin puede gestionar usuarios | Alto |

Ejemplo Playwright:

```typescript
// tests/e2e/order-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Flujo completo de orden', () => {
  test('mesero crea orden, cocina prepara, cajero cobra', async ({ page }) => {
    // 1. Mesero login
    await page.goto('/login');
    await page.fill('[name=email]', 'mesero1@restaurant.com');
    await page.fill('[name=password]', 'password123');
    await page.click('button[type=submit]');
    await expect(page).toHaveURL('/mesero');

    // 2. Seleccionar mesa
    await page.click('[data-testid=table-5]');
    await expect(page.locator('[data-testid=order-panel]')).toBeVisible();

    // 3. Agregar platillos
    await page.click('[data-testid=product-hamburguesa]');
    await page.fill('[data-testid=quantity-input]', '2');
    await page.click('[data-testid=add-modifier]');
    await page.click('[data-testid=modifier-sin-cebolla]');
    await page.click('[data-testid=send-to-kitchen]');

    // 4. Verificar KDS
    const kdsPage = await page.context().newPage();
    await kdsPage.goto('/kds');
    await expect(kdsPage.locator('[data-testid=order-card]')).toBeVisible();

    // 5. Cocina marca lista
    await kdsPage.click('[data-testid=mark-ready]');
    await expect(page.locator('[data-testid=order-status]')).toHaveText('Lista');

    // 6. Cajero registra pago
    // ...
  });
});
```

---

## CI Integration

Los tests se ejecutan en GitHub Actions:

```yaml
# .github/workflows/ci.yml
jobs:
  test-server:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:18-alpine
        env:
          POSTGRES_DB: sor_test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        ports: ['5432:5432']
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '24' }
      - run: npm ci
      - run: npm run test:server -- --coverage
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/sor_test
          JWT_SECRET: ci-test-secret

  test-client:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '24' }
      - run: npm ci
      - run: npm run test:client

  e2e:
    runs-on: ubuntu-latest
    needs: [test-server, test-client]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '24' }
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: docker compose -f docker-compose.test.yml up -d
      - run: npm run test:e2e
      - run: docker compose -f docker-compose.test.yml down
```

---

## Comandos

```bash
# Unit + Integration (backend)
npm run test:server

# Unit + Integration (frontend)
npm run test:client

# Todos los tests
npm test

# Coverage
npm run test:coverage

# E2E con UI de Playwright
npm run test:e2e -- --ui

# Watch mode (desarrollo)
npm run test:watch
```

---

## Lo que NO se prueba

- **Librerias externas** (Express, Drizzle, Socket.io, Zod). Confiamos en sus tests.
- **Configuracion trivial** (variables de entorno, imports). No hay logica.
- **Estilos visuales** (Tailwind classes, colores, layout CSS). Playwright puede verificar visibilidad, no pixeles.
- **Snapshots de BD completos.** Fragiles. Mejor assertions especificas sobre campos.
