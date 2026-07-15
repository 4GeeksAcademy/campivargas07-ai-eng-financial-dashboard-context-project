# Frontend Implementation Tasks (Parallel Work Plan)

Este backlog transforma la especificación en tareas pequeñas y paralelizables para el equipo.

## Convenciones

- ID: identificador único de tarea.
- Dependencias: IDs que deben terminarse antes.
- Done: criterio mínimo para cerrar la tarea.

## Milestone A — Base compartida

### TASK-01: Estado central de filtro de fechas (Dashboard principal)

- Objetivo: crear estado compartido para start_date y end_date.
- Dependencias: ninguna.
- Entregables:
  - Estado DateRangeFilter en contenedor principal.
  - Helpers de actualización y limpieza de rango.
- Done:
  - Cambios de fecha se reflejan en estado único.
  - Limpiar fechas restaura estado sin filtros.

### TASK-02: Validación local de rango de fechas

- Objetivo: bloquear requests cuando start_date > end_date.
- Dependencias: TASK-01.
- Entregables:
  - Regla de validación local.
  - Mensaje de error inline de rango inválido.
- Done:
  - No se dispara fetch con rango inválido.
  - Mensaje desaparece al corregir el rango.

### TASK-03: Carga de facetas para rango de referencia

- Objetivo: integrar GET /api/metrics/facets para min_date y max_date.
- Dependencias: ninguna.
- Entregables:
  - Request de facetas al cargar vista.
  - Estado loading/error de facetas.
  - Hint visual min_date - max_date.
- Done:
  - Rango visible coincide con respuesta de API.
  - Si falla facetas, inputs quedan deshabilitados con mensaje recuperable.

## Milestone B — Funcionalidad 1 (filtro fecha dashboard)

### TASK-04: Componente de inputs de fecha

- Objetivo: construir bloque visual de inicio y fin.
- Dependencias: TASK-01, TASK-02, TASK-03.
- Entregables:
  - Input de start_date.
  - Input de end_date.
  - Estado disabled según facetas/error.
- Done:
  - Ambos inputs soportan valor vacío.
  - Inputs respetan límites de UX definidos en specs.

### TASK-05: Propagación de rango al fetch de métricas

- Objetivo: aplicar rango a los datos existentes del dashboard.
- Dependencias: TASK-01, TASK-04.
- Entregables:
  - Inclusión condicional de start_date y end_date en request.
  - Sincronización de KPIs y gráficos con mismo rango activo.
- Done:
  - Todos los módulos se actualizan al cambiar rango.
  - Con rango vacío vuelve el dataset completo.

## Milestone C — Funcionalidad 2 (alertas)

### TASK-06: Control de threshold con regla de producto

- Objetivo: input numérico con rango UI 0.01 a 1.0 y default 0.3.
- Dependencias: ninguna.
- Entregables:
  - Campo numérico de threshold.
  - Validación inline por rango.
- Done:
  - No se envía request con threshold inválido.
  - Valor inicial en 0.3.

### TASK-07: Integración de datos de alertas

- Objetivo: consumir GET /api/metrics/alerts con params tipados.
- Dependencias: TASK-01, TASK-06.
- Entregables:
  - Construcción de AlertsParams.
  - Inclusión de threshold y rango de fechas.
- Done:
  - Response mapeada a AlertsResponse.
  - Errores de request muestran estado recuperable.

### TASK-08: Tabla de alertas con estados completos

- Objetivo: tabla de 4 columnas con loading/error/empty.
- Dependencias: TASK-07.
- Entregables:
  - Columnas: period, outcome_total, baseline_average, increase_ratio.
  - Empty state explícito para arreglo vacío.
- Done:
  - La tabla nunca desaparece silenciosamente.
  - Empty state visible cuando no hay anomalías.

## Milestone D — Funcionalidad 3 (comparativa B2B vs B2C)

### TASK-09: Página de comparación y filtro de fechas propio

- Objetivo: crear vista dedicada con filtro independiente del dashboard principal.
- Dependencias: TASK-02, TASK-03.
- Entregables:
  - Página de comparación.
  - DateRangeFilter para esta vista.
- Done:
  - Validación de rango funciona igual que en dashboard principal.
  - Rango de referencia visible desde facetas.

### TASK-10: Fetch paralelo de top categorías por grupo

- Objetivo: solicitar top categorías income para B2B y B2C en paralelo.
- Dependencias: TASK-09.
- Entregables:
  - Request A: operation_type=income, limit=5, business_type=B2B.
  - Request B: operation_type=income, limit=5, business_type=B2C.
  - Inclusión opcional de start_date y end_date.
- Done:
  - Ambos requests usan TopCategoriesParams tipado.
  - Falla parcial no bloquea el panel exitoso.

### TASK-11: Panel de tabla B2B

- Objetivo: renderizar top 5 B2B con share por categoría.
- Dependencias: TASK-10.
- Entregables:
  - Tabla categoría, total, porcentaje del grupo.
  - Empty state específico para B2B.
- Done:
  - Porcentajes calculados sobre suma del panel B2B.

### TASK-12: Panel de tabla B2C

- Objetivo: renderizar top 5 B2C con share por categoría.
- Dependencias: TASK-10.
- Entregables:
  - Tabla categoría, total, porcentaje del grupo.
  - Empty state específico para B2C.
- Done:
  - Porcentajes calculados sobre suma del panel B2C.

### TASK-13: Gráfico agrupado de comparación total

- Objetivo: comparar ingreso total B2B vs B2C en una sola visual.
- Dependencias: TASK-11, TASK-12.
- Entregables:
  - Cálculo de total B2B y total B2C.
  - Dos barras agrupadas.
  - Manejo de casos vacíos parciales y totales.
- Done:
  - Un grupo vacío muestra barra en 0 con leyenda aclaratoria.
  - Ambos vacíos muestran empty state del gráfico.

## Milestone E — Hardening y cierre

### TASK-14: Consistencia de tipos y contratos

- Objetivo: garantizar uso de tipos de specs sin redefiniciones ad hoc.
- Dependencias: TASK-05, TASK-08, TASK-10, TASK-11, TASK-12, TASK-13.
- Entregables:
  - Uso consistente de FacetsResponse, AlertsResponse, TopCategoriesResponse.
  - Uso consistente de DateRangeFilter, AlertsParams, TopCategoriesParams.
- Done:
  - Sin duplicación de shapes de API.

### TASK-15: QA funcional mínimo (manual)

- Objetivo: validar edge cases críticos definidos en README.
- Dependencias: TASK-14.
- Escenarios:
  - Rango válido con datos.
  - Rango válido sin datos.
  - Rango inválido start_date > end_date.
  - Threshold fuera de rango UI.
  - Comparativa con un panel vacío y con ambos vacíos.
- Done:
  - Todos los escenarios ejecutados y documentados.

## Asignación sugerida para paralelizar

- Dev A: TASK-01, TASK-02, TASK-04, TASK-05.
- Dev B: TASK-06, TASK-07, TASK-08.
- Dev C: TASK-09, TASK-10, TASK-11.
- Dev D: TASK-12, TASK-13.
- QA/Lead: TASK-14, TASK-15.

## Orden sugerido de ejecución

1. Arrancar TASK-01, TASK-03 y TASK-06 en paralelo.
2. Completar TASK-02 y TASK-04 para habilitar TASK-05.
3. Ejecutar TASK-07 y TASK-08 para cerrar alertas.
4. Lanzar TASK-09 y TASK-10, luego dividir TASK-11 y TASK-12 en paralelo.
5. Cerrar con TASK-13, TASK-14 y TASK-15.