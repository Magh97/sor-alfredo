# STACK

| Layer | Tech | Version | Dev-Kit |
|-------|------|---------|---------|
| Runtime | Node.js | 24 | nodejs-core |
| Language | TypeScript | 5.7 | nodejs-core |
| Backend Framework | Express | 5 | nodejs-express |
| Frontend Framework | React | 19 | react-core |
| Build Tool | Vite | 6 | — |
| CSS Framework | Tailwind CSS | 4.3 | Note: experimental variant uses Victorian brutalist palette + 4-font typography system (Playfair Display, JetBrains Mono, DM Sans, Caveat) |
| UI Primitives | shadcn/ui | latest | react-components |
| Icons | lucide-react | latest | — |
| ORM | Drizzle ORM | latest | nodejs-database |
| Database | PostgreSQL | 18 | postgresql-core |
| Realtime | Socket.io | latest | — |
| Auth | JWT Bearer (jsonwebtoken) | latest | — |
| Validation | Zod | latest | — |
| Testing | Vitest | latest | nodejs-testing |
| E2E Testing | Playwright | latest | nodejs-testing |
| Integration Test DB | Testcontainers | latest | nodejs-testing |
| HTTP Test | Supertest | latest | nodejs-testing |
| CI/CD | GitHub Actions | v4 | devops-cicd |
| Containers | Docker | v29 | devops-docker |
| Web Server | Nginx | 1.29 | — |

## Package Manager

npm (lock file: package-lock.json)

## Module System

ESM (type: "module" in package.json). Import/export syntax.

## TypeScript Config

target: ES2022, module: NodeNext, strict: true, noUncheckedIndexedAccess: true.

## Path Aliases

```json
{
  "@/*": "./client/src/*",
  "@server/*": "./server/src/*"
}
```
