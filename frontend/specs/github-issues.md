# GitHub Issues Ready to Create

Copiar cada bloque como issue en GitHub.

---

## [TASK-01] Estado central de filtro de fechas (dashboard principal)

### Objetivo
Crear estado compartido para `start_date` y `end_date` usando `DateRangeFilter`.

### Alcance
- Estado único de rango en el contenedor principal.
- Helpers para actualizar y limpiar filtros.

### Dependencias
- Ninguna.

### Criterios de aceptación
- Cambios en inputs actualizan el estado único.
- Limpiar filtros restaura estado unfiltered.

---

## [TASK-02] Validación local de rango de fechas

### Objetivo
Bloquear requests cuando `start_date > end_date`.

### Alcance
- Regla de validación local.
- Mensaje inline de error.

### Dependencias
- TASK-01.

### Criterios de aceptación
- No se dispara fetch con rango inválido.
- El error desaparece al corregir fechas.

---

## [TASK-03] Integrar facetas para rango de referencia

### Objetivo
Consumir `GET /api/metrics/facets` para mostrar `min_date` y `max_date`.

### Alcance
- Request inicial de facetas.
- Estados loading y error.
- Hint visible de rango disponible.

### Dependencias
- Ninguna.

### Criterios de aceptación
- Rango mostrado coincide con `FacetsResponse`.
- Si falla, filtros deshabilitados con mensaje recuperable.

---

## [TASK-04] Componente de inputs de fecha

### Objetivo
Implementar bloque visual de filtro por fechas.

### Alcance
- Input inicio.
- Input fin.
- Soporte `disabled`.

### Dependencias
- TASK-01, TASK-02, TASK-03.

### Criterios de aceptación
- Ambos inputs soportan vacío.
- Respeta reglas de validación definidas.

---

## [TASK-05] Propagar rango al fetch de métricas del dashboard

### Objetivo
Aplicar filtro de fechas en la carga de datos del dashboard principal.

### Alcance
- Envío condicional de `start_date` y `end_date`.
- Sincronización de KPIs y gráficos con el mismo rango.

### Dependencias
- TASK-01, TASK-04.

### Criterios de aceptación
- Todos los módulos reaccionan al mismo rango activo.
- Con filtros vacíos, muestra dataset completo.

---

## [TASK-06] Threshold de alertas con regla de producto

### Objetivo
Implementar input numérico de threshold con default `0.3` y rango UI `0.01..1.0`.

### Alcance
- Control numérico.
- Validación inline de rango.

### Dependencias
- Ninguna.

### Criterios de aceptación
- No hay request con threshold inválido.
- Valor inicial `0.3`.

---

## [TASK-07] Integración de datos de alertas

### Objetivo
Consumir `GET /api/metrics/alerts` con `AlertsParams` tipado.

### Alcance
- Construcción de params con threshold y rango.
- Manejo de respuesta `AlertsResponse`.

### Dependencias
- TASK-01, TASK-06.

### Criterios de aceptación
- Params siguen contrato backend.
- Estado de error recuperable en fallo de request.

---

## [TASK-08] Tabla de alertas con estados completos

### Objetivo
Mostrar tabla de alertas con 4 columnas y estados loading/error/empty.

### Alcance
- Columnas: `period`, `outcome_total`, `baseline_average`, `increase_ratio`.
- Empty state explícito para `[]`.

### Dependencias
- TASK-07.

### Criterios de aceptación
- La tabla no desaparece silenciosamente.
- Empty state visible cuando no hay anomalías.

---

## [TASK-09] Página de comparación B2B vs B2C

### Objetivo
Crear vista dedicada de comparación con filtro de fechas propio.

### Alcance
- Nueva página de comparación.
- Rango de fechas independiente del dashboard principal.

### Dependencias
- TASK-02, TASK-03.

### Criterios de aceptación
- Misma validación de rango que dashboard principal.
- Rango de referencia visible desde facetas.

---

## [TASK-10] Fetch paralelo top categorías B2B/B2C

### Objetivo
Solicitar top categorías income para ambos grupos en paralelo.

### Alcance
- B2B: `operation_type=income`, `limit=5`, `business_type=B2B`.
- B2C: `operation_type=income`, `limit=5`, `business_type=B2C`.
- Filtros de fecha opcionales.

### Dependencias
- TASK-09.

### Criterios de aceptación
- Ambos requests tipados con `TopCategoriesParams`.
- Falla parcial no bloquea panel exitoso.

---

## [TASK-11] Panel tabla top categorías B2B

### Objetivo
Renderizar tabla B2B con porcentaje por categoría.

### Alcance
- Columnas categoría, total, share.
- Empty state específico B2B.

### Dependencias
- TASK-10.

### Criterios de aceptación
- Share calculado sobre total B2B.

---

## [TASK-12] Panel tabla top categorías B2C

### Objetivo
Renderizar tabla B2C con porcentaje por categoría.

### Alcance
- Columnas categoría, total, share.
- Empty state específico B2C.

### Dependencias
- TASK-10.

### Criterios de aceptación
- Share calculado sobre total B2C.

---

## [TASK-13] Gráfico agrupado de comparación total

### Objetivo
Comparar ingreso total B2B vs B2C en un solo gráfico.

### Alcance
- Derivar totales desde top categories.
- Render de dos barras.
- Manejo de vacíos parciales y totales.

### Dependencias
- TASK-11, TASK-12.

### Criterios de aceptación
- Grupo vacío muestra barra 0 con leyenda.
- Ambos vacíos muestran empty state.

---

## [TASK-14] Consistencia final de tipos/contratos

### Objetivo
Asegurar uso consistente de tipos de `frontend/specs`.

### Alcance
- Usar `FacetsResponse`, `AlertsResponse`, `TopCategoriesResponse`.
- Usar `DateRangeFilter`, `AlertsParams`, `TopCategoriesParams`.

### Dependencias
- TASK-05, TASK-08, TASK-10, TASK-11, TASK-12, TASK-13.

### Criterios de aceptación
- Sin redefiniciones ad hoc de shapes.

---

## [TASK-15] QA funcional mínimo manual

### Objetivo
Validar edge cases críticos definidos en specs.

### Alcance
- Rango válido con datos.
- Rango válido sin datos.
- `start_date > end_date`.
- Threshold fuera de rango UI.
- Comparativa con un panel vacío y ambos vacíos.

### Dependencias
- TASK-14.

### Criterios de aceptación
- Escenarios ejecutados y documentados.
