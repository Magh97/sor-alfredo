# SOR -- Sistema de Gestion de Ordenes para Restaurantes

Plataforma web para digitalizar el flujo completo de ordenes en un restaurante de servicio a mesa: toma de orden por meseros, envio a cocina en tiempo real, modificaciones de platillos, registro de pagos, corte de caja y reportes.

## Quick Start

```bash
git clone <repo-url> && cd sor
cp .env.example .env
docker compose up
```

Abrir http://localhost:5173 (frontend) y http://localhost:3000 (API).

## Stack

| Capa | Tecnologia |
|------|-----------|
| Frontend | React 19 + Vite + Tailwind CSS |
| Backend | Node.js 24 + Express 5 + TypeScript |
| Base de Datos | PostgreSQL 18 |
| ORM | Drizzle |
| Tiempo Real (KDS) | Socket.io |
| Autenticacion | JWT Bearer |

## Documentacion

- [Especificacion del Sistema](docs/Sistema_Gestion_Ordenes_Restaurantes.md)
- [Arquitectura](docs/ARCHITECTURE.md)
- [API Reference](docs/API.md)
- [Modelo de Datos](docs/DATA_MODEL.md)
- [Onboarding](docs/ONBOARDING.md)
- [ADRs](docs/adr/)

## Actores

| Actor | Descripcion |
|-------|------------|
| Mesero | Toma ordenes, asigna mesas, envia a cocina |
| Cajero | Registra pagos, corte de caja, reportes |
| Administrador | Control total: catalogo, usuarios, configuracion |

## Modulos

- **Ordenes (ORD):** Creacion, modificacion, envio a cocina, seguimiento de estados
- **Mesas (MES):** Mapa de mesas, asignacion, estado de ocupacion
- **Cocina (KDS):** Pantalla de ordenes entrantes en tiempo real
- **Catalogo (CAT):** Platillos, complementos, categorias, precios
- **Usuarios (USR):** Roles y permisos (mesero, cajero, admin)
- **Caja y Pagos (CAJ):** Registro de pagos, corte de caja, propinas
- **Reportes (RPT):** Ventas, productos mas vendidos, desempeno

## Licencia

Propietario.
