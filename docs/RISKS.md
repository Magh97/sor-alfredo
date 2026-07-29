# Registro de Riesgos -- Alfredo's

---

## Matriz de Riesgos

```
Probabilidad
    Alta  │  R2-Rotacion     R7-WiFiInestable
          │  R8-Entrenamiento
          │
  Media   │  R5-Reentrenar   R1-WebSocket   R3-CambioAlcance
          │                  R6-Impresora   R4-EquipoClave
          │
   Baja   │  R10-StaticFiles             R9-MultiSucursal  R11-JWTComprometido
          │                              R12-PostgreSQLSPOF
          │
          └────────────────────────────────────────────────────
            Bajo              Medio              Alto
                        Impacto
```

Leyenda: 🟢 Bajo | 🟡 Medio | 🔴 Critico

---

## Tabla de Riesgos

| # | Riesgo | Tipo | Prob | Impacto | Nivel | Mitigacion | Contingencia |
|---|--------|------|------|---------|-------|-----------|-------------|
| R1 | Firewall/NAT del restaurante bloquea WebSocket | Tecnico | Media | Alto | 🔴 Critico | Socket.io tiene fallback a HTTP long-polling. Probar en red real del restaurante en sprint 1. | Si WebSocket falla y long-polling tiene latencia >3s, activar polling cada 1s como ultimo recurso. |
| R2 | Rotacion de meseros quiebra flujo de adopcion del sistema | Negocio | Alta | Bajo | 🟡 Medio | Interfaz minimalista (3 pasos max por orden). Documentar flujo con screenshots para induccion. | Designar 1 "mesero campeon" que entrene a nuevos en 10 min. |
| R3 | Stakeholder cambia alcance a mitad de MVP (ej: "agreguemos inventario") | Negocio | Media | Alto | 🔴 Critico | Sprint de 1 semana, demo frecuente al stakeholder. Scope escrito y firmado en especificacion. MoSCoW visible. | Buffer de 20% en roadmap para absorber cambios menores. Si es mayor, negociar: "esto reemplaza X en el MVP o va a Fase 2". |
| R4 | Desarrollador clave se ausenta (vacaciones, renuncia, enfermedad) | Organizacional | Media | Alto | 🔴 Critico | ADRs documentan decisiones, pair programming en features criticas, codigo con tests. | Backup asignado por modulo. Si la ausencia es >1 semana, reducir alcance del sprint. |
| R5 | Meseros requieren re-entrenamiento frecuente (curva de aprendizaje alta) | Negocio | Alta | Bajo | 🟡 Medio | UX validada con prototipo clickeable antes de codear. Iconos grandes, texto minimo, flujo predecible. | Si la adopcion es <50% en semana 1, sesion de observacion en piso para identificar fricciones. |
| R6 | Impresora termica no compatible con impresion web (Ticket 80mm) | Tecnico | Media | Medio | 🟡 Medio | Generar PDF con dimensiones de ticket (80mm x variable). La impresora esta en Fase 2, no en MVP. | Si no se logra formato ticket, imprimir en hoja A4 mientras. |
| R7 | Tablets de meseros sin WiFi estable en todo el restaurante | Externo | Alta | Medio | 🟡 Medio | Requerir WiFi 6 en hardware recomendado. Cola local en frontend (guardar orden en localStorage si no hay conexion). | Si WiFi es inestable en zonas especificas, agregar repetidor o mover router. |
| R8 | Cajero se rehusa a usar el sistema (prefiere metodo manual) | Negocio | Alta | Bajo | 🟡 Medio | Involucrar al cajero en el diseno de la interfaz de caja. Mostrar beneficios: corte de caja en <5 min vs 20 min manual. | Periodo de transicion: sistema + metodo manual en paralelo las primeras 2 semanas. |
| R9 | Migracion a multi-sucursal en Fase 4 rompe queries existentes | Tecnico | Baja | Alto | 🔴 Critico | `restaurant_id` presente desde dia 1 en todas las tablas. Helper `whereRestaurant(db, id)` centraliza el filtro. Tests de integracion validan que los queries incluyen el filtro. | Si la migracion revela queries sin filtro, corregir con migration de datos y fix de codigo puntual. Impacto acotado por el helper centralizado. |
| R10 | Static files del frontend no cachean bien en CDN (clientes ven version vieja) | Tecnico | Baja | Bajo | 🟢 Bajo | Vite genera hashes en nombres de archivos (`app-a3f9b2.js`). Cache-control: `max-age=31536000, immutable` para assets hasheados. | Si un cliente ve version vieja, hard refresh (Ctrl+F5) resuelve. |
| R11 | JWT secret se compromete (fuga en logs, repo publico, ex-empleado) | Seguridad | Baja | Alto | 🔴 Critico | Secret en variable de entorno, nunca en codigo. `.env` en `.gitignore`. Rotacion de secret cada 90 dias. Auditoria de access logs. | Rotar secret inmediatamente. Invalidar todos los refresh tokens. Forzar re-login de todos los usuarios. |
| R12 | PostgreSQL single instance es punto unico de falla | Tecnico | Baja | Alto | 🔴 Critico | En MVP esto es aceptable (costo/beneficio). Backup diario automatico (Railway/Supabase). | Si la BD falla en horario de operacion: restaurante opera en modo manual (papel) hasta restaurar backup. Objetivo de recuperacion: <30 min. |

---

## Riesgos Criticos -- Plan de Respuesta Detallado

### R1: Firewall/NAT bloquea WebSocket

- **Dueño:** Tech Lead
- **Disparador:** KDS no recibe actualizaciones en tiempo real en red del restaurante.
- **Mitigacion:** Probar Socket.io en red real del restaurante durante sprint 1. Configurar fallback a HTTP long-polling (nativo de Socket.io). Documentar puertos requeridos (3000 TCP).
- **Contingencia:** Si long-polling tambien falla, activar polling HTTP cada 1s contra `GET /api/orders?status=in_kitchen`. La latencia sube a 1s pero el sistema sigue funcional.
- **Revision:** Cada sprint planning.

### R3: Cambio de alcance del stakeholder

- **Dueño:** Product Owner (cliente)
- **Disparador:** Stakeholder pide feature fuera del scope durante una demo.
- **Mitigacion:** Especificacion firmada al inicio. Roadmap con fases claro. MoSCoW visible en cada demo. Sprint de 1 semana permite pivotear rapido.
- **Contingencia:** Negociar: "esto puede entrar al MVP si reemplazamos X. O lo ponemos en Fase 2. Tu decides."
- **Revision:** Cada demo de sprint.

### R4: Desarrollador clave se ausenta

- **Dueño:** Tech Lead
- **Disparador:** Aviso de vacaciones, enfermedad, o renuncia.
- **Mitigacion:** ADRs documentan el "por que" de cada decision. Pair programming en features criticas (KDS real-time, maquina de estados de ordenes). Tests cubren 80% de codigo.
- **Contingencia:** Cada modulo tiene un backup developer asignado. Si ausencia >1 semana y no hay backup disponible, reducir scope del sprint (mover features a siguiente sprint).
- **Revision:** Cada sprint planning.

### R9: Migracion multi-sucursal rompe queries

- **Dueño:** Tech Lead
- **Disparador:** Pruebas de Fase 4 revelan queries sin filtro `restaurant_id`.
- **Mitigacion:** `restaurant_id` en esquema desde dia 1. Helper `whereRestaurant()` centralizado. Tests de integracion que validan filtro. Code review verifica queries nuevos.
- **Contingencia:** Corregir queries individuales. Dado que la columna ya existe con valor 1, el impacto es solo de codigo (logica de negocio), no de migracion de datos.
- **Revision:** Code review de cada PR.

### R11: JWT secret comprometido

- **Dueño:** Tech Lead
- **Disparador:** Alerta de seguridad, ex-empleado, fuga en logs, o auditoria rutinaria.
- **Mitigacion:** Secret en variable de entorno. `.env` en `.gitignore`. Rotacion programada cada 90 dias. No loguear tokens ni secrets (configuracion de logger).
- **Contingencia:** Rotar secret → todos los access tokens existentes se invalidan (nueva firma). Invalidar refresh tokens en BD (`DELETE FROM refresh_tokens`). Forzar re-login global via notificacion. Tiempo de recuperacion: <15 min.
- **Revision:** Cada sprint + auditoria trimestral.

### R12: PostgreSQL single point of failure

- **Dueño:** Tech Lead + DevOps
- **Disparador:** Base de datos no responde. Monitoreo alerta.
- **Mitigacion:** Backup diario automatico (Railway/Supabase nativo). Retencion de 30 dias. En Fase 3 evaluar replicacion (read replica o streaming replication).
- **Contingencia:** Durante caida de BD, restaurante opera en papel (ordenes escritas a mano). Al restaurar BD, ingresar ordenes acumuladas. Objetivo de recuperacion (RTO): <30 min. Objetivo de perdida de datos (RPO): <24h (backup diario).
- **Revision:** Cada sprint review.

---

## Riesgos Materializados (Historial)

| Riesgo | Fecha | Impacto Real | Leccion Aprendida |
|--------|-------|-------------|-------------------|
| -- | -- | -- | Ninguno aun (proyecto en fase de planificacion) |

---

## Checklist de Revision de Riesgos (Sprint Planning)

- [ ] Revisar top 5 riesgos: alguno subio/bajo de nivel?
- [ ] Hay nuevos riesgos desde el sprint anterior?
- [ ] Disparadores: alguno se activo? Se ejecuto contingencia?
- [ ] Riesgos cerrados: alguno ya no aplica? Marcarlo como resuelto.
- [ ] Backups: se verifico el ultimo backup de BD?
