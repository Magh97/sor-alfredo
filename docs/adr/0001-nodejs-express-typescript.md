# ADR-0001: Node.js + Express + TypeScript como Stack Backend

**Fecha:** 2026-07-28
**Estado:** Aceptado
**Decisores:** Arquitecto Senior

---

## Contexto

Se requiere elegir el stack backend para el Sistema de Gestion de Ordenes para Restaurantes (SOR). La especificacion evalua dos opciones:

- **Opcion Economica:** Node.js + Express + TypeScript
- **Opcion Robusta:** Node.js + NestJS + TypeScript (o .NET 10 Minimal API)

El MVP tiene alcance de 5-6 semanas, un solo restaurante, y ~4 tipos de usuario (mesero, cajero, admin, superadmin). El sistema incluye WebSocket para la pantalla de cocina (KDS) en tiempo real.

---

## Decision

Usaremos **Node.js 24 + Express 5 + TypeScript** como stack backend para el MVP, con Drizzle como ORM y Socket.io para la capa de tiempo real.

---

## Consecuencias

### Positivo

- Curva de aprendizaje minima: Express es el framework HTTP mas conocido del ecosistema Node.js.
- Un solo lenguaje (TypeScript) en frontend (React) y backend reduce friccion cognitiva del equipo.
- Socket.io se integra naturalmente sobre el mismo servidor HTTP de Express.
- Menor overhead de abstraccion que NestJS para un MVP de 5-6 semanas.
- Ecosistema npm mas amplio para librerias de utilidad.

### Negativo

- Express carece de estructura opinionada (modulos, DI, decorators) que NestJS ofrece.
- La falta de DI nativo requiere disciplina del equipo para mantener desacoplamiento.
- Migrar a NestJS en el futuro implica refactor de controllers y services (aunque la logica de negocio deberia ser portable).
- Menor soporte nativo para OpenAPI que NestJS (@nestjs/swagger) o .NET (Microsoft.AspNetCore.OpenApi).

---

## Alternativas consideradas

| Alternativa | Pros | Contras | Por que se descarto |
|-------------|------|---------|-------------------|
| NestJS + TypeScript | DI nativo, modulos, guards, OpenAPI integrado, arquitectura opinionada | Mayor boilerplate, curva de aprendizaje, overhead para MVP | Para un equipo que conoce Express, NestJS agrega complejidad innecesaria en Fase 1 |
| .NET 10 Minimal API | Rendimiento superior, tipado estricto, EF Core maduro, SignalR nativo | Equipo sin experiencia en C#/.NET, ecosistema diferente al frontend | La brecha de skills del equipo y el costo de tener dos lenguajes pesa mas que los beneficios tecnicos |
| Python + FastAPI | Excelente para APIs, OpenAPI automatico, Pydantic para validacion | Rendimiento menor en I/O intensivo, async menos maduro que Node.js | El ecosistema Node.js ofrece mejor soporte para WebSocket y real-time |
