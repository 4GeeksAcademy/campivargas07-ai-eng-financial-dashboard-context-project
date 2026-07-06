# Current State — Financial Metrics Dashboard

Estado del proyecto a julio 2026, basado en inspección del código y artefactos de gobernanza generados.

---

## Features implementadas

### Backend (FastAPI)

| Feature | Estado | Evidencia |
|---------|--------|-----------|
| Health check | Completo | `GET /health` |
| Listado de movimientos con filtros | Completo | `GET /api/metrics` (fecha, categoría, operación) |
| Facetas de filtro | Completo | `GET /api/metrics/facets` |
| Resumen agregado (día/semana/mes) | Completo | `GET /api/metrics/summary` |
| Top categorías | Completo | `GET /api/metrics/categories/top` |
| Comparación de periodos | Completo | `GET /api/metrics/comparison` |
| Alertas de picos de gasto | Completo | `GET /api/metrics/alerts` |
| Filtros B2B / B2C | Completo | `GET /api/metrics/b2b`, `/b2c` |
| Mock data reproducible | Completo | `seed=42`, 360 movimientos/año |
| OpenAPI / Swagger | Completo | `/docs` autogenerado |
| Tests de integración | Parcial | 15 tests, happy-path en todos los endpoints |

### Frontend (React)

| Feature | Estado | Evidencia |
|---------|--------|-----------|
| Dashboard con 4 KPIs | Completo | `kpi-row.tsx` |
| Gráfico income vs outcome mensual | Completo | `income-outcome-chart.tsx` |
| Gráfico profit margin % mensual | Completo | `profit-percent-chart.tsx` |
| Estados loading (skeletons) | Completo | `kpi-card.tsx`, charts |
| Estado error (banner) | Parcial | Mensaje genérico, error silenciado |
| Fetch de datos API | Parcial | Solo `/api/metrics`, agregación client-side |
| Tests de utilidades | Completo | `financial-utils.test.ts` |
| Tema dark | Completo | `className="dark"` en `App.tsx` |

### Infraestructura y gobernanza

| Feature | Estado | Evidencia |
|---------|--------|-----------|
| Docker Compose dev | Completo | `docker-compose.yml` |
| Documentación de arranque | Completo | `README.md`, `README.es.md` |
| Reglas de agentes | Completo | `.agents/rules/` (6 archivos) |
| Memory bank | Completo | `memory-bank/` (este directorio) |
| Análisis de handover | Completo | `docs/handover-context.md` |
| Análisis de prácticas | Completo | `docs/engineering-practices-analysis.md` |
| CI/CD | No implementado | — |
| Deploy producción | No implementado | Dockerfiles son dev-only |

---

## Gaps conocidos

### Producto y UX

1. **Frontend subutiliza la API** — 1 de 9 endpoints consumidos; lógica duplicada en `financial-utils.ts`.
2. **Sin filtros en UI** — la API soporta fecha, categoría, operación y business type; el dashboard no expone controles.
3. **Periodo hardcodeado** — `App.tsx:49` muestra `"2024 - Full Year"` sin relación con datos reales.
4. **i18n inconsistente** — error en español, labels en inglés, `<title>frontend</title>`.

### Código y arquitectura

5. **Monolito backend** — `routes.py` concentra modelos, mock, lógica y rutas (~392 líneas).
6. **Código muerto** — `frontend/src/lib/mock-data.ts` sin referencias.
7. **Regeneración mock por request** — sin caché ni inyección de dependencias.
8. **Riesgo IndexError** — `build_metrics_facets` sin guard para lista vacía.
9. **Endpoints B2B/B2C redundantes** — duplican filtro `business_type` ya disponible.

### Calidad y operaciones

10. **Errores silenciados** — `.catch(() =>` en `App.tsx` sin logging.
11. **Sin validación runtime JSON** — `response.json()` sin schema check (Zod).
12. **CORS permisivo** — `allow_origins=["*"]` + `allow_credentials=True` en `main.py`.
13. **Dependencias backend sin pin** — `requirements.txt` sin versiones.
14. **Sin CI** — tests no corren en pipeline automatizado.
15. **Cobertura incompleta** — funciones puras backend (`summarize_movements`, etc.) sin tests unitarios directos.

### Gráficos

16. **`hasData` frágil** — `profit-percent-chart.tsx` trata `profitPercent === 0` como sin datos.

---

## Prioridades de desarrollo sugeridas

Ordenadas por impacto en mantenibilidad y alineación producto-API.

### Prioridad 1 — Alinear frontend con backend

- Migrar agregación mensual a `GET /api/metrics/summary?group_by=month`.
- Usar `GET /api/metrics/facets` para derivar periodo del header dinámicamente.
- Eliminar o documentar `mock-data.ts`.

**Regla aplicable:** `.agents/rules/frontend-data-flow.md`

### Prioridad 2 — Refactorizar capas backend

- Extraer modelos → `app/models/`
- Extraer lógica y mock → `app/services/`
- Dejar handlers delgados en `app/routes/`

**Regla aplicable:** `.agents/rules/backend-layering.md`

### Prioridad 3 — Robustez y errores

- Guard en `build_metrics_facets` para listas vacías.
- Logging en `catch` del frontend; `AbortController` en `useEffect`.
- Unificar idioma UI (inglés recomendado por regla).

**Regla aplicable:** `.agents/rules/error-handling-i18n.md`

### Prioridad 4 — Operaciones

- Pin de versiones en `requirements.txt`.
- Evaluar GitHub Actions: `pytest` + `npm test` + `npm run lint`.
- Documentar o crear Dockerfiles de producción separados.

**Regla aplicable:** `.agents/rules/docker-and-deps.md`

### Prioridad 5 — Features de producto (opcional)

- Controles de filtro en UI (fecha, categoría, B2B/B2C).
- Panel de alertas consumiendo `/api/metrics/alerts`.
- Validación runtime con Zod en fetch.

---

## Estado de tests

| Suite | Ubicación | Cantidad | Cobertura |
|-------|-----------|----------|-----------|
| Backend integration | `backend/tests/test_routes.py` | 15 | Todos los endpoints HTTP |
| Backend unit | `backend/tests/test_routes.py` | 2 | `generate_mock_movements`, `filter_movements_by_date` |
| Frontend unit | `frontend/src/lib/financial-utils.test.ts` | 5+ | KPIs, monthly data, formatters |

**Comandos:**

```bash
pytest backend/tests/
cd frontend && npm test
```

---

## Historial de gobernanza

| Fase | Commit | Artefacto |
|------|--------|-----------|
| 1 | `[Fase 1] Contexto del handover` | `docs/handover-context.md` |
| 2 | `[Fase 2] Análisis de prácticas de ingeniería` | `docs/engineering-practices-analysis.md` |
| 3 | `[Fase 3] Reglas de gobernanza del repositorio` | `.agents/rules/*.md` |
| 4 | `[Fase 4] Memory bank del proyecto` | `memory-bank/*.md` |

---

## Cómo mantener este documento

Actualizar `current-state.md` cuando:

- Se implemente o elimine una feature visible.
- Se cierre un gap listado arriba.
- Cambie el stack (nueva dependencia crítica, CI, deploy).
- Se modifique el contrato API consumido por el frontend.

No duplicar contenido de `product-overview.md` o `tech-stack.md`; enlazar a esos archivos para detalle.
