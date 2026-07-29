# Despliegue y Entornos -- Alfredo's

---

## Arquitectura de Despliegue (MVP)

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Navegador  │────►│  nginx:alpine │────►│  Node.js 24  │
│  (Internet) │     │  (React SPA)  │     │  (Express)   │
│             │     │  :80          │     │  :3000        │
└─────────────┘     └──────────────┘     └──────┬───────┘
                                                 │
                                          ┌──────▼───────┐
                                          │ PostgreSQL 18 │
                                          │ :5432         │
                                          └──────────────┘
```

---

## Dockerfiles

### Server -- Multi-stage

Archivo: `server/Dockerfile`

```dockerfile
# syntax=docker/dockerfile:1

# Stage 1: Build
FROM node:24.14.0-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY drizzle.config.ts ./
COPY src/ src/

RUN npm run build

# Stage 2: Production
FROM node:24.14.0-alpine AS production
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./

USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["node", "dist/index.js"]
```

### Client -- Multi-stage

Archivo: `client/Dockerfile`

```dockerfile
# syntax=docker/dockerfile:1

# Stage 1: Build
FROM node:24.14.0-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY vite.config.ts tsconfig.json index.html ./
COPY public/ public/
COPY src/ src/

RUN npm run build

# Stage 2: Serve
FROM nginx:1.29-alpine AS production

COPY --from=build /app/dist /usr/share/nginx/html
COPY client/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

### Client -- nginx.conf

Archivo: `client/nginx.conf`

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # SPA fallback: todas las rutas a index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy a Express
    location /api/ {
        proxy_pass http://server:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # WebSocket proxy
    location /socket.io/ {
        proxy_pass http://server:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    # Assets con cache inmutable (hasheados por Vite)
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## Docker Compose (Desarrollo)

Archivo: `docker-compose.yml`

```yaml
services:
  postgres:
    image: postgres:18-alpine
    environment:
      POSTGRES_DB: Alfredo's
      POSTGRES_USER: Alfredo's_user
      POSTGRES_PASSWORD: Alfredo's_pass
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U sor_user -d sor"]
      interval: 10s
      timeout: 5s
      retries: 5

  server:
    build:
      context: ./server
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://sor_user:sor_pass@postgres:5432/sor
      JWT_SECRET: dev-secret-change-in-production
      JWT_REFRESH_SECRET: dev-refresh-secret-change-in-production
      CORS_ORIGIN: http://localhost:5173
      NODE_ENV: development
    volumes:
      - ./server/src:/app/src   # Hot reload
    depends_on:
      postgres:
        condition: service_healthy
    command: npm run dev

  client:
    build:
      context: ./client
      dockerfile: Dockerfile.dev
    ports:
      - "5173:5173"
    volumes:
      - ./client/src:/app/src   # Hot reload (Vite HMR)
    depends_on:
      - server

volumes:
  pgdata:
```

### Dockerfile.dev (Server)

Archivo: `server/Dockerfile.dev`

```dockerfile
FROM node:24.14.0-alpine
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json drizzle.config.ts ./
COPY src/ src/

EXPOSE 3000
CMD ["npm", "run", "dev"]
```

---

## Entornos

| Entorno | Proposito | Infraestructura | URL | Branch | Deploy |
|---------|-----------|----------------|-----|--------|--------|
| **Local** | Desarrollo individual | Docker Compose | `localhost:5173` / `:3000` | feature branch | Manual (`docker compose up`) |
| **Staging** | Pruebas de integracion, demos | Railway / Render | `staging.sor.example.com` | `main` | Automatico (CI) |
| **Produccion** | Operacion real del restaurante | Railway Pro o VPS | `sor.example.com` | `main` | Manual approve (CI) |

### Variables de entorno por ambiente

| Variable | Local | Staging | Produccion |
|----------|-------|---------|------------|
| `DATABASE_URL` | `postgresql://sor_user:sor_pass@postgres:5432/sor` | Proporcionado por Railway/Supabase | Proporcionado por proveedor |
| `JWT_SECRET` | `dev-secret` | Generado por CI | Rotado cada 90 dias |
| `JWT_REFRESH_SECRET` | `dev-refresh-secret` | Generado por CI | Rotado cada 90 dias |
| `CORS_ORIGIN` | `http://localhost:5173` | `https://staging.sor.example.com` | `https://sor.example.com` |
| `NODE_ENV` | `development` | `production` | `production` |
| `PORT` | `3000` | `3000` | `3000` |

---

## Health Checks

### API Endpoint

```
GET /api/health
→ 200 { "status": "ok", "timestamp": "2026-07-28T15:30:00Z", "uptime": 123456 }
```

Implementacion:

```typescript
// server/src/health.controller.ts
import { Router } from 'express';

export const healthRouter = Router();

healthRouter.get('/api/health', async (req, res) => {
  // Verificar conexion a BD (opcional, puede ser costoso)
  // const dbOk = await db.execute('SELECT 1');

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

### Docker HEALTHCHECK

- **Server**: `wget http://localhost:3000/api/health` cada 30s.
- **Client**: `wget http://localhost:80/` cada 30s.
- **PostgreSQL**: `pg_isready -U sor_user -d sor` cada 10s.

---

## Graceful Shutdown

```typescript
// server/src/index.ts
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { app } from './app';
import { db } from './db';

const server = createServer(app);
const io = new SocketIOServer(server);

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Graceful shutdown
async function shutdown(signal: string) {
  console.log(`Received ${signal}. Starting graceful shutdown...`);

  // 1. Dejar de aceptar nuevas conexiones HTTP
  server.close(() => {
    console.log('HTTP server closed');
  });

  // 2. Cerrar todas las conexiones WebSocket
  io.close(() => {
    console.log('Socket.io server closed');
  });

  // 3. Cerrar pool de conexiones a BD
  // await db.$client.end();  // Drizzle
  console.log('Database connections closed');

  // 4. Salir
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
```

---

## Backups de Base de Datos

### Estrategia (MVP)

| Frecuencia | Tipo | Retencion | Herramienta |
|------------|------|-----------|-------------|
| Diario | Completo (pg_dump) | 30 dias | Railway/Supabase auto-backup |
| Antes de cada migracion | Completo manual | Local | `pg_dump sor > backup_$(date +%Y%m%d).sql` |

### Verificacion de backups

```bash
# Restaurar backup en BD temporal para verificar integridad
createdb sor_restore_test
psql sor_restore_test < backup_20260728.sql
# Ejecutar smoke tests contra BD restaurada
psql sor_restore_test -c "SELECT COUNT(*) FROM orders"
dropdb sor_restore_test
```

### Plan de Recuperacion

1. Detectar falla (monitoreo: health check falla).
2. Notificar al Tech Lead (canal de equipo).
3. Si es caida de BD: restaurar ultimo backup diario.
4. Verificar integridad: smoke tests.
5. Reenrutar trafico a instancia recuperada.
6. **RTO objetivo:** < 30 min. **RPO objetivo:** < 24h.

---

## Monitoreo Basico (MVP)

| Metrica | Herramienta | Alerta |
|---------|------------|--------|
| API uptime | Health check endpoint | Caida > 1 min |
| BD conectada | `pg_isready` | Fallo de conexion |
| Uso de CPU/RAM | Railway/Render dashboard | > 80% |
| Errores 5xx | Logs de Express | Tasa > 5% en 5 min |
| Latencia API | Middleware de timing | p95 > 2s |

En Fase 2 se evalua agregar OpenTelemetry + Grafana + Prometheus para observabilidad completa.

---

## Checklist de Deploy

- [ ] `docker compose up` funciona en local (desarrollo nuevo)
- [ ] CI pasa (lint + typecheck + tests)
- [ ] Build de Docker sin errores
- [ ] Imagen escaneada con Trivy (sin CRITICAL)
- [ ] Imagen firmada con Cosign
- [ ] Deploy a staging
- [ ] Smoke test en staging (`GET /api/health` + login + crear orden)
- [ ] Aprobar deploy a produccion
- [ ] Verificar health check en produccion
- [ ] Verificar KDS recibe ordenes en produccion
