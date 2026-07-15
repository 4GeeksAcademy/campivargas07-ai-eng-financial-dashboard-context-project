# Frontend Implementation Checklist

Checklist operativo para implementar las funcionalidades especificadas en esta carpeta.

## Uso

- Marca cada tarea cuando esté completada.
- No avances al siguiente bloque sin pasar criterios de aceptación del bloque actual.
- Mantén alineación con contratos definidos en `api-types.ts` y `param-types.ts`.

---

## Fase 1 — Fundaciones de datos y estado compartido

### 1.1 Estado de filtros de fecha compartidos

- [ ] Crear estado `DateRangeFilter` para dashboard principal.
- [ ] Validar localmente formato `YYYY-MM-DD` antes de disparar requests.
- [ ] Bloquear requests cuando `start_date > end_date`.
- [ ] Limpiar filtros y restaurar estado unfiltered.

**Criterio de aceptación**

- [ ] Cambiar una fecha actualiza el estado único de filtros.
- [ ] Rango inválido muestra error inline y no dispara fetch.

### 1.2 Carga de facetas como fuente de referencia

- [ ] Consumir `GET /api/metrics/facets` al cargar dashboard.
- [ ] Mostrar `min_date` y `max_date` cerca de los inputs.
- [ ] Manejar loading y error de facetas sin romper layout.

**Criterio de aceptación**

- [ ] El rango visible coincide con `FacetsResponse`.
- [ ] Si falla facetas, inputs quedan deshabilitados y se muestra mensaje recuperable.

---

## Fase 2 — Funcionalidad 1: filtro de rango en dashboard principal

### 2.1 Componente de filtros de fecha

- [ ] Implementar componente visual equivalente a `DashboardDateRangeFilters`.
- [ ] Conectar callbacks `onChange` con estado del contenedor.
- [ ] Incluir soporte para estado `disabled`.

### 2.2 Propagación de filtros al dashboard

- [ ] Incluir `start_date` y `end_date` en requests de datos del dashboard solo cuando existan.
- [ ] Verificar que KPIs y gráficos reaccionan al mismo rango activo.

**Criterio de aceptación**

- [ ] Al cambiar fechas, todos los módulos de datos del dashboard se actualizan de forma consistente.
- [ ] Con ambos inputs vacíos, se muestra dataset completo.

---

## Fase 3 — Funcionalidad 2: alertas de anomalías

### 3.1 Input de threshold

- [ ] Implementar input numérico con default `0.3`.
- [ ] Enforzar regla UI `0.01..1.0`.
- [ ] Mostrar mensaje inline para valor inválido.

### 3.2 Tabla de alertas

- [ ] Implementar estructura de 4 columnas:
  - [ ] Period
  - [ ] Outcome total
  - [ ] Baseline average
  - [ ] Increase ratio
- [ ] Mostrar estado loading con estructura de tabla.
- [ ] Mostrar estado error recuperable.
- [ ] Mostrar estado vacío explícito cuando la respuesta sea `[]`.

### 3.3 Integración con filtros de fecha

- [ ] Aplicar el `DateRangeFilter` del dashboard principal en `AlertsParams`.
- [ ] Mantener threshold en cada request de alertas.

**Criterio de aceptación**

- [ ] El bloque de alertas respeta rango de fechas activo.
- [ ] Nunca desaparece silenciosamente: siempre hay datos, error o empty state visible.

---

## Fase 4 — Funcionalidad 3: vista comparativa B2B vs B2C

### 4.1 Página y filtros propios

- [ ] Crear página de comparación con layout de dos secciones + gráfico inferior.
- [ ] Implementar filtros de fecha de la página con mismas reglas de validación.
- [ ] Cargar `GET /api/metrics/facets` para referencia de rango.

### 4.2 Tablas top categorías por grupo

- [ ] Solicitar `GET /api/metrics/categories/top` para B2B con:
  - [ ] `operation_type=income`
  - [ ] `limit=5`
  - [ ] `business_type=B2B`
- [ ] Solicitar en paralelo el mismo endpoint para B2C (`business_type=B2C`).
- [ ] Aplicar `start_date` y `end_date` cuando estén presentes.
- [ ] Mostrar columna derivada de porcentaje sobre total de grupo.

### 4.3 Gráfico agrupado B2B vs B2C

- [ ] Derivar `b2bTotalIncome` y `b2cTotalIncome` desde resultados top categories.
- [ ] Renderizar siempre dos barras cuando haya datos.
- [ ] Mostrar barra en 0 para grupo vacío y leyenda explicativa.
- [ ] Renderizar estado vacío cuando ambos grupos no tengan datos.

**Criterio de aceptación**

- [ ] Al cambiar fechas, ambas tablas y el gráfico se recalculan en la misma actualización.
- [ ] Error parcial (solo un grupo falla) no bloquea la visualización del otro grupo.

---

## Fase 5 — Calidad y validación final

### 5.1 Tipado y contratos

- [ ] Usar `FacetsResponse`, `AlertsResponse`, `TopCategoriesResponse` sin redefinir shapes.
- [ ] Usar `DateRangeFilter`, `AlertsParams`, `TopCategoriesParams` para requests.

### 5.2 Estados de UI obligatorios

- [ ] Cada bloque de datos implementa loading.
- [ ] Cada bloque de datos implementa error.
- [ ] Cada bloque de datos implementa empty state explícito.

### 5.3 Pruebas funcionales manuales mínimas

- [ ] Caso: rango válido con datos.
- [ ] Caso: rango válido sin datos.
- [ ] Caso: `start_date > end_date`.
- [ ] Caso: threshold fuera de rango UI.
- [ ] Caso: un panel (B2B o B2C) vacío.

**Criterio de salida**

- [ ] Todas las tareas marcadas.
- [ ] Comportamiento coincide con `components.md` y `README.md` de esta carpeta.