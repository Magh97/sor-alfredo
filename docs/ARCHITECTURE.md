# Arquitectura del Sistema SOR

## C4 Nivel 1 -- System Context

```mermaid
graph LR
    M[Mesero] -->|"Tablet (Web)"| SPA[React SPA]
    C2[Cajero] -->|"PC Caja"| SPA
    A[Administrador] -->|"PC Admin"| SPA
    SPA -->|"REST/JSON + WebSocket"| API[Express API]
    API --> DB[(PostgreSQL)]
    API --> KDS[Pantalla de Cocina]
    KDS -->|"WebSocket"| API
```

---

## C4 Nivel 2 -- Container

```mermaid
graph TB
    subgraph "Clientes Web"
        W[React SPA<br/>Vite + Tailwind CSS<br/>:5173]
        KDS_SCR[KDS Screen<br/>React + WebSocket<br/>:5173 /kds]
    end

    subgraph "Backend"
        API[Express 5 API<br/>TypeScript<br/>:3000]
        WS[Socket.io Server<br/>Real-time<br/>:3000]
    end

    subgraph "Datos"
        DB[(PostgreSQL 18<br/>:5432)]
    end

    W -->|"REST/JSON"| API
    KDS_SCR -->|"WebSocket"| WS
    W -->|"WebSocket<br/>(notificaciones)"| WS
    API --> DB
    WS --> DB
```

---

## C4 Nivel 3 -- Component (API Express)

```mermaid
graph TB
    subgraph "Express API"
        AUTH[Auth Module<br/>JWT + Refresh]
        ORD[Orders Module<br/>ORD]
        MES[Tables Module<br/>MES]
        KDS_MOD[KDS Module<br/>WebSocket events]
        CAT[Catalog Module<br/>CAT]
        USR[Users Module<br/>USR]
        CAJ[Cash & Payments<br/>CAJ]
        RPT[Reports Module<br/>RPT]
        SHARED[Shared Kernel<br/>Middleware, Errors, Pagination]
    end

    AUTH --> SHARED
    ORD --> SHARED
    ORD --> CAJ
    MES --> SHARED
    KDS_MOD --> ORD
    CAT --> SHARED
    USR --> SHARED
    CAJ --> ORD
    CAJ --> SHARED
    RPT --> ORD
    RPT --> CAJ
    RPT --> SHARED
```

---

## Flujo Principal -- Sequence Diagram

```mermaid
sequenceDiagram
    actor M as Mesero
    participant W as React SPA
    participant A as Express API
    participant D as PostgreSQL
    participant WS as Socket.io
    participant K as KDS Screen

    M->>W: Selecciona mesa, crea orden
    W->>A: POST /api/orders
    A->>D: INSERT Order + OrderItems
    A->>WS: Emit 'order:new'
    WS-->>K: Nueva orden entrante
    A-->>W: 201 {order}

    Note over K: Cocina prepara platillos

    K->>WS: Marcar orden lista
    WS->>A: Evento 'order:ready'
    A->>D: UPDATE Order status='Lista'
    A->>WS: Emit 'order:status-changed'
    WS-->>W: Notificar mesero

    M->>W: Solicitar cuenta
    W->>A: PUT /api/orders/:id/invoice
    A-->>W: 200 {invoice}

    actor C as Cajero
    C->>W: Registrar pago
    W->>A: POST /api/orders/:id/payment
    A->>D: INSERT Payment, UPDATE Order status='Cerrada'
    A-->>W: 201 {payment, receipt}
```

---

## Modulos del Backend

### Orders Module (`src/modules/orders/`)

Proposito: Gestiona el ciclo de vida completo de ordenes de consumo.

Endpoints:
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/orders` | Listar ordenes con filtros (mesa, mesero, estado) |
| POST | `/api/orders` | Crear nueva orden vinculada a mesa |
| GET | `/api/orders/:id` | Obtener detalle de orden con items y modificadores |
| PUT | `/api/orders/:id` | Agregar items o modificar orden activa |
| POST | `/api/orders/:id/send-to-kitchen` | Enviar orden a cocina |
| POST | `/api/orders/:id/cancel-item` | Cancelar item de orden |
| PUT | `/api/orders/:id/invoice` | Generar cuenta |

Dependencias: Tables, Catalog, KDS (via Socket.io), Payments

Archivos clave:
- `orders.controller.ts` -- HTTP handlers
- `orders.service.ts` -- Logica de negocio, maquina de estados
- `orders.repository.ts` -- Acceso a datos (Drizzle)
- `orders.schema.ts` -- Zod schemas y tipos

---

### Tables Module (`src/modules/tables/`)

Proposito: Gestiona el mapa de mesas y su estado de ocupacion.

Endpoints:
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/tables` | Listar mesas con estado actual |
| POST | `/api/tables` | Crear mesa (admin) |
| PUT | `/api/tables/:id` | Editar mesa |
| PUT | `/api/tables/:id/status` | Cambiar estado (Libre/Ocupada/Limpieza) |

Dependencias: Orders (para validar transferencias)

---

### Catalog Module (`src/modules/catalog/`)

Proposito: CRUD de platillos, complementos y categorias.

Endpoints:
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/catalog/products` | Listar platillos disponibles |
| POST | `/api/catalog/products` | Agregar platillo |
| PUT | `/api/catalog/products/:id` | Modificar platillo |
| POST | `/api/catalog/modifiers` | Agregar complemento |
| PUT | `/api/catalog/modifiers/:id` | Modificar complemento |
| GET | `/api/catalog/categories` | Listar categorias |

---

### Users Module (`src/modules/users/`)

Proposito: Gestion de usuarios, roles y autenticacion.

Endpoints:
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| POST | `/api/auth/login` | Iniciar sesion, devuelve JWT |
| POST | `/api/auth/refresh` | Refrescar token |
| GET | `/api/users` | Listar usuarios (admin) |
| POST | `/api/users` | Crear usuario |
| PUT | `/api/users/:id` | Modificar usuario |
| DELETE | `/api/users/:id` | Desactivar usuario (baja logica) |

---

### Cash & Payments Module (`src/modules/cash/`)

Proposito: Registro de pagos, corte de caja y distribucion de propinas.

Endpoints:
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| POST | `/api/orders/:id/payment` | Registrar pago de orden |
| GET | `/api/cash-register/current` | Obtener corte de caja activo |
| POST | `/api/cash-register/open` | Abrir turno de caja |
| POST | `/api/cash-register/close` | Cerrar turno, generar reporte |
| GET | `/api/tips` | Reporte de propinas por empleado |

---

### Reports Module (`src/modules/reports/`)

Proposito: Reportes de ventas, productos y desempeno.

Endpoints:
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/reports/sales` | Ventas por periodo |
| GET | `/api/reports/top-products` | Productos mas vendidos |
| GET | `/api/reports/orders-by-user` | Ordenes y desempeno por mesero |
| GET | `/api/reports/cash-history` | Historico de cortes de caja |

---

## Estrategia de Tiempo Real (KDS)

La pantalla de cocina utiliza **Socket.io** para comunicacion bidireccional en tiempo real:

| Evento | Direccion | Proposito |
|--------|-----------|-----------|
| `order:new` | Server → KDS | Nueva orden enviada a cocina |
| `order:updated` | Server → KDS | Items agregados a orden activa |
| `order:ready` | KDS → Server | Cocinero marca orden como lista |
| `order:status-changed` | Server → Mesero | Notificacion de cambio de estado |
| `order:cancelled` | Server → KDS | Mesero cancela orden en cocina |

El servidor Socket.io comparte el mismo puerto HTTP (3000) que Express. Para escalar a multiples instancias en el futuro, se adoptara el adaptador de Redis.

---

## Seguridad

- **Autenticacion:** JWT Bearer con expiracion de 8 horas + refresh token
- **Autorizacion:** Middleware por rol (`requireRole('admin')`, `requireRole('cashier')`)
- **Auditoria:** Log de cambios criticos en ordenes y pagos (entidad `AuditLog`)
- **Validacion:** Zod schemas en capa de entrada, validacion de negocio en servicios
