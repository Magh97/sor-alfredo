# Testing Guidelines — Alfredo's

## Stack

| Capa | Herramienta | Propósito |
|------|-------------|-----------|
| Server unit | Vitest + vi.fn | Lógica pura: servicios, middleware, utilidades |
| Server integration | Vitest + Supertest + Testcontainers | Endpoints HTTP con PostgreSQL real |
| Client unit | Vitest + Testing Library + jsdom | Componentes, hooks, utilidades |
| Client integration | Vitest + MSW | Componentes que llaman APIs |
| E2E | Playwright | Flujos críticos: login, crear orden, KDS, pago |

---

## 1. Convenciones

### AAA Pattern (Arrange - Act - Assert)

```typescript
it('creates order with valid items', async () => {
  // Arrange
  const input = { tableId: 1, items: [{ productId: 1, quantity: 2 }] };
  vi.spyOn(TablesRepository, 'findById').mockResolvedValue({ id: 1, status: 'free' });

  // Act
  const order = await OrdersService.createOrder(1, 1, input);

  // Assert
  expect(order.status).toBe('draft');
  expect(order.totalAmount).toBe(200);
});
```

### Nombres de test: `should <comportamiento esperado>`

```typescript
it('should create order with valid items', async () => { ... });
it('should throw CONFLICT when transition is invalid', async () => { ... });
it('should return 401 when token is missing', async () => { ... });
```

### Archivos co-ubicados

```
src/modules/orders/
  orders.service.ts
  __tests__/
    orders.service.test.ts       ← unit
    orders.controller.test.ts    ← integration
```

### Describe agrupado por método

```typescript
describe('OrdersService', () => {
  describe('createOrder', () => {
    it('should ...', async () => { ... });
    it('should ...', async () => { ... });
  });
  describe('sendToKitchen', () => {
    it('should ...', async () => { ... });
  });
});
```

---

## 2. Server Unit Tests

### Mock solo lo externo

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return token and user on valid credentials', async () => {
    // No mockear AuthService.login. Mockear la DB (externo).
    vi.spyOn(db.query.users, 'findFirst').mockResolvedValue({
      id: 1, email: 'test@test.com', passwordHash: await bcryptjs.hash('pass', 10),
      role: 'admin', restaurantId: 1, isActive: true,
    });

    const result = await AuthService.login({ email: 'test@test.com', password: 'pass' });

    expect(result.token).toBeDefined();
    expect(result.user.role).toBe('admin');
  });
});
```

### Qué mockear y qué no

| Mockear | No mockear |
|---------|------------|
| DB (repository) | Service bajo test |
| APIs externas | Lógica de negocio |
| Date / Math.random | Validaciones Zod |
| Variables de entorno | State machine transitions |

---

## 3. Server Integration Tests (Testcontainers)

### Setup con PostgreSQL real

```typescript
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import supertest from 'supertest';

describe('Auth API', () => {
  let container: PostgreSqlContainer;
  let request: supertest.Agent;

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:18-alpine')
      .withDatabase('test')
      .withUsername('test')
      .withPassword('test')
      .start();
    // Configurar DB, ejecutar migraciones, seedear datos
    request = supertest(app);
  }, 30_000);

  afterAll(async () => {
    await container.stop();
  });

  it('should login with valid credentials', async () => {
    const res = await request
      .post('/api/auth/login')
      .send({ email: 'admin@restaurant.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.role).toBe('admin');
  });
});
```

### Formato de assertions HTTP

```typescript
// Status codes
expect(res.status).toBe(201);  // created
expect(res.status).toBe(200);  // ok
expect(res.status).toBe(204);  // no content
expect(res.status).toBe(401);  // unauthorized
expect(res.status).toBe(403);  // forbidden
expect(res.status).toBe(404);  // not found
expect(res.status).toBe(409);  // conflict

// Response body
expect(res.body).toMatchObject({
  data: {
    id: expect.any(Number),
    status: 'draft',
    totalAmount: '200.0000',
  },
});

// Error body
expect(res.body.error).toMatchObject({
  code: 'VALIDATION_ERROR',
  message: expect.any(String),
});
```

---

## 4. Client Unit Tests (Testing Library)

### Setup

```typescript
// vitest.config.ts
test: {
  environment: 'jsdom',
  setupFiles: ['./src/test/setup.ts'],
  globals: true,
}

// src/test/setup.ts
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
afterEach(() => cleanup());
```

### Prioridad de queries

```typescript
// 1. getByRole — más accesible
screen.getByRole('button', { name: 'Entrar' });
screen.getByRole('heading', { name: /Alfredo/i });

// 2. getByLabelText — inputs con label
screen.getByLabelText('Correo');

// 3. getByText — contenido visible
screen.getByText('Administrador');

// 4. getByTestId — ÚLTIMO recurso
screen.getByTestId('user-row-3');
```

### userEvent sobre fireEvent

```typescript
import userEvent from '@testing-library/user-event';

const user = userEvent.setup();

await user.type(screen.getByLabelText('Correo'), 'admin@restaurant.com');
await user.click(screen.getByRole('button', { name: 'Entrar' }));
```

### Testing hooks

```typescript
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

it('should set tokens on successful login', async () => {
  const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });
  // ... test hook behavior
});
```

---

## 5. Component Testing Patterns

### Componente simple (display)

```typescript
it('should display order information', () => {
  render(<StatusBadge label="Activo" variant="success" />);

  expect(screen.getByText('Activo')).toBeInTheDocument();
  expect(screen.getByText('Activo')).toHaveClass('bg-[#2D4A22]/15');
});
```

### Componente con interacción

```typescript
it('should show create modal when button is clicked', async () => {
  const user = userEvent.setup();
  render(<AdminUsersPage />);

  await user.click(screen.getByRole('button', { name: /Nuevo Usuario/i }));

  expect(screen.getByPlaceholderText('Nombre')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
});
```

### Componente con loading/error/empty

```typescript
it('should show skeleton while loading', () => {
  // Mock query en estado loading
  render(<AdminUsersPage />);
  expect(screen.getAllByRole('generic').some(el => el.className.includes('skeleton-shimmer'))).toBe(true);
});

it('should show error with retry button', () => {
  // Mock query en estado error
  render(<AdminUsersPage />);
  expect(screen.getByText('El tintero se ha volcado.')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Reintentar/i })).toBeInTheDocument();
});

it('should show empty state when no data', () => {
  // Mock query con array vacío
  render(<AdminUsersPage />);
  expect(screen.getByText('Esta hoja está en blanco.')).toBeInTheDocument();
});
```

---

## 6. E2E Tests (Playwright)

### Config

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1280, height: 720 } } },
    { name: 'tablet', use: { viewport: { width: 768, height: 1024 } } },
  ],
});
```

### Flujos prioritarios para E2E

1. Login flow (éxito + error)
2. Admin CRUD de usuarios
3. Navegación por roles
4. KDS en pantalla completa

```typescript
import { test, expect } from '@playwright/test';

test.describe('Login', () => {
  test('redirects to /admin after admin login', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('admin@restaurant.com').fill('admin@restaurant.com');
    await page.getByPlaceholder('••••••••').fill('password123');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page).toHaveURL(/\/admin/);
    await expect(page.getByText('Alfredo')).toBeVisible();
  });

  test('shows error on invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('admin@restaurant.com').fill('wrong@email.com');
    await page.getByPlaceholder('••••••••').fill('wrong');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page.getByText('Credenciales inválidas')).toBeVisible();
  });
});
```

---

## 7. Coverage

| Capa | Objetivo | Miden |
|------|----------|-------|
| Services | ≥ 80% | Vitest + v8 |
| Repositories | ≥ 70% | Integration tests |
| Controllers | ≥ 70% | Supertest |
| React components | ≥ 70% | Testing Library |
| E2E | Happy paths | Playwright |

---

## 8. CI Integration

```yaml
# En CI:
test-server:
  services:
    postgres:
      image: postgres:18-alpine
  run: npm run test:server -- --coverage

test-client:
  run: npm run test:client -- --coverage

test-e2e:
  run: npm run test:e2e
```

---

## Checklist de Testing

- [ ] AAA pattern: Arrange, Act, Assert
- [ ] Nombres: `should <hacer algo> when <condición>`
- [ ] Tests co-ubicados: `__tests__/` junto al fuente
- [ ] Server: unit (mock DB) + integration (Testcontainers)
- [ ] Client: Testing Library con queries accesibles (getByRole primero)
- [ ] userEvent sobre fireEvent
- [ ] Mock solo lo externo (DB, APIs). No mockear el código bajo test.
- [ ] Early returns testing: isLoading, isError, !data cubiertos
- [ ] E2E solo para happy paths críticos
- [ ] Sin tests interdependientes (cada test es independiente)
