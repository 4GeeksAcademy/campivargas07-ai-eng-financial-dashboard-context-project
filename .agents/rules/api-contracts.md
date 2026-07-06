# Contratos API tipados

## Alcance

Creación o modificación de endpoints en `backend/app/` y tipos de dominio en `frontend/src/lib/financial-types.ts`.

## Razón

El proyecto ya usa `response_model`, enums `Literal` y validación `Query(ge=, le=)`. Este patrón genera documentación OpenAPI en `/docs`, rechaza entradas inválidas con 422 y mantiene alineación implícita con el frontend. Abandonarlo introduciría deriva de contrato.

## Cómo aplicar en este repositorio

1. **Siempre `response_model`** en decoradores `@router.get/post/...`.
2. **Enums como `Literal`** en Python (`OperationType`, `Category`, etc.) — no strings libres.
3. **Validar query params** con `Query(default=..., ge=..., le=...)` cuando sean numéricos o acotados.
4. **Modelos Pydantic** para respuestas compuestas (`MetricsFacets`, `MetricsSummaryItem`).
5. **Sincronizar frontend:** al cambiar un enum o campo en backend, actualizar `financial-types.ts` en el mismo PR.
6. **No romper rutas existentes** sin documentar en `memory-bank/current-state.md`.

Endpoints actuales que deben mantener este estándar:

| Ruta | Modelo de respuesta |
|------|---------------------|
| `/api/metrics` | `list[FinancialMovement]` |
| `/api/metrics/facets` | `MetricsFacets` |
| `/api/metrics/summary` | `list[MetricsSummaryItem]` |
| `/api/metrics/categories/top` | `list[TopCategoryItem]` |
| `/api/metrics/comparison` | `MetricsComparison` |
| `/api/metrics/alerts` | `list[MetricsAlert]` |

## Ejemplo del código actual

Tipado y validación correctos:

```11:15:backend/app/routes.py
OperationType = Literal["income", "outcome"]
Category = Literal["suppliers", "sales",
                   "operational", "administrative", "others"]
BusinessType = Literal["B2B", "B2C"]
GroupBy = Literal["day", "week", "month"]
```

```287:290:backend/app/routes.py
def get_top_categories(
    operation_type: OperationType = Query(default="outcome"),
    limit: int = Query(default=5, ge=1, le=20),
```

Anti-patrón a evitar:

```python
# ❌ Sin response_model, retorno dict genérico
@router.get("/api/metrics/custom")
def get_custom():
    return {"data": some_list}
```

## Criterio de verificación

- [ ] El endpoint nuevo aparece en http://localhost:8000/docs con schema completo.
- [ ] `limit=-1` o categoría inválida retorna 422, no 500.
- [ ] `financial-types.ts` refleja los mismos literales que el backend.

### Escenario de validación

**Tarea:** Agregar filtro `min_amount` opcional a `/api/metrics`.

**Decisión guiada por la regla:** `min_amount: float | None = Query(default=None, ge=0)`; mantener `response_model=list[FinancialMovement]`; no cambiar la forma del JSON de respuesta.
