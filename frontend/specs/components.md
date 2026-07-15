# Component Specification — Financial Dashboard

This document defines frontend component behavior and data contracts for three requested features.
It does not include implementation details.

## Functionalidad 1 — Filtro de rango de fechas

### 1) `DashboardDateRangeFilters`

- Purpose: render two optional date inputs (`start_date`, `end_date`) and coordinate date filter changes for all dashboard sections.
- Inputs:
  - `value: DateRangeFilter`
  - `minDate: string` (from `FacetsResponse.min_date`)
  - `maxDate: string` (from `FacetsResponse.max_date`)
  - `onChange(next: DateRangeFilter): void`
  - `disabled?: boolean`
- Data source:
  - `GET /api/metrics/facets` for valid reference range.
- Rules:
  - Both inputs are optional.
  - Accepted format for outgoing params: `YYYY-MM-DD`.
  - If both dates exist and `start_date > end_date`, show inline validation error and do not trigger dependent fetches.
  - Clearing both dates must restore unfiltered behavior.

### 2) `AvailableDateRangeHint`

- Purpose: show user-visible reference range near inputs.
- Inputs:
  - `minDate: string`
  - `maxDate: string`
- Data source:
  - `GET /api/metrics/facets`.
- Rules:
  - Must always be visible once facets load.
  - Show fallback skeleton while facets are loading.
  - On facets error, show concise error text and keep date inputs disabled.

### 3) `DashboardDataOrchestrator` (container-level behavior)

- Purpose: centralize shared date filter state and forward it to all feature sections in the main dashboard.
- Owns:
  - Current `DateRangeFilter`.
  - Facets loading/error state.
- Propagates filter to:
  - Existing KPI/cards and charts data pipeline.
  - Alerts section defined in Functionalidad 2.

## Functionalidad 2 — Tabla de alertas de anomalías

### 1) `AlertsThresholdInput`

- Purpose: collect anomaly threshold ratio used by alerts request.
- Inputs:
  - `value: number`
  - `onChange(next: number): void`
  - `min?: number` (UI rule: `0.01`)
  - `max?: number` (UI rule: `1.0`)
  - `step?: number` (recommended `0.01`)
  - `disabled?: boolean`
- Rules:
  - Default value: `0.3`.
  - UI must enforce product range `0.01..1.0`.
  - If out of range, block request and show inline validation message.

### 2) `AnomalyAlertsTable`

- Purpose: display alerts in a 4-column table.
- Inputs:
  - `rows: AlertsResponse`
  - `loading: boolean`
  - `error: string | null`
- Columns:
  - `period`
  - `outcome_total`
  - `baseline_average`
  - `increase_ratio`
- Data source:
  - `GET /api/metrics/alerts` with `AlertsParams`.
- Rules:
  - Must render explicit empty state when `rows.length === 0`.
  - Empty state text must remain visible (table cannot silently disappear).
  - Currency and ratio formatting should be presentation-only (no mutation of payload values).

### 3) `AlertsSection`

- Purpose: compose threshold input + alerts table under existing charts.
- Inputs:
  - `dateRange: DateRangeFilter` (from Functionalidad 1)
- Request behavior:
  - Always include current threshold.
  - Include `start_date` and `end_date` only when set.
  - Optionally include `group_by` (default month when omitted).
- States:
  - Loading: render table skeleton with fixed 4-column structure.
  - Error: show recoverable message with retry action.
  - Empty: show explicit no-anomaly message for current threshold.

## Functionalidad 3 — Vista comparativa B2B vs B2C

### 1) `BusinessComparisonDateRangeFilters`

- Purpose: independent date range filter for comparison page.
- Inputs:
  - `value: DateRangeFilter`
  - `minDate: string`
  - `maxDate: string`
  - `onChange(next: DateRangeFilter): void`
- Data source:
  - `GET /api/metrics/facets`.
- Rules:
  - Same date validation semantics as main dashboard filters.

### 2) `TopIncomeCategoriesPanel`

- Purpose: render one side panel (B2B or B2C) with top 5 income categories.
- Inputs:
  - `businessType: "B2B" | "B2C"`
  - `rows: TopCategoriesResponse`
  - `loading: boolean`
  - `error: string | null`
- Data source:
  - `GET /api/metrics/categories/top` with:
    - `operation_type=income`
    - `limit=5`
    - `business_type` set to panel group
    - optional `start_date`, `end_date`
- Table columns:
  - Category name (`category`)
  - Total income (`total_amount`)
  - Share over group total (derived UI value)
- Rules:
  - Share formula: `row.total_amount / sum(total_amount for panel rows) * 100`.
  - If panel rows are empty, show explicit empty state for that business line.

### 3) `B2BvsB2CIncomeComparisonChart`

- Purpose: single grouped bar chart comparing total income B2B vs B2C.
- Inputs:
  - `b2bRows: TopCategoriesResponse`
  - `b2cRows: TopCategoriesResponse`
  - `loading: boolean`
  - `error: string | null`
- Derived values:
  - `b2bTotalIncome = sum(b2bRows.total_amount)`
  - `b2cTotalIncome = sum(b2cRows.total_amount)`
- Rules:
  - Chart always shows exactly two bars (B2B and B2C) when data exists.
  - If one group has no rows, show zero-value bar and warning caption.
  - If both groups have no rows, show chart empty state with current date filter context.

### 4) `BusinessComparisonPage`

- Purpose: compose date filters, two category panels, and grouped comparison chart.
- Layout:
  - Two side-by-side sections for B2B and B2C on desktop.
  - Single-column stacked layout on mobile.
  - One chart below both sections.
- Orchestration rules:
  - Fetch facets once per page load.
  - Fetch top categories in parallel for B2B and B2C on filter change.
  - Keep section-level loading independent to avoid blocking both panels.
