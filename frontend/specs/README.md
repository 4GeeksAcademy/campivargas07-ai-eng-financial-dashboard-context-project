# Frontend Specs — Data Contracts

This folder defines frontend specifications for three features without implementing UI components or network code.

## Scope

- Include only frontend data contracts, parameter types, and component behavior definitions.
- Exclude React implementation and API service implementation.

## Source of truth

- Backend route contracts: `GET /api/metrics`, `GET /api/metrics/facets`, `GET /api/metrics/alerts`, `GET /api/metrics/categories/top`.
- Validated against backend OpenAPI (`/openapi.json`) and route models in backend code.

## Files in this folder

- `api-types.ts`: response shapes used by the three features.
- `param-types.ts`: query parameter types sent from frontend.
- `components.md`: component-level functional breakdown.
- `implementation-checklist.md`: execution checklist to implement the specs safely and in order.
- `implementation-tasks.md`: parallel backlog with task IDs, dependencies, and done criteria.
- `github-issues.md`: copy-paste issue templates ready to create in GitHub.

---

## Funcionalidad 1 — Filtro de rango de fechas (dashboard principal)

### Endpoints consumidos

1. `GET /api/metrics/facets`
- Purpose: obtain valid dataset range (`min_date`, `max_date`) and available facets.

2. `GET /api/metrics`
- Purpose: fetch filtered metrics data for dashboard content.

### Request parameter types

- Shared: `DateRangeFilter` from `param-types.ts`
  - `start_date?: string` (`YYYY-MM-DD`)
  - `end_date?: string` (`YYYY-MM-DD`)

### Response types

- `FacetsResponse` from `api-types.ts`
- Existing movement type for dashboard data: `FinancialMovement[]` from `../src/lib/financial-types.ts`

### Valid values and constraints

- Date format: `YYYY-MM-DD`.
- Both date params are optional.
- Backend behavior:
  - Missing `start_date` means no lower bound.
  - Missing `end_date` means no upper bound.
  - Invalid date format returns `422`.

### Edge cases (UI behavior)

1. `start_date > end_date`
- UI must show local validation error and stop dependent data requests until fixed.

2. Date range outside dataset (`start_date` after `max_date`, or `end_date` before `min_date`)
- UI keeps filter values, receives empty metric results, and shows empty state for dependent visualizations.

3. Facets request fails
- UI disables date filters and shows recoverable error message near the filter area.

---

## Funcionalidad 2 — Tabla de alertas de anomalías (dashboard principal)

### Endpoint consumido

1. `GET /api/metrics/alerts`
- Purpose: detect unusual outcome increases by period.

### Request parameter types

- `AlertsParams` from `param-types.ts`
  - `threshold?: number`
  - `group_by?: "day" | "week" | "month"`
  - `start_date?: string` (`YYYY-MM-DD`)
  - `end_date?: string` (`YYYY-MM-DD`)
  - `business_type?: "B2B" | "B2C"`

### Response types

- `AlertEntry`
- `AlertsResponse`

### Valid values and constraints

- Product UI rule: threshold input must stay in `0.01..1.0`.
- Backend contract:
  - `threshold >= 0` (default `0.3`)
  - `group_by` default is `month`
  - date params optional, format `YYYY-MM-DD`

### Edge cases (UI behavior)

1. Threshold outside UI range (`< 0.01` or `> 1.0`)
- UI blocks request and shows inline validation message.

2. Alerts response is empty array (`[]`)
- UI renders explicit empty-state message in the table area: no anomalies for current threshold and date range.

3. Backend validation error (`422`) due to malformed date
- UI shows request error state and preserves previous valid table if available.

---

## Funcionalidad 3 — Vista comparativa B2B vs B2C

### Endpoints consumidos

1. `GET /api/metrics/facets`
- Purpose: date reference range and available facets.

2. `GET /api/metrics/categories/top`
- Purpose: top income categories per business line.

### Request parameter types

- Shared: `DateRangeFilter`
- `TopCategoriesParams` from `param-types.ts`
  - `operation_type?: "income" | "outcome"` (comparison view uses `income`)
  - `limit?: number` (backend `1..20`, default `5`)
  - `business_type?: "B2B" | "B2C"`
  - `start_date?: string` (`YYYY-MM-DD`)
  - `end_date?: string` (`YYYY-MM-DD`)

### Response types

- `CategoryEntry`
- `TopCategoriesResponse`
- `FacetsResponse`

### Valid values and constraints

- For both comparison tables:
  - `operation_type=income`
  - `limit=5`
  - one request for `business_type=B2B`
  - one request for `business_type=B2C`
- Date range is optional and uses `YYYY-MM-DD`.

### Edge cases (UI behavior)

1. One side returns empty (for example B2C has no rows in selected date range)
- UI shows empty state only in affected table and keeps the other table visible.
- Grouped chart renders zero bar for empty side with explanatory caption.

2. Both sides return empty
- UI shows explicit empty state in both tables and chart area.

3. One request fails and the other succeeds
- UI keeps successful panel data visible and renders independent error state for failed panel.

---

## Cross-feature notes

- Date fields are represented as `string` in frontend with `YYYY-MM-DD` format.
- API responses for alerts and top categories are raw arrays (no `data` envelope).
- Types in this folder intentionally reuse base unions from `../src/lib/financial-types.ts` to avoid contract drift.
- If backend `Literal` values or response models change, update both `api-types.ts` and `param-types.ts` in the same PR.