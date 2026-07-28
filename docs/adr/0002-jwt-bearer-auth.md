# ADR-0002: JWT Bearer con Expiracion de 8 Horas para Autenticacion

**Fecha:** 2026-07-28
**Estado:** Aceptado
**Decisores:** Arquitecto Senior

---

## Contexto

El sistema SOR tiene 4 roles de usuario (mesero, cajero, admin, superadmin) que acceden desde dispositivos distintos (tablets, PCs de caja, monitor de cocina). No hay clientes finales autenticados (los comensales no son actores del sistema).

Requisitos de seguridad:
- Autenticacion de todos los usuarios del sistema.
- Autorizacion por rol para proteger endpoints sensibles (corte de caja, gestion de usuarios).
- Las sesiones deben durar un turno completo (~8 horas) sin reautenticacion.
- En caso de robo de dispositivo, debe ser posible invalidar sesiones.

No se requiere OAuth2/external providers (Google, Microsoft) porque los usuarios son empleados internos, no publico general.

---

## Decision

Usaremos **JWT Bearer** con:
- **Access token:** expiracion de 8 horas, firmado con HS256 (secreto del servidor).
- **Refresh token:** expiracion de 7 dias, almacenado en BD para permitir revocacion.
- **Middleware** `requireAuth` que verifica el token en cada request.
- **Middleware** `requireRole('admin')` que verifica el claim `role` del JWT.

---

## Consecuencias

### Positivo

- Stateless: el access token no requiere consulta a BD en cada request (solo verificacion de firma).
- Expiracion de 8 horas cubre un turno completo sin interrumpir al usuario.
- El refresh token permite extender sesion sin reingresar credenciales.
- Revocacion posible: eliminar el refresh token de la BD invalida la sesion al expirar el access token.
- Estandar de industria, bien soportado por librerias (`jsonwebtoken` en Node.js).
- Payload del JWT incluye `userId`, `role`, `restaurantId` para autorizacion rapida sin query.

### Negativo

- El access token no es revocable inmediatamente (hay que esperar a que expire, max 8h).
- Si el secreto se compromete, todos los tokens son vulnerables hasta rotar el secreto.
- Mayor complejidad que session-based auth (manejo de refresh tokens en el frontend).
- Sin blacklist de tokens revocados, no hay forma de invalidar un access token especifico.

---

## Alternativas consideradas

| Alternativa | Pros | Contras | Por que se descarto |
|-------------|------|---------|-------------------|
| Session-based (cookies + Redis) | Revocacion instantanea, sin JWTs en el cliente | Requiere Redis desde el MVP, estado en servidor, no funciona bien con WebSocket nativo | Agregar Redis solo para sesiones es excesivo en MVP. JWT es suficiente para el nivel de riesgo. |
| JWT con expiracion corta (15 min) + refresh | Mas seguro ante robo de access token | El usuario tendria que reautenticar constantemente durante un turno de 8h | La friccion de reautenticar cada 15 min es inaceptable para meseros en operacion. |
| API Keys por dispositivo | Simple, sin manejo de sesion | Sin granularidad por usuario, dificil de auditar "quien hizo que" | No cumple el requisito de auditoria por usuario. |
