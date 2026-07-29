# CI/CD Pipeline Design -- Alfredo's

---

## Estrategia de Branching: Trunk-Based

```
main ──────────────────────────────────────────────
  │
  ├── feat/orders-crud ──► PR ──► squash merge ──► main
  ├── feat/kds-realtime ──► PR ──► squash merge ──► main
  └── fix/payment-validation ──► PR ──► squash merge ──► main
```

- **`main`:** Siempre deployable. Cada merge a main dispara CI completo + deploy a staging.
- **Feature branches:** Corta duracion (< 2 dias). Naming: `feat/`, `fix/`, `chore/`.
- **Squash merge:** Un commit por feature en main. Historial limpio.
- **No `develop` branch.** Trunk-based elimina la necesidad.

---

## Workflow 1: CI (Pull Request + Push a Main)

Dispara en: `pull_request` a main, `push` a main

Archivo: `.github/workflows/ci.yml`

```yaml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '24' }
      - run: npm ci
      - run: npm run lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '24' }
      - run: npm ci
      - run: npm run typecheck

  test-server:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:18-alpine
        env:
          POSTGRES_DB: Alfredo's_test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        ports: ['5432:5432']
        options: >-
          --health-cmd "pg_isready -U test -d sor_test"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '24' }
      - run: npm ci
      - run: npm run db:generate
      - run: npm run db:migrate
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/sor_test
      - run: npm run test:server -- --coverage
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/sor_test
          JWT_SECRET: ${{ secrets.CI_JWT_SECRET }}
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: coverage-server
          path: server/coverage/

  test-client:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '24' }
      - run: npm ci
      - run: npm run test:client -- --coverage
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: coverage-client
          path: client/coverage/

  e2e:
    needs: [test-server, test-client]
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:18-alpine
        env:
          POSTGRES_DB: Alfredo's_test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        ports: ['5432:5432']
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '24' }
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run build
      - run: npm run test:e2e
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/sor_test
          JWT_SECRET: ${{ secrets.CI_JWT_SECRET }}
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Workflow 2: Build & Push (Push a Main)

Dispara en: `push` a main (despues de CI exitoso)

Archivo: `.github/workflows/build.yml`

```yaml
name: Build & Push

on:
  push:
    branches: [main]

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
      id-token: write
    strategy:
      matrix:
        service: [server, client]
    steps:
      - uses: actions/checkout@v4

      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - uses: docker/metadata-action@v5
        id: meta
        with:
          images: ghcr.io/${{ github.repository }}/${{ matrix.service }}
          tags: |
            type=sha,prefix=
            type=ref,event=branch
            type=raw,value=latest,enable=${{ github.ref == 'refs/heads/main' }}

      - uses: docker/build-push-action@v6
        with:
          context: .
          file: ${{ matrix.service }}/Dockerfile
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - uses: aquasecurity/trivy-action@master
        with:
          image-ref: ghcr.io/${{ github.repository }}/${{ matrix.service }}:${{ github.sha }}
          format: sarif
          output: trivy-results.sarif
          severity: CRITICAL,HIGH

      - uses: sigstore/cosign-installer@v3
      - run: cosign sign --yes ghcr.io/${{ github.repository }}/${{ matrix.service }}@${{ steps.meta.outputs.digest }}
```

---

## Workflow 3: Deploy (Push a Main)

Dispara en: `push` a main (despues de Build & Push)

Archivo: `.github/workflows/deploy.yml`

```yaml
name: Deploy

on:
  workflow_run:
    workflows: ["Build & Push"]
    types: [completed]
    branches: [main]

jobs:
  deploy-staging:
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Staging
        run: |
          # Para Railway/Render: actualizar imagen via API
          # curl -X POST https://api.railway.app/deploy ...
          echo "Deploying to staging: ${{ github.sha }}"

      - name: Smoke Tests
        run: |
          sleep 15  # Esperar deploy
          curl -f https://staging.sor.example.com/api/health || exit 1
          curl -f https://staging.sor.example.com || exit 1

  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://sor.example.com
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Production
        run: |
          echo "Deploying to production: ${{ github.sha }}"
          # Deploy via provider API (Railway, Render, AWS ECS, etc.)
```

---

## Entornos de GitHub

| Environment | Proteccion | Approvers | URL |
|-------------|-----------|-----------|-----|
| `staging` | Auto-deploy desde main | Ninguno (automatico) | staging.sor.example.com |
| `production` | Manual approval | Tech Lead | sor.example.com |

Reglas:
- **Staging:** Despliegue automatico tras CI + Build exitosos.
- **Production:** Requiere aprobacion manual. Solo Tech Lead puede aprobar.

---

## Secrets Requeridos

| Secret | Proposito | Workflow |
|--------|-----------|----------|
| `CI_JWT_SECRET` | JWT para integration tests | CI (test-server, e2e) |
| `DOCKER_USERNAME` | ghcr.io push | Build & Push |
| `DOCKER_PASSWORD` | ghcr.io push | Build & Push |
| `STAGING_DEPLOY_URL` | API endpoint para deploy | Deploy (staging) |
| `PRODUCTION_DEPLOY_URL` | API endpoint para deploy | Deploy (production) |
| `STAGING_DATABASE_URL` | Smoke tests en staging | Deploy |
| `PRODUCTION_DATABASE_URL` | Smoke tests en prod | Deploy |

---

## Convenciones de Commits (Conventional Commits)

```
feat: agregar creacion de ordenes con modificadores
fix: validar que mesa no tenga orden activa al crear nueva
chore: actualizar dependencias de Socket.io
docs: documentar endpoints del modulo de caja
test: agregar tests de integracion para OrdersService
refactor: extraer maquina de estados de orden a enum
```

Esto permite:
- Changelog automatico con `semantic-release`
- Versionado semantico (major.minor.patch)
- Facil navegacion del historial

---

## Pipeline Visual

```
PR a main
  │
  ▼
┌─────────┐   ┌──────────┐   ┌─────────────┐   ┌──────────┐
│  Lint   │──►│ TypeCheck │──►│  Test Server │──►│ E2E (main│
│         │   │           │   │  Test Client │   │   only)  │
└─────────┘   └──────────┘   └─────────────┘   └──────────┘
                                                       │
                                              (solo en push a main)
                                                       ▼
                                              ┌─────────────────┐
                                              │  Build & Push    │
                                              │  (ghcr.io)       │
                                              │  Trivy + Cosign  │
                                              └────────┬────────┘
                                                       ▼
                                              ┌─────────────────┐
                                              │  Deploy Staging  │
                                              │  Smoke Tests     │
                                              └────────┬────────┘
                                                       ▼
                                              ┌─────────────────┐
                                              │  Deploy Prod     │
                                              │  (manual approve)│
                                              └─────────────────┘
```
