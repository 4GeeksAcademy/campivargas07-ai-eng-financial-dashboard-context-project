import type { BusinessType, OperationType } from "../src/lib/financial-types"

/**
 * Date string used in API query params.
 * Format: YYYY-MM-DD (for example, 2026-07-15).
 */
export type QueryDateString = string

/**
 * Shared optional date range filter for dashboard requests.
 * Used by main dashboard and B2B vs B2C comparison.
 */
export interface DateRangeFilter {
  /**
   * Inclusive start date.
   * Optional; when omitted, backend does not apply lower bound.
   * Format: YYYY-MM-DD.
   */
  start_date?: QueryDateString

  /**
   * Inclusive end date.
   * Optional; when omitted, backend does not apply upper bound.
   * Format: YYYY-MM-DD.
   */
  end_date?: QueryDateString
}

/**
 * Valid grouping values accepted by GET /api/metrics/alerts.
 */
export type AlertsGroupBy = "day" | "week" | "month"

/**
 * Query params for GET /api/metrics/alerts.
 */
export interface AlertsParams extends DateRangeFilter {
  /**
   * Anomaly threshold ratio.
   * Product rule for UI: 0.01 to 1.0.
   * Backend contract: minimum 0 (no backend max).
   * Backend default: 0.3.
   */
  threshold?: number

  /**
   * Time bucket used by backend aggregation.
   * Backend default: month.
   */
  group_by?: AlertsGroupBy

  /**
   * Optional business line filter.
   * Valid values: B2B, B2C.
   */
  business_type?: BusinessType
}

/**
 * Query params for GET /api/metrics/categories/top.
 */
export interface TopCategoriesParams extends DateRangeFilter {
  /**
   * Operation type used for ranking.
   * For comparison feature use income.
   * Backend default: outcome.
   */
  operation_type?: OperationType

  /**
   * Maximum number of ranked categories.
   * Backend validation: integer between 1 and 20.
   * Backend default: 5.
   */
  limit?: number

  /**
   * Optional business line filter.
   * Valid values: B2B, B2C.
   */
  business_type?: BusinessType
}