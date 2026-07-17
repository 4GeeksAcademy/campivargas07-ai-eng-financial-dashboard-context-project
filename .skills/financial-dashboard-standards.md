---
name: financial-dashboard-standards
description: Project-specific standards for financial dashboard data presentation, accessibility, and metric consistency. Use when editing KPI cards, charts, date ranges, money/percentage formatting, or dashboard copy.
version: 1.0.0
owner: ai-eng-financial-dashboard-context-project
---

# Financial Dashboard Standards

## Objective
Ensure every dashboard change preserves financial accuracy, accessible UX, and consistent domain language without breaking existing contracts.

## Context
This project uses React + TypeScript (Vite) with FastAPI backend endpoints. The dashboard renders KPIs and financial charts from API data. Small UI changes can accidentally introduce metric drift, accessibility regressions, or inconsistent formatting.

## When To Use
Use this skill when:
- adding or editing KPI cards
- adding or editing financial charts
- changing money or percentage formatting
- introducing dashboard filters and period labels
- changing API data mapping in frontend
- reviewing accessibility of dynamic financial content

Do not use this skill for backend-only infrastructure changes unrelated to dashboard presentation.

## Inputs
- affected frontend files under frontend/src/App.tsx, frontend/src/components/dashboard, frontend/src/lib
- API contract definitions under frontend/specs/api-types.ts and frontend/src/lib/financial-types.ts
- user requirement for financial metric behavior or visual output

## Outputs
- minimal patch that keeps existing business logic intact
- updated accessible labels/descriptions for dynamic KPI/chart content
- consistent monetary and percentage formatting across components
- short validation notes with lint/build/test status

## Steps
1. Confirm contract alignment:
- verify data fields used in UI exist in frontend financial types and match backend response shape
- avoid introducing ad-hoc API shapes

2. Preserve metric semantics:
- total income sums only income movements
- total outcome sums only outcome movements
- profit equals income minus outcome
- profit margin uses profit divided by income with safe zero-income handling

3. Enforce formatting consistency:
- use shared utils for currency and percent display
- avoid manual inline formatting when shared utils exist
- keep period labels explicit and human readable

4. Apply dashboard accessibility rules:
- dynamic loading and error states must be announced via live regions
- sections should have landmark labels and heading structure
- decorative icons must be hidden from assistive tech
- charts must include a concise text alternative or description
- ensure keyboard focus remains visible

5. Validate visual stability and performance:
- keep stable chart/card heights during loading to reduce layout shift
- prefer lazy loading for heavy visualization modules when practical
- avoid unnecessary rerenders in top-level dashboard container

6. Verify and document:
- run frontend lint, build, and tests
- capture key changed files and rationale

## Acceptance Criteria
- dashboard compiles and tests pass
- no API contract break introduced in frontend
- KPI and chart values remain logically consistent with existing formulas
- loading/error/chart updates are understandable with screen readers
- focus indicators remain visible for keyboard users
- chart rendering does not create new avoidable layout shifts

## Examples

### Example 1: New KPI helper text update
Input:
- change helper copy for Profit card

Expected output:
- update copy in KPI card usage only
- keep existing profit formula untouched
- verify helper text remains understandable and accessible

### Example 2: Chart component enhancement
Input:
- add trend insight to profit chart

Expected output:
- add text description for assistive tech
- avoid changing underlying dataset mapping
- keep loading skeleton dimensions stable

### Example 3: Data fetch hardening
Input:
- improve resilience of dashboard data loading

Expected output:
- add abort-safe fetch handling and non-silent error logging
- keep endpoint and response mapping backward compatible
- expose user-facing error in consistent language
