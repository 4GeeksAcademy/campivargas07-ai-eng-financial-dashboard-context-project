# Estándares de testing

## Alcance

`backend/tests/` (pytest) y `frontend/src/**/*.test.ts` (Vitest) al agregar endpoints, servicios o utilidades.

## Razón

El backend tiene 15 tests de integración que cubren todos los endpoints HTTP; el frontend prueba `financial-utils.ts` con edge cases. Sin embargo, funciones puras del backend (`summarize_movements`, `build_metrics_facets`) carecen de tests unitarios directos. La regla formaliza el mínimo para no perder cobertura al crecer.

## Cómo aplicar en este repositorio

### Backend (pytest + TestClient)

| Cambio | Test requerido |
|--------|----------------|
| Endpoint HTTP nuevo | Test de integración en `test_routes.py` con `client.get/post(...)` |
| Función pura en services | Test unitario directo (sin TestClient) |
| Filtro o query param nuevo | Test que verifica filtrado con datos de `seed=42` |
| Cambio en mock generator | Actualizar `test_generate_mock_movements_returns_full_year_sorted_data` |

Patrón existente a seguir:

```29:33:backend/tests/test_routes.py
def test_health_endpoint_returns_ok():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
```

Usar `generate_mock_movements(seed=42)` para datos deterministas.

### Frontend (Vitest)

| Cambio | Test requerido |
|--------|----------------|
| Función en `lib/*.ts` | Archivo `*.test.ts` colocado junto al módulo |
| Edge case numérico | Al menos un test (división por cero, listas vacías) |
| Componente con lógica compleja | Preferir extraer lógica a `lib/` y testear ahí |

Patrón existente:

```47:60:frontend/src/lib/financial-utils.test.ts
  it("returns 0 profitPercent when there is no income", () => {
    const onlyOutcomes: FinancialMovement[] = [...];
    const metrics = computeKPIs(onlyOutcomes);
    expect(metrics.profitPercent).toBe(0);
  });
```

### Comandos

```bash
# Backend (dentro del contenedor o con venv)
pytest backend/tests/

# Frontend
cd frontend && npm test
```

## Criterio de verificación

- [ ] PR con endpoint nuevo incluye al menos un test que verifica status 200 y forma del JSON.
- [ ] PR con función pura nueva incluye test que no levanta servidor HTTP.
- [ ] Tests usan `seed=42` cuando dependen de mock data.
- [ ] No se mergean tests condicionales del tipo `if payload:` sin assert en rama alternativa.

### Escenario de validación

**Tarea:** Agregar `GET /api/metrics/export`.

**Decisión guiada por la regla:** Crear `test_metrics_export_returns_csv` en `test_routes.py`; si la lógica de CSV vive en `export_service.py`, añadir `test_export_service_formats_headers` sin TestClient.
