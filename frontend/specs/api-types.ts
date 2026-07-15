import type {
  BusinessType,
  Category,
  OperationType,
} from "../src/lib/financial-types"

/**
 * Date string used by FastAPI date fields.
 * Format: YYYY-MM-DD (for example, 2026-07-15).
 */
export type ApiDateString = string

/**
 * Response body of GET /api/metrics/facets.
 */
export interface FacetsResponse {
  /**
   * Supported operation types in the dataset.
   * Valid values: income, outcome.
   */
  operation_types: OperationType[]

  /**
   * Supported business lines in the dataset.
   * Valid values: B2B, B2C.
   */
  business_types: BusinessType[]

  /**
   * Supported movement categories in the dataset.
   * Valid values: suppliers, sales, operational, administrative, others.
   */
  categories: Category[]

  /**
   * Earliest available date in the dataset.
   * Format: YYYY-MM-DD.
   */
  min_date: ApiDateString

  /**
   * Latest available date in the dataset.
   * Format: YYYY-MM-DD.
   */
  max_date: ApiDateString
}

/**
 * One anomaly row from GET /api/metrics/alerts.
 */
export interface AlertEntry {
  /**
   * Aggregation period where anomaly is detected.
   * Examples: 2026-01 (month), 2026-W04 (week), 2026-01-17 (day).
   */
  period: string

  /**
   * Outcome amount for the evaluated period.
   * Unit: monetary amount in the same currency used by the dataset.
   */
  outcome_total: number

  /**
   * Average outcome over the previous periods used as baseline.
   * In the current backend implementation this is a moving historical average.
   */
  baseline_average: number

  /**
   * Relative increase over baseline as a ratio.
   * Example: 0.35 means a 35% increase.
   */
  increase_ratio: number
}

/**
 * Response body of GET /api/metrics/alerts.
 * The API returns a raw JSON array.
 */
export interface AlertsResponse extends ReadonlyArray<AlertEntry> {}

/**
 * One ranked category from GET /api/metrics/categories/top.
 */
export interface CategoryEntry {
  /**
   * Category name.
   * Valid values: suppliers, sales, operational, administrative, others.
   */
  category: Category

  /**
   * Operation type used to build the ranking.
   * For the B2B vs B2C feature this should be income.
   */
  operation_type: OperationType

  /**
   * Aggregated monetary total for this category.
   */
  total_amount: number
}

/**
 * Response body of GET /api/metrics/categories/top.
 * The API returns a raw JSON array.
 */
export interface TopCategoriesResponse extends ReadonlyArray<CategoryEntry> {}