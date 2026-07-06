# Flujo de datos en el frontend

## Alcance

`frontend/src/App.tsx`, `frontend/src/lib/`, `frontend/src/components/dashboard/` y llamadas `fetch` a la API.

## Razón

El frontend actualmente hace un único `GET /api/metrics` y re-agrega KPIs y series mensuales en el cliente (`computeKPIs`, `computeMonthlyData`), duplicando `/api/metrics/summary`. Además existe `mock-data.ts` sin uso. Esta regla evita más duplicación y mantiene componentes presentacionales.

## Cómo aplicar en este repositorio

### Jerarquía de responsabilidades

1. **`lib/financial-types.ts`** — tipos de dominio alineados con Pydantic backend.
2. **`lib/financial-utils.ts`** — formateo (`formatCurrency`) y transformaciones UI-only.
3. **`App.tsx`** — orquestación: fetch, estados `loading`/`error`, composición.
4. **`components/dashboard/`** — presentación; reciben datos ya calculados por props.

### Preferir API backend antes de agregar lógica client-side

Antes de escribir una nueva función de agregación en `financial-utils.ts`, evaluar si el backend ya expone el dato:

| Necesidad UI | Endpoint existente |
|--------------|-------------------|
| KPIs agregados por periodo | `GET /api/metrics/summary?group_by=month` |
| Rango de fechas / filtros disponibles | `GET /api/metrics/facets` |
| Top categorías | `GET /api/metrics/categories/top` |
| Alertas de gasto | `GET /api/metrics/alerts` |
| Movimientos crudos | `GET /api/metrics` |

### Fetch y configuración

- Desarrollo: URL relativa `/api/...` (proxy Vite en `vite.config.ts`).
- Backend externo: `VITE_API_BASE_URL` según `frontend/.env.example`.
- No hardcodear `http://localhost:8000` en componentes.

### Código muerto

No mantener archivos de datos mock en frontend si la fuente es el backend. `mock-data.ts` debe eliminarse o usarse solo en tests/storybook documentado.

## Ejemplo del código actual

Fetch actual (correcto en patrón, mejorable en endpoint):

```15:20:frontend/src/App.tsx
async function fetchFinancialData(): Promise<FinancialMovement[]> {
  const response = await fetch(`${API_BASE_URL}/api/metrics`);
  if (!response.ok) {
    throw new Error(`Failed to fetch financial data: ${response.status}`);
  }
  return response.json();
}
```

Agregación que debería migrar a `/api/metrics/summary`:

```32:33:frontend/src/App.tsx
        setMetrics(computeKPIs(movements));
        setMonthlyData(computeMonthlyData(movements));
```

Componente presentacional correcto (solo recibe props):

```34:50:frontend/src/components/dashboard/kpi-card.tsx
export function KPICard({ label, value, helperText, icon: Icon, variant, loading }: KPICardProps) {
  ...
  if (loading) {
    return ( /* skeleton */ );
  }
```

## Criterio de verificación

- [ ] Nuevas agregaciones evalúan primero un endpoint backend existente.
- [ ] Componentes en `dashboard/` no contienen `fetch` ni `useEffect` de datos.
- [ ] Tipos en `financial-types.ts` coinciden con el endpoint consumido.
- [ ] No hay archivos de mock sin importar en producción.

### Escenario de validación

**Tarea:** Mostrar top 5 categorías de gasto en el dashboard.

**Decisión guiada por la regla:** Consumir `GET /api/metrics/categories/top?operation_type=outcome&limit=5`; crear componente `TopCategoriesChart` que recibe `TopCategoryItem[]` por props; no filtrar/agrupar en el componente.
