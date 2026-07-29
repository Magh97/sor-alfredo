# 📋 Sistema de Gestión de Órdenes para Restaurantes (Alfredo's)

## 1. 📋 Visión General

El **Sistema de Gestión de Órdenes para Restaurantes (Alfredo's)** es una plataforma web diseñada para digitalizar y controlar el flujo completo de órdenes en un restaurante de servicio a mesa. Permite a meseros tomar órdenes asignadas a mesas, enviarlas a cocina en tiempo real, gestionar modificaciones de platillos, y facilita al cajero el registro de pagos, corte de caja y generación de reportes. El administrador controla el catálogo de productos, complementos, usuarios y la configuración del sistema.

**Alcance General:** El sistema gestiona órdenes, mesas, catálogo de productos, usuarios, pagos y reportes básicos. **No incluye** inventario de insumos, reservaciones de mesas, programa de lealtad, ni integración con MercadoPago en el MVP (preparado para futura extensión).

---

## 2. 🎯 Objetivos del Sistema

| # | Objetivo | Métrica de Éxito | Prioridad |
|---|----------|------------------|-----------|
| 1 | Reducir el tiempo de comunicación entre mesero y cocina en un 40% | Tiempo promedio de envío de orden < 30 segundos | Alta |
| 2 | Eliminar errores por órdenes manuscritas ilegibles | Tasa de devoluciones por error de orden < 2% | Alta |
| 3 | Centralizar el control de pagos y corte de caja | Cierre de caja diario en < 5 minutos | Alta |
| 4 | Permitir modificaciones dinámicas de órdenes activas | 100% de órdenes modificables sin crear nueva orden | Alta |
| 5 | Generar reportes de ventas y desempeño en tiempo real | Reportes disponibles con máximo 5 minutos de retraso | Media |
| 6 | Preparar arquitectura para escalabilidad a múltiples sucursales | Migración a multi-sucursal sin reescritura de core | Media |
| 7 | Facilitar el seguimiento de propinas por empleado | Registro de propinas vinculado a cajero/mesero en 100% de órdenes | Media |
| 8 | Proveer visibilidad de estado de órdenes para meseros | Mesero consulta estado de cualquier orden en < 3 clics | Baja |

---

## 3. ⚖️ Alcance

### 3.1 Dentro del Alcance (In-Scope)

- **Gestión de Órdenes (ORD):** Creación, modificación, envío a cocina, seguimiento de estados y cierre.
- **Gestión de Mesas (MES):** Mapa de mesas configurable, asignación de órdenes a mesa, estado de ocupación.
- **Catálogo de Productos (CAT):** Platillos, complementos/modificadores, categorías, precios.
- **Gestión de Usuarios (USR):** Creación, edición, asignación de roles y permisos.
- **Caja y Pagos (CAJ):** Registro de pagos, corte de caja diario, reporte por cajero/mesero.
- **Pantalla de Cocina (KDS):** Visualización en tiempo real de órdenes entrantes con detalle completo.
- **Reportes Básicos (RPT):** Ventas por período, productos más vendidos, órdenes por mesero, corte de caja, propinas por empleado.
- **Propinas (PRO):** Registro opcional por orden, configuración de reparto (equitativo o individual).
- **Multi-sucursal preparado (MSC):** Estructura de datos lista para extensión futura.

### 3.2 Fuera del Alcance (Out-of-Scope)

| Funcionalidad | Por qué se excluye |
|---------------|-------------------|
| **Inventario de insumos** | Proyecto separado recomendado para no dilatar MVP. La arquitectura dejará FK preparada. |
| **Integración con MercadoPago** | Requerimiento futuro. Se deja endpoint preparado pero no se implementa en MVP. |
| **Reservaciones de mesas** | No mencionado en requerimientos. Agrega complejidad de calendario y notificaciones. |
| **Programa de lealtad / CRM de clientes** | Los clientes finales no acceden al sistema. Se evalúa en fase de escalabilidad. |
| **App móvil nativa** | Web responsive cubre tablets y celulares. App nativa es fase futura si se justifica. |
| **Planos interactivos de mesas con drag-and-drop** | El mapa es configuración sencilla en MVP. Diseño visual complejo es fase de optimización. |

---

## 4. 👥 Actores del Sistema

| Actor | Rol | Acceso Principal | Nivel de Permisos |
|-------|-----|------------------|-------------------|
| **Mesero** | Toma órdenes de comensales, asigna mesas, envía a cocina, consulta estados | Tablet/móvil (web) | Órdenes propias, mesas, catálogo (solo lectura), propinas |
| **Cajero** | Registra pagos, ingresa órdenes, realiza corte de caja, consulta reportes | PC/tablet en caja | Todas las órdenes (lectura/escritura en pago), corte de caja, reportes de caja |
| **Administrador** | Control total del sistema, gestiona catálogo, usuarios, configuración | PC (web) | Acceso completo a todos los módulos del restaurante |
| **Super Administrador** | Control de múltiples sucursales (rol futuro) | PC (web) | Acceso a todos los restaurantes, reportes consolidados, gestión de franquicia |

> **Nota:** Los clientes finales (comensales) **NO** son actores del sistema. Interactúan presencialmente con el mesero.

---

## 5. 🧩 Módulos y Funcionalidades

### Módulo: Órdenes (ORD)

| ID | Funcionalidad | Descripción | Prioridad |
|----|---------------|-------------|-----------|
| ORD-01 | Crear orden | Mesero crea nueva orden vinculada a una mesa | Alta |
| ORD-02 | Agregar platillos a orden | Selección de platillos del catálogo con cantidad | Alta |
| ORD-03 | Modificar platillo (complementos) | Agregar/quitar modificadores a un platillo específico | Alta |
| ORD-04 | Enviar orden a cocina | Cambio de estado a "En Cocina" y notificación al KDS | Alta |
| ORD-05 | Agregar items a orden activa | Añadir postres, bebidas o platillos adicionales sin crear nueva orden | Alta |
| ORD-06 | Ver detalle de órdenes propias | Filtrar por: en cocina, entregadas al cliente, pagadas | Alta |
| ORD-07 | Cancelar item de orden | Eliminación de un platillo antes de envío a cocina | Media |
| ORD-08 | Ver historial de órdenes | Consulta de órdenes pasadas del mesero | Baja |

### Módulo: Mesas (MES)

| ID | Funcionalidad | Descripción | Prioridad |
|----|---------------|-------------|-----------|
| MES-01 | Configurar mapa de mesas | Administrador define número, nombre y ubicación aproximada | Alta |
| MES-02 | Asignar orden a mesa | Vinculación de orden activa a mesa específica | Alta |
| MES-03 | Cambiar estado de mesa | Libre, Ocupada, Reservada (manual), Limpieza | Alta |
| MES-04 | Transferir orden de mesa | Mover orden activa a otra mesa (ej. unión de mesas) | Media |

### Módulo: Cocina / KDS (KDS)

| ID | Funcionalidad | Descripción | Prioridad |
|----|---------------|-------------|-----------|
| KDS-01 | Visualizar órdenes entrantes | Lista en tiempo real de órdenes con estado "En Cocina" | Alta |
| KDS-02 | Ver detalle de orden | Nombre de platillos, modificaciones, cantidad, mesa, mesero | Alta |
| KDS-03 | Marcar orden como lista | Cambio de estado a "Lista para entregar" | Alta |
| KDS-04 | Filtrar órdenes por tiempo | Ordenar por antigüedad (FIFO) o prioridad | Media |
| KDS-05 | Reimprimir ticket (futuro) | Generación de ticket de cocina por orden | Baja |

### Módulo: Catálogo (CAT)

| ID | Funcionalidad | Descripción | Prioridad |
|----|---------------|-------------|-----------|
| CAT-01 | Agregar platillo | Nombre, descripción, precio, categoría, imagen opcional | Alta |
| CAT-02 | Modificar platillo | Edición de atributos y disponibilidad | Alta |
| CAT-03 | Agregar complemento/modificador | Nombre, precio adicional (si aplica), platillos aplicables | Alta |
| CAT-04 | Modificar complemento | Edición de modificadores existentes | Alta |
| CAT-05 | Categorizar productos | Agrupación por tipo (entrada, plato fuerte, postre, bebida) | Media |
| CAT-06 | Activar/desactivar producto | Control de disponibilidad temporal sin eliminar | Media |

### Módulo: Usuarios (USR)

| ID | Funcionalidad | Descripción | Prioridad |
|----|---------------|-------------|-----------|
| USR-01 | Crear usuario | Nombre, rol, credenciales, restaurante asignado | Alta |
| USR-02 | Modificar usuario | Edición de datos y cambio de rol | Alta |
| USR-03 | Desactivar usuario | Baja lógica sin eliminar historial | Alta |
| USR-04 | Ver listado de usuarios | Tabla con filtros por rol y estado | Media |

### Módulo: Caja y Pagos (CAJ)

| ID | Funcionalidad | Descripción | Prioridad |
|----|---------------|-------------|-----------|
| CAJ-01 | Ver todas las órdenes | Listado completo con filtros por estado y mesero | Alta |
| CAJ-02 | Modificar orden | Corrección de items, cantidades o precios (con auditoría) | Alta |
| CAJ-03 | Registrar pago | Método de pago, monto, propina, cierre de orden | Alta |
| CAJ-04 | Generar cuenta/recibo | Impresión o visualización de ticket de cuenta | Alta |
| CAJ-05 | Corte de caja diario | Resumen de ingresos, pagos por método, propinas por cajero | Alta |
| CAJ-06 | Reporte de propinas por empleado | Desglose de propinas recibidas por mesero/cajero | Alta |
| CAJ-07 | Ingresar orden directamente | Cajero puede crear orden sin mesero (pedido telefónico/para llevar) | Media |

### Módulo: Reportes (RPT)

| ID | Funcionalidad | Descripción | Prioridad |
|----|---------------|-------------|-----------|
| RPT-01 | Ventas por período | Ingresos totales por día/semana/mes | Media |
| RPT-02 | Productos más vendidos | Ranking por cantidad e ingresos | Media |
| RPT-03 | Órdenes por mesero | Desempeño y volumen por empleado | Media |
| RPT-04 | Corte de caja por turno | Comparativa de cortes históricos | Media |
| RPT-05 | Propinas por empleado | Acumulado y promedio por trabajador | Media |

### Módulo: Configuración (CFG)

| ID | Funcionalidad | Descripción | Prioridad |
|----|---------------|-------------|-----------|
| CFG-01 | Configurar propinas | Modo reparto (equitativo entre todo el personal) o individual (solo mesero) | Alta |
| CFG-02 | Configurar métodos de pago | Efectivo, tarjeta, transferencia (registro manual) | Alta |
| CFG-03 | Preparar multi-sucursal | Activar estructura de datos para futura expansión | Baja |

---

## 6. 🎬 Casos de Uso Principales

### Diagrama de Flujo del Proceso Típico

```
┌─────────────────────────┐
│  Cliente llega al       │
│  restaurante              │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  Mesero asigna mesa     │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  Mesero toma orden      │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  Agrega/modifica        │
│  platillos y            │
│  complementos           │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  Mesero envía orden     │
│  a cocina               │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  Orden en Cocina        │
│  (KDS)                  │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  Cocina prepara         │
│  platillos              │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  Cocina marca orden     │
│  como lista             │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  Mesero entrega orden   │
│  al cliente             │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  Cliente solicita       │
│  cuenta                 │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  Cajero genera          │
│  cuenta/recibo          │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  Cliente paga           │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  Cajero registra pago   │
│  y propina              │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  Orden cerrada          │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  Cajero realiza corte   │
│  de caja (fin de turno) │
└─────────────────────────┘
```

---

### CU-01: Tomar Orden y Enviar a Cocina

| Campo | Descripción |
|-------|-------------|
| **Actor** | Mesero |
| **Precondición** | Mesero autenticado. Mesa libre o ocupada en el sistema. Catálogo de productos activo. |
| **Flujo Principal** | 1. Mesero selecciona mesa del mapa. 2. Crea nueva orden (o reutiliza orden activa si ya existe). 3. Agrega platillos desde el catálogo. 4. Especifica cantidad de cada platillo. 5. Modifica complementos si el cliente lo solicita (ej. "sin cebolla"). 6. Revisa resumen de la orden. 7. Confirma y envía a cocina. 8. Sistema cambia estado a "En Cocina" y notifica al KDS. |
| **Postcondición** | Orden creada con estado "En Cocina". Visible en pantalla de cocina. Mesero puede consultarla en su lista de órdenes activas. |
| **Excepciones** | **E1:** Platillo sin stock (catálogo lo marca como no disponible) → Sistema bloquea selección y muestra alerta. **E2:** Conexión perdida al enviar → Sistema guarda orden en cola local y sincroniza al restablecer conexión. |

---

### CU-02: Modificar Orden Activa (Agregar Items)

| Campo | Descripción |
|-------|-------------|
| **Actor** | Mesero |
| **Precondición** | Orden existe con estado "En Cocina" o "Lista". Mesero es el creador de la orden (o tiene permiso de edición). |
| **Flujo Principal** | 1. Mesero busca orden en su lista de órdenes activas. 2. Selecciona "Agregar items". 3. Selecciona nuevos platillos/complementos del catálogo. 4. Confirma adición. 5. Sistema genera nueva notificación al KDS con los items adicionales marcados como "nuevos". |
| **Postcondición** | Orden actualizada con nuevos items. Cocina recibe notificación diferenciada. |
| **Excepciones** | **E1:** Orden ya en estado "Entregada" → Sistema bloquea modificación y sugiere crear nueva orden. **E2:** Item agregado ya no disponible → Sistema notifica y solicita alternativa. |

---

### CU-03: Visualizar Órdenes en Cocina (KDS)

| Campo | Descripción |
|-------|-------------|
| **Actor** | Cocina (rol de sistema, no usuario autenticado individualmente) |
| **Precondición** | Pantalla de cocina encendida y conectada al sistema. Órdenes en estado "En Cocina". |
| **Flujo Principal** | 1. Sistema muestra lista de órdenes ordenadas por hora de envío (FIFO). 2. Cada orden muestra: número de mesa, mesero, platillos, cantidad, modificaciones/complementos. 3. Cocinero selecciona orden para preparar. 4. Al finalizar, marca orden como "Lista". 5. Sistema notifica al mesero correspondiente. |
| **Postcondición** | Orden cambia a estado "Lista". Desaparece de KDS principal (o se mueve a sección "Listas"). |
| **Excepciones** | **E1:** Orden cancelada por mesero mientras está en cocina → Sistema retira orden del KDS y muestra alerta de cancelación. **E2:** Falla de conexión de pantalla → Sistema intenta reconexión automática cada 10 segundos; muestra último estado cacheado. |

---

### CU-04: Registrar Pago y Cerrar Orden

| Campo | Descripción |
|-------|-------------|
| **Actor** | Cajero |
| **Precondición** | Orden en estado "Entregada". Cajero autenticado. |
| **Flujo Principal** | 1. Cajero busca orden por número o mesa. 2. Revisa detalle de consumo. 3. Genera cuenta/recibo (vista previa). 4. Cliente entrega pago. 5. Cajero selecciona método de pago y registra monto. 6. Si aplica, registra propina y selecciona reparto (equitativo o individual). 7. Confirma pago. 8. Sistema cambia estado a "Pagada" y luego "Cerrada". |
| **Postcondición** | Orden cerrada. Pago registrado en corte de caja. Propina distribuida según configuración. Recibo generado. |
| **Excepciones** | **E1:** Pago parcial → Sistema permite registrar abono y mantiene orden en estado "Pago Parcial". **E2:** Error en monto registrado → Cajero puede corregir dentro de los 5 minutos posteriores con auditoría de cambio. |

---

### CU-05: Corte de Caja y Reporte de Propinas

| Campo | Descripción |
|-------|-------------|
| **Actor** | Cajero |
| **Precondición** | Cajero autenticado. Turno activo con pagos registrados. |
| **Flujo Principal** | 1. Cajero accede a módulo de Corte de Caja. 2. Sistema muestra resumen: total de órdenes, ingresos por método de pago, propinas totales. 3. Cajero verifica montos físicos vs. sistema. 4. Genera reporte de propinas por empleado (desglose de quién recibió qué). 5. Confirma cierre de turno. 6. Sistema genera PDF de corte y bloquea edición de pagos del turno. |
| **Postcondición** | Turno cerrado. Reporte de corte almacenado. Pagos del turno bloqueados para edición. |
| **Excepciones** | **E1:** Discrepancia en montos → Cajero registra observación antes de cerrar. Administrador puede revisar posteriormente. **E2:** Orden pendiente de pago al cerrar → Sistema alerta y permite dejar orden en estado "Pendiente" o transferir a siguiente turno. |

---

### CU-06: Gestión de Catálogo por Administrador

| Campo | Descripción |
|-------|-------------|
| **Actor** | Administrador |
| **Precondición** | Administrador autenticado. |
| **Flujo Principal** | 1. Administrador accede a módulo de Catálogo. 2. Selecciona "Agregar platillo". 3. Ingresa nombre, descripción, precio, categoría. 4. Define complementos/modificadores disponibles. 5. Guarda platillo. 6. Platillo disponible inmediatamente para meseros. |
| **Postcondición** | Nuevo platillo activo en catálogo. Visible para toma de órdenes. |
| **Excepciones** | **E1:** Nombre de platillo duplicado → Sistema sugiere nombre alternativo o confirmación de duplicado. **E2:** Precio negativo o cero → Sistema valida y bloquea guardado. |

---

## 7. 🗄️ Entidades Principales

| Entidad | Descripción | Atributos Clave | Relaciones Principales |
|---------|-------------|-----------------|------------------------|
| **Restaurant** | Establecimiento físico (preparado para multi-sucursal) | `id`, `name`, `address`, `phone`, `is_active`, `created_at` | Tiene muchos: Users, Orders, Products, Tables |
| **User** | Usuario del sistema (mesero, cajero, admin, superadmin) | `id`, `restaurant_id`, `name`, `email`, `password_hash`, `role`, `is_active` | Pertenece a Restaurant. Crea Orders. Recibe Tips. |
| **Table** | Mesa física del restaurante | `id`, `restaurant_id`, `number`, `name`, `capacity`, `position_x`, `position_y`, `status` | Pertenece a Restaurant. Tiene muchas Orders. |
| **Order** | Orden de consumo vinculada a una mesa | `id`, `restaurant_id`, `table_id`, `user_id` (mesero), `status`, `total_amount`, `tip_amount`, `tip_distribution`, `created_at`, `closed_at` | Pertenece a Table, User. Tiene muchos OrderItems. Tiene un Payment. |
| **OrderItem** | Línea de orden (platillo específico) | `id`, `order_id`, `product_id`, `quantity`, `unit_price`, `subtotal`, `modifications`, `status` | Pertenece a Order, Product. Tiene muchos OrderItemModifiers. |
| **OrderItemModifier** | Modificación/complemento de un item | `id`, `order_item_id`, `modifier_id`, `quantity`, `price_adjustment` | Pertenece a OrderItem, Modifier. |
| **Product** | Platillo o bebida del catálogo | `id`, `restaurant_id`, `category_id`, `name`, `description`, `base_price`, `image_url`, `is_available` | Pertenece a Restaurant, Category. Tiene muchos Modifiers. |
| **Category** | Agrupación de productos | `id`, `restaurant_id`, `name`, `sort_order` | Pertenece a Restaurant. Tiene muchos Products. |
| **Modifier** | Complemento o modificación aplicable a productos | `id`, `restaurant_id`, `name`, `price_adjustment`, `is_available` | Pertenece a Restaurant. Tiene muchos ProductModifiers. |
| **ProductModifier** | Relación entre producto y modificador disponible | `id`, `product_id`, `modifier_id` | Pertenece a Product, Modifier. |
| **Payment** | Registro de pago de una orden | `id`, `order_id`, `user_id` (cajero), `amount`, `payment_method`, `tip_amount`, `paid_at` | Pertenece a Order, User. |
| **CashRegister** | Corte de caja por turno | `id`, `restaurant_id`, `user_id` (cajero), `opened_at`, `closed_at`, `initial_amount`, `total_sales`, `total_tips`, `status` | Pertenece a Restaurant, User. Tiene muchos Payments. |
| **TipDistribution** | Registro de distribución de propinas | `id`, `payment_id`, `user_id`, `amount`, `distribution_type` | Pertenece a Payment, User. |
| **AuditLog** | Registro de cambios críticos (modificación de orden, precios, etc.) | `id`, `restaurant_id`, `user_id`, `entity_type`, `entity_id`, `action`, `old_values`, `new_values`, `created_at` | Pertenece a Restaurant, User. |

---

## 8. 🗓️ Roadmap de Desarrollo

| Fase | Duración | Módulos/Funcionalidades | Objetivo Claro | Dependencias |
|------|----------|------------------------|----------------|--------------|
| **Fase 1: MVP** | 5-6 semanas | ORD-01 a ORD-06, MES-01 a MES-03, KDS-01 a KDS-03, CAT-01 a CAT-04, USR-01 a USR-03, CAJ-01 a CAJ-04, CFG-01, CFG-02 | Flujo completo mesa→orden→cocina→pago funcional en un solo restaurante | Ninguna |
| **Fase 2: Consolidación** | 3-4 semanas | ORD-07, ORD-08, MES-04, CAJ-05, CAJ-06, CAJ-07, RPT-01 a RPT-03 | Corte de caja, reportes básicos, modificaciones avanzadas, manejo de errores | Fase 1 |
| **Fase 3: Optimización** | 3-4 semanas | KDS-04, KDS-05, RPT-04, RPT-05, CFG-03, mejoras de UX en mapa de mesas, notificaciones push | Experiencia de cocina mejorada, reportes completos, preparación multi-sucursal | Fase 2 |
| **Fase 4: Escalabilidad** | Futuro | MSC completo, integración MercadoPago, app móvil nativa, inventario (proyecto separado), planos interactivos drag-and-drop | Expansión a cadena de restaurantes y canales digitales | Fase 3 |

---

## 9. ⚙️ Requisitos No Funcionales

| Categoría | Requisito | Métrica/Valor | Prioridad |
|-----------|-----------|---------------|-----------|
| **Rendimiento** | Tiempo de respuesta para envío de orden a cocina | < 2 segundos | Alta |
| **Rendimiento** | Carga de pantalla KDS con 20+ órdenes activas | < 3 segundos | Alta |
| **Disponibilidad** | Uptime del sistema en horario de operación | 99.5% | Alta |
| **Disponibilidad** | Recuperación ante falla de servidor | < 5 minutos | Media |
| **Seguridad** | Autenticación de usuarios | JWT con expiración de 8 horas | Alta |
| **Seguridad** | Encriptación de datos sensibles (pagos) | AES-256 | Alta |
| **Seguridad** | Auditoría de cambios en órdenes y pagos | 100% de acciones críticas logueadas | Alta |
| **Usabilidad** | Mesero capacitado en < 30 minutos | Interfaz intuitiva, flujo de 3 pasos máximo para orden | Alta |
| **Usabilidad** | KDS legible desde 2 metros de distancia | Fuente mínima 24px, alto contraste | Media |
| **Escalabilidad** | Preparación para multi-sucursal sin reescritura | Estructura de datos lista, sin hardcodeo de restaurant_id | Media |
| **Escalabilidad** | Soportar 100 usuarios concurrentes | Arquitectura stateless con escalamiento horizontal | Baja |
| **Respaldo** | Backup automático de base de datos | Diario, retención de 30 días | Alta |
| **Respaldo** | Exportación de reportes a CSV/PDF | Disponible para todos los reportes | Media |
| **Impresión** | Generación de cuenta/recibo en PDF | Formato A4 y ticket 80mm | Media |
| **Notificaciones** | Actualización en tiempo real del KDS | WebSocket, latencia < 1 segundo | Alta |

---

## 10. 🛠️ Consideraciones de Implementación

### 10.1 Stack Tecnológico Sugerido

| Capa | Opción Económica | Opción Robusta | Recomendación según Contexto |
|------|------------------|----------------|------------------------------|
| **Frontend** | React + Vite + Tailwind CSS | React + Next.js + Tailwind CSS | **Opción Económica** para MVP. Next.js es overkill sin SEO necesario. |
| **Backend** | Node.js + Express + TypeScript | Node.js + NestJS + TypeScript | **Opción Robusta** (NestJS). Estructura modular facilita escalabilidad a multi-sucursal. |
| **Base de Datos** | PostgreSQL (Railway/Supabase) | PostgreSQL + Redis (AWS RDS + ElastiCache) | **Opción Económica** para MVP. Supabase incluye auth y realtime. |
| **Realtime (KDS)** | Socket.io (incluido en backend) | Socket.io + Redis Adapter | **Opción Económica** para inicio. Escalar a Redis Adapter si multi-sucursal. |
| **Notificaciones** | WebSocket interno | Firebase Cloud Messaging | **Opción Económica** para MVP. FCM si se añade app móvil futura. |
| **Correo** | Resend / SendGrid (plan gratuito) | AWS SES | **Opción Económica** (Resend). Solo para recuperación de contraseña inicialmente. |
| **Despliegue** | Railway / Render | AWS ECS + RDS + CloudFront | **Opción Económica** para MVP. ~$20-50/mes vs. $200+ en AWS. |
| **Respaldo** | Automatizado por proveedor (Railway/Supabase) | AWS Backup + S3 Glacier | **Opción Económica** para inicio. Migrar a AWS si se escala. |

### 10.2 Hardware Recomendado

| Dispositivo | Especificación Mínima | Cantidad Sugerida | Justificación |
|-------------|----------------------|-------------------|---------------|
| **Tablet para meseros** | 10" Android/iOS, 4GB RAM, WiFi 5 | 2-4 unidades | Toma de órdenes en sala. Resistente a derrames (funda recomendada). |
| **PC/Terminal de caja** | Intel i3 / 8GB RAM / SSD 256GB / Windows o Linux | 1 unidad | Registro de pagos, corte de caja, administración. |
| **Monitor de cocina (KDS)** | 32" Full HD, montaje en pared, brillo alto | 1-2 unidades | Visualización de órdenes. 32" permite ver 6-8 órdenes simultáneas. |
| **Mini PC para KDS** | Intel Celeron / 4GB RAM / SSD 128GB | 1 unidad por monitor | Conexión al sistema vía navegador. Bajo consumo, sin ventilador preferible. |
| **Router WiFi** | WiFi 6, cobertura completa del local | 1 unidad | Conectividad estable para tablets y KDS. |
| **Impresora térmica (futuro)** | 80mm, USB/Ethernet, compatible ESC/POS | 1 unidad (opcional) | Tickets de cocina o cuenta si el restaurante lo requiere posteriormente. |

---

## 11. 📖 Glosario

| Término | Definición | Contexto de Uso en el Sistema |
|---------|------------|-------------------------------|
| **KDS** | Kitchen Display System — Pantalla digital en cocina que muestra órdenes en tiempo real. | Módulo KDS-01 a KDS-05. Reemplaza tickets de papel. |
| **Complemento / Modificador** | Adición o eliminación aplicable a un platillo (ej. "extra queso", "sin cebolla"). | CAT-03, ORD-03, OrderItemModifier. |
| **Corte de Caja** | Resumen de ingresos, pagos y propinas al finalizar un turno de cajero. | CAJ-05, CashRegister. |
| **Propina** | Gratificación opcional del cliente, registrada en el pago y distribuida según configuración. | CAJ-04, CFG-01, TipDistribution. |
| **FIFO** | First In, First Out — Primera orden en entrar, primera en prepararse. | KDS-03, ordenamiento de órdenes en cocina. |
| **MVP** | Minimum Viable Product — Versión mínima funcional del sistema. | Roadmap, Fase 1. |
| **Multi-tenant** | Arquitectura donde una sola instancia de software sirve a múltiples restaurantes (sucursales) con datos aislados. | MSC, Fase 4, Restaurant entity. |
| **Orden Cerrada** | Estado final de una orden tras pago completado y registro de propina. No editable. | ORD, Payment, CAJ-04. |

---

## 12. 📝 Historial de Cambios

| Versión | Fecha | Autor | Cambios | Aprobado por |
|---------|-------|-------|---------|--------------|
| 0.1 | 2026-07-01 | Arquitecto Senior | Documento inicial con Fases 1, 2 y 3 completas. 12 entidades, 7 módulos, 6 casos de uso, roadmap de 4 fases. | [Pendiente] |

---

> **Validación Cruzada:** Los casos de uso (CU-01 a CU-06) cubren los objetivos 1-4 y 7. Las entidades (Order, OrderItem, Payment, TipDistribution) soportan los flujos de mesero, cocina y caja. El roadmap de 4 fases es realista: 5-6 semanas para MVP de flujo completo, escalando progresivamente. La exclusión de inventario mantiene el MVP enfocado y entregable.
