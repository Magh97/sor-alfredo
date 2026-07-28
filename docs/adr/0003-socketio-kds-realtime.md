# ADR-0003: Socket.io para Tiempo Real del KDS (Sin Redis Adapter Inicial)

**Fecha:** 2026-07-28
**Estado:** Aceptado
**Decisores:** Arquitecto Senior

---

## Contexto

La pantalla de cocina (KDS) debe recibir ordenes en tiempo real con latencia < 1 segundo. El flujo es:

1. Mesero envia orden a cocina → KDS debe mostrar la orden inmediatamente.
2. Cocinero marca orden como lista → Mesero debe recibir notificacion.
3. Si el mesero agrega items a una orden activa → KDS debe mostrar los nuevos items diferenciados.
4. Si el mesero cancela una orden → KDS debe retirarla de la pantalla.

Tecnologias consideradas: Socket.io (WebSocket con fallback a HTTP long-polling), Server-Sent Events (SSE), polling cada N segundos.

---

## Decision

Usaremos **Socket.io** montado sobre el mismo servidor HTTP de Express (puerto 3000), **sin Redis Adapter** en el MVP. Ambas partes (cliente KDS y cliente mesero) se conectaran al mismo namespace.

---

## Consecuencias

### Positivo

- Comunicacion bidireccional nativa: el KDS puede emitir `order:ready` al servidor y el servidor notifica al mesero.
- Socket.io maneja automaticamente reconexion, heartbeats y fallback a long-polling si WebSocket no esta disponible.
- Mismo puerto que Express simplifica el despliegue (no se necesita un servidor WebSocket separado).
- Namespaces y rooms permiten organizar eventos por restaurante (`/restaurant-1`) listos para multi-sucursal.
- Sin dependencia externa (Redis) en MVP: una sola instancia de Node.js maneja todo.

### Negativo

- Socket.io requiere su propia libreria cliente, a diferencia de SSE que es nativo del navegador.
- Sin Redis Adapter, una sola instancia de Node.js maneja todas las conexiones. Si la instancia se cae, todas las conexiones se pierden.
- Al escalar horizontalmente (multiples instancias Node.js), las conexiones Socket.io en diferentes instancias no se comunican entre si sin el adapter.
- Mayor overhead de memoria que SSE: Socket.io mantiene estado de conexion por cliente.

---

## Alternativas consideradas

| Alternativa | Pros | Contras | Por que se descarto |
|-------------|------|---------|-------------------|
| Server-Sent Events (SSE) | Nativo del navegador, reconexion automatica, mas ligero que WebSocket | Solo unidireccional (server → client). El KDS no puede notificar "orden lista" sin un endpoint HTTP extra | El KDS requiere bidireccionalidad. Usar SSE + POST crea dos canales separados y mas complejidad. |
| Polling cada 3 segundos | Simplicidad maxima, cero configuracion de infraestructura | Latencia de hasta 3s, carga constante en BD, no escala con muchas pantallas | El requisito de latencia < 1s descarta polling por completo. |
| WebSocket nativo (ws) | Sin dependencia de Socket.io, mas ligero | Sin reconexion automatica, sin fallback, sin rooms/namespaces | Socket.io resuelve problemas reales (reconexion, fallback) que tendriamos que implementar manualmente. |
| Socket.io + Redis Adapter desde el MVP | Listo para escalar horizontalmente desde dia 1 | Agrega Redis como dependencia de infraestructura en MVP | En Fase 1 con un solo restaurante y < 10 dispositivos conectados, Redis adapter es sobre-ingenieria. |
