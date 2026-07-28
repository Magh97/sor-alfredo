# ADR-0004: Multi-Sucursal Preparado via `restaurant_id` (No Activo en MVP)

**Fecha:** 2026-07-28
**Estado:** Aceptado
**Decisores:** Arquitecto Senior

---

## Contexto

El MVP del sistema SOR esta disenado para un solo restaurante. Sin embargo, el objetivo #6 de la especificacion establece:

> "Preparar arquitectura para escalabilidad a multiples sucursales [...] sin reescritura de core"

Esto implica que en Fase 4, el sistema debe soportar multiples restaurantes (sucursales) con datos aislados, donde un superadmin pueda ver reportes consolidados y un admin solo vea los datos de su sucursal.

---

## Decision

Desde el MVP, **todas las tablas principales incluyen una columna `restaurant_id`** como Foreign Key a la tabla `restaurants`. En el MVP, este campo tendra un valor fijo (id=1). Los queries siempre filtraran por `restaurant_id` usando un middleware que lo extrae del JWT del usuario autenticado.

---

## Consecuencias

### Positivo

- Cero migracion de esquema en Fase 4: las FK ya existen, solo se activa la logica multi-sucursal.
- Aislamiento de datos por diseno: un admin de sucursal A nunca vera datos de sucursal B por accidente.
- Los queries con `WHERE restaurant_id = $1` son eficientes (indexados) desde el dia 1.
- El JWT incluye `restaurantId` en el payload, permitiendo autorizacion sin query extra a BD.
- Los reportes consolidados (superadmin) simplemente omiten el filtro `restaurant_id`.

### Negativo

- Todas las queries tienen un `WHERE restaurant_id` adicional, lo que agrega un parametro a cada consulta.
- En MVP, los queries con `restaurant_id = 1` son redundantes pero necesarios para consistencia futura.
- El equipo debe recordar siempre incluir el filtro en cada query (mitigado con un helper `whereRestaurant(db, restaurantId)` en el repositorio base).
- Testing requiere crear un `restaurant` de prueba aunque solo haya uno.

---

## Alternativas consideradas

| Alternativa | Pros | Contras | Por que se descarto |
|-------------|------|---------|-------------------|
| Sin `restaurant_id` en MVP, migrar en Fase 4 | Queries mas simples en MVP, sin columna innecesaria | Migracion traumatica en Fase 4: alter tables, backfill de datos, riesgo de corrupcion | El costo de la columna extra es minimo comparado con el riesgo y esfuerzo de migrar en produccion. |
| Schema por restaurante (PostgreSQL schemas) | Aislamiento total, sin filtros en queries | Complejidad de manejar multiples schemas, migrations por schema, connection pooling complicado | Para < 10 sucursales, el modelo de `restaurant_id` es mas simple y mantenible que multi-schema. |
| Base de datos por restaurante | Maximo aislamiento, escalabilidad independiente | Reportes consolidados requieren federated queries, costo de infraestructura se multiplica | Excesivo para una cadena de restaurantes. Justificable solo para franquicias con cientos de sucursales. |
| Middleware que resuelve el restaurant desde el subdominio | URLs tipo `sucursal1.sor.com` permiten queries sin `restaurant_id` explicito | Requiere DNS wildcard, multi-tenant por conexion, complejidad de ruteo | El modelo de JWT + `restaurant_id` es mas simple de implementar y debuggear en MVP. |
