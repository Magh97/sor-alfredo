# WORKFLOWS

## First Setup

```bash
git clone <repo> && cd sor
cp .env.example .env
docker compose up
```

Open:
- Frontend: http://localhost:5173
- API health: http://localhost:3000/api/health
- KDS: http://localhost:5173/kds

## Add Server Module

```bash
# 1. Create module directory
mkdir server/src/modules/<name>

# 2. Create files (order matters: schema → repo → service → controller)
touch server/src/modules/<name>/<name>.schema.ts
touch server/src/modules/<name>/<name>.repository.ts
touch server/src/modules/<name>/<name>.service.ts
touch server/src/modules/<name>/<name>.controller.ts
```

Edit `server/src/index.ts`: register router
```typescript
import { <name>Router } from './modules/<name>/<name>.controller';
app.use('/api/<name>', <name>Router);
```

Test:
```bash
touch server/src/modules/<name>/__tests__/<name>.service.test.ts
touch server/src/modules/<name>/__tests__/<name>.controller.test.ts
```

## Add Client Page

```bash
# 1. Create route
mkdir -p client/src/app/<route>
touch client/src/app/<route>/page.tsx

# 2. Create components
mkdir -p client/src/components/<feature>
touch client/src/components/<feature>/<Component>.tsx
```

Add to navigation if needed (in SidebarLayout or BottomNavLayout).

Test:
```bash
touch client/src/components/<feature>/<Component>.test.ts
```

## Database Migration

```bash
# 1. Edit Drizzle schema
# server/src/db/schema.ts

# 2. Generate migration SQL
npm run db:generate

# 3. Apply migration
npm run db:migrate

# 4. Verify via integration tests
npm run test:server
```

## Run Tests

```bash
npm test                  # all tests (unit + integration)
npm run test:server        # backend only
npm run test:client        # frontend only
npm run test:e2e           # Playwright E2E (docker compose up required)
npm run test:coverage      # coverage report
npm run test:watch         # watch mode (use during development)
```

## Debug KDS Real-Time

```bash
# Terminal 1: start app
docker compose up

# Browser 1: KDS screen
open http://localhost:5173/kds

# Browser 2: Mesero
open http://localhost:5173/mesero
# → Login as mesero1
# → Create order, send to kitchen
# → Verify KDS shows order:new

# On KDS:
# → Click "LISTA"
# → Verify mesero browser gets status-changed notification
```

## Seed Database

```bash
npm run db:seed
```

Creates:
- 1 restaurant (id=1)
- Users: `admin@restaurant.com` / `mesero1@restaurant.com` / `cajero1@restaurant.com` (password: `password123`)
- Roles: admin, waiter, cashier
- 10 tables (numbered 1-10)
- 20 products across 4 categories (entradas, platos fuertes, postres, bebidas)
- 5 modifiers (sin cebolla, extra queso, sin hielo, etc.)

## Lint and Typecheck

```bash
npm run lint          # ESLint
npm run typecheck     # tsc --noEmit
```

Both run in CI. Must pass before merge.

## Git Workflow

```bash
# Create feature branch
git checkout -b feat/my-feature

# Make changes, commit
git add .
git commit -m "feat: description of change"

# Push and create PR
git push -u origin feat/my-feature
# → Open PR to main on GitHub

# After review + CI passes → squash merge
```

Conventional commits:
```
feat:     new feature
fix:      bug fix
chore:    dependency updates, config changes
docs:     documentation only
test:     test changes only
refactor: code restructuring, no behavior change
```

Branch naming: `feat/<name>` | `fix/<name>` | `chore/<name>`

## Environment Variables

File: `.env` (from `.env.example`)

```
DATABASE_URL=postgresql://sor_user:sor_pass@localhost:5432/sor
JWT_SECRET=<openssl rand -hex 32>
JWT_REFRESH_SECRET=<openssl rand -hex 32>
CORS_ORIGIN=http://localhost:5173
PORT=3000
NODE_ENV=development
```

In CI: `DATABASE_URL` points to CI postgres service, `JWT_SECRET` from GitHub Secrets.

## Docker

```bash
# Dev (hot reload)
docker compose up

# Stop and cleanup
docker compose down -v
```

### Production Builds

```bash
# Build production images (multi-stage)
docker build -t sor-server:latest -f server/Dockerfile .
docker build -t sor-client:latest -f client/Dockerfile .

# Tag for registry
docker tag sor-server:latest ghcr.io/org/sor-server:$(git rev-parse --short HEAD)
docker tag sor-client:latest ghcr.io/org/sor-client:$(git rev-parse --short HEAD)

# Login and push to GitHub Container Registry
docker login ghcr.io -u $GITHUB_ACTOR -p $GITHUB_TOKEN
docker push ghcr.io/org/sor-server:$(git rev-parse --short HEAD)
docker push ghcr.io/org/sor-client:$(git rev-parse --short HEAD)
```

### Image Security

```bash
# Vulnerability scan (fails on CRITICAL or HIGH)
trivy image --severity CRITICAL,HIGH sor-server:latest

# Generate SARIF report for CI
trivy image --format sarif --output trivy-results.sarif sor-server:latest

# Sign image with Cosign (keyless via GitHub OIDC)
cosign sign --yes ghcr.io/org/sor-server@<digest>
```

### Server Dockerfile (Multi-stage)

```
Stage 1: node:24-alpine → npm ci → tsc build
Stage 2: node:24-alpine → copy dist + node_modules → run as appuser
HEALTHCHECK: wget /api/health every 30s
```

### Client Dockerfile (Multi-stage)

```
Stage 1: node:24-alpine → npm ci → vite build
Stage 2: nginx:1.29-alpine → copy dist → nginx.conf
HEALTHCHECK: wget / every 30s
```

## CI Pipeline (GitHub Actions)

```
Pull Request → main triggers:
  1. lint            npm run lint
  2. typecheck       npm run typecheck
  3. test-server     npm run test:server (postgres service container)
  4. test-client     npm run test:client

Push to main triggers (after PR checks pass):
  1-4. Same as above (re-run on main)
  5. e2e             npm run test:e2e (Playwright + chromium)
  6. build & push    Docker build → push to ghcr.io → Trivy scan → Cosign sign
  7. deploy-staging  Auto-deploy, smoke tests (GET /api/health, login, create order)
  8. deploy-prod     Manual approval required → deploy → smoke tests

Key secrets: DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET (CI), GITHUB_TOKEN (ghcr.io push)
Artifacts: coverage-server, coverage-client, playwright-report (on failure)
```

## Graceful Shutdown

The server handles SIGTERM/SIGINT in order:
```typescript
// server/src/index.ts
async function shutdown(signal: string) {
  server.close();         // 1. Stop accepting HTTP
  io.close();             // 2. Close WebSocket connections
  // await db.$client.end();  // 3. Close DB pool (Drizzle)
  process.exit(0);
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
```
