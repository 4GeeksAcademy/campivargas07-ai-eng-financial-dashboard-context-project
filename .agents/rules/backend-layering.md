# Separación de capas en el backend

## Alcance

Todo código Python bajo `backend/app/` al agregar o refactorizar modelos, lógica de negocio o endpoints HTTP.

## Razón

Hoy `backend/app/routes.py` concentra modelos Pydantic, generación mock, funciones de agregación y handlers HTTP en ~392 líneas. Eso dificulta revisiones, tests focalizados y evolución del API. Separar capas preserva las funciones puras existentes (`filter_movements`, `summarize_movements`) sin acoplarlas a FastAPI.

## Cómo aplicar en este repositorio

Estructura objetivo dentro de `backend/app/`:

```text
app/
├── main.py           # Solo creación de app, middleware, include_router
├── models/           # Pydantic: FinancialMovement, MetricsFacets, etc.
├── services/         # Lógica pura: filter_movements, summarize_movements, mock generator
└── routes/           # Handlers HTTP delgados que delegan a services
```

Reglas concretas:

1. **Handlers delgados:** un endpoint solo valida entrada, llama al service y retorna el resultado tipado.
2. **Sin lógica de negocio en decoradores:** no agregar bucles de agregación dentro de funciones `@router.get`.
3. **Mock data en service:** `generate_mock_movements` vive en `services/mock_data.py` (o similar), no en el archivo de rutas.
4. **Límite de tamaño:** ningún archivo de rutas supera ~150 líneas; dividir por dominio (`metrics.py`, `health.py`) si crece.

## Ejemplo del código actual

Estado actual (monolito):

```248:259:backend/app/routes.py
@router.get("/api/metrics", response_model=list[FinancialMovement])
def get_metrics(
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    category: Category | None = Query(default=None),
    operation_type: OperationType | None = Query(default=None),
) -> list[FinancialMovement]:
    movements = generate_mock_movements(seed=42)
    filtered = filter_movements(
        movements, start_date, end_date, category, operation_type
    )
    return ensure_chronological_order(filtered)
```

Patrón deseado tras refactor:

```python
# routes/metrics.py
@router.get("/api/metrics", response_model=list[FinancialMovement])
def get_metrics(...) -> list[FinancialMovement]:
    return metrics_service.get_movements(...)

# services/metrics_service.py
def get_movements(...) -> list[FinancialMovement]:
    movements = mock_data.generate_movements(seed=42)
    return ensure_chronological_order(filter_movements(movements, ...))
```

## Criterio de verificación

- [ ] Modelos Pydantic no están definidos en archivos con `@router.get`.
- [ ] Funciones como `summarize_movements` son importables desde tests sin cargar FastAPI.
- [ ] Un revisor puede localizar un endpoint nuevo en `< 30 s` sin leer mock generation.

### Escenario de validación

**Tarea:** Agregar `GET /api/metrics/export`.

**Decisión guiada por la regla:** Handler en `routes/metrics.py`; lógica de serialización en `services/export_service.py`; modelo de respuesta en `models/export.py`. No ampliar un único `routes.py`.
