# Análisis de prácticas de ingeniería — Financial Dashboard

Documento de Fase 2: inventario de buenas y malas prácticas con evidencia del código, y reglas propuestas para mitigar riesgos.

---

## Resumen ejecutivo

El repositorio muestra fundamentos sólidos para un proyecto educativo: tipado en API y frontend, funciones puras testables, tests de integración en backend y estados de carga en UI. Los riesgos principales son arquitectónicos (monolito en `routes.py`), operativos (Dockerfiles solo para dev), de seguridad (CORS permisivo) y de duplicación (frontend reimplementa lógica que el backend ya expone).

---

## Buenas prácticas identificadas

### 1. Tipado fuerte en contratos API (Categoría: API / Tipado)

**Hallazgo:** Todos los endpoints usan `response_model` de Pydantic y enums restringidos con `Literal`.

**Evidencia:**

```11:15:backend/app/routes.py
OperationType = Literal["income", "outcome"]
Category = Literal["suppliers", "sales",
                   "operational", "administrative", "others"]
BusinessType = Literal["B2B", "B2C"]
GroupBy = Literal["day", "week", "month"]
```

```248:254:backend/app/routes.py
@router.get("/api/metrics", response_model=list[FinancialMovement])
def get_metrics(
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    category: Category | None = Query(default=None),
    operation_type: OperationType | None = Query(default=None),
) -> list[FinancialMovement]:
```

**Impacto:** OpenAPI autogenerado en `/docs`, validación de entrada/salida y contrato explícito para el frontend.

---

### 2. Lógica de negocio en funciones puras (Categoría: Arquitectura)

**Hallazgo:** Filtrado, agregación y alertas están separados de los handlers HTTP.

**Evidencia:**

```125:143:backend/app/routes.py
def filter_movements(
    movements: list[FinancialMovement],
    start_date: date | None,
    end_date: date | None,
    category: Category | None,
    operation_type: OperationType | None,
) -> list[FinancialMovement]:
    filtered = filter_movements_by_date(movements, start_date, end_date)
    if category is not None:
        filtered = [
            movement for movement in filtered if movement.category == category
        ]
    if operation_type is not None:
        filtered = [
            movement
            for movement in filtered
            if movement.operation_type == operation_type
        ]
    return filtered
```

Funciones similares: `summarize_movements`, `build_top_categories`, `detect_outcome_alerts`.

**Impacto:** Facilita tests unitarios y reutilización sin acoplar a FastAPI.

---

### 3. Tests de integración que cubren todos los endpoints (Categoría: Testing)

**Hallazgo:** 15 tests en `test_routes.py` ejercitan `/health` y los 8 endpoints de métricas vía `TestClient`.

**Evidencia:**

```9:33:backend/tests/test_routes.py
client = TestClient(app)


def test_generate_mock_movements_returns_full_year_sorted_data():
    movements = generate_mock_movements(seed=42)

    assert len(movements) == 360
    assert movements == sorted(movements, key=lambda item: item.create_date)
...
def test_health_endpoint_returns_ok():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
```

**Impacto:** Regresiones en rutas HTTP se detectan sin levantar el servidor manualmente.

---

### 4. Utilidades frontend puras con tests de edge cases (Categoría: Testing / Frontend)

**Hallazgo:** `financial-utils.ts` concentra agregación y formateo; Vitest cubre casos límite.

**Evidencia:**

```47:60:frontend/src/lib/financial-utils.test.ts
  it("returns 0 profitPercent when there is no income", () => {
    const onlyOutcomes: FinancialMovement[] = [
      {
        create_date: "2024-03-05",
        amount: 350,
        operation_type: "outcome",
        category: "operational",
        business_type: "B2B",
      },
    ];

    const metrics = computeKPIs(onlyOutcomes);
    expect(metrics.profitPercent).toBe(0);
  });
```

También se prueba orden cronológico cross-year en `computeMonthlyData` (líneas 64–103).

**Impacto:** La lógica de presentación es verificable sin montar componentes React.

---

### 5. Estados de carga y error en el dashboard (Categoría: UX)

**Hallazgo:** `App.tsx` gestiona `loading` y `error`; componentes muestran skeletons.

**Evidencia:**

```26:42:frontend/src/App.tsx
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFinancialData()
      .then((movements) => {
        setMetrics(computeKPIs(movements));
        setMonthlyData(computeMonthlyData(movements));
      })
      .catch(() => {
        setError(
          "No se pudo cargar la informacion financiera. Revisa la API de backend.",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);
```

```37:49:frontend/src/components/dashboard/kpi-card.tsx
  if (loading) {
    return (
      <Card className="border-border/60">
        <CardContent className="p-6 flex flex-col gap-4">
          ...
          <Skeleton className="h-8 w-36" />
```

**Impacto:** Mejor experiencia durante fetch y feedback ante fallos de red.

---

### 6. Proxy de desarrollo documentado (Categoría: Developer Experience)

**Hallazgo:** Vite reenvía `/api` al backend en Docker; `.env.example` documenta el override opcional.

**Evidencia:**

```11:16:frontend/vite.config.ts
    proxy: {
      "/api": {
        target: "http://backend:8000",
        changeOrigin: true,
      },
    },
```

```1:4:frontend/.env.example
# Optional override for the backend base URL.
# In local development and Codespaces, the Vite proxy already forwards /api to the backend.
# Use this only when you need the frontend to call a different backend origin.
VITE_API_BASE_URL=
```

**Impacto:** Arranque sin configuración extra en Codespaces y desarrollo local.

---

### 7. Datos mock reproducibles con seed fijo (Categoría: Datos / Testing)

**Hallazgo:** `generate_mock_movements(seed=42)` garantiza el mismo dataset en tests y runtime.

**Evidencia:**

```94:96:backend/app/routes.py
def generate_mock_movements(seed: int | None = None) -> list[FinancialMovement]:
    if seed is not None:
        random.seed(seed)
```

Todos los handlers invocan `generate_mock_movements(seed=42)` (p. ej. línea 255).

**Impacto:** Tests deterministas y demos predecibles.

---

### 8. Validación de parámetros Query con límites (Categoría: API)

**Hallazgo:** Parámetros numéricos tienen restricciones `ge`/`le`.

**Evidencia:** `limit: int = Query(default=5, ge=1, le=20)` en `get_top_categories`; `threshold: float = Query(default=0.3, ge=0)` en `get_metrics_alerts` (`routes.py` líneas 288–290, 343–345).

**Impacto:** Entradas inválidas rechazadas con 422 antes de ejecutar lógica.

---

## Malas prácticas y riesgos identificados

### 1. Monolito en `routes.py` (Categoría: Arquitectura)

**Riesgo:** Modelos Pydantic, generación mock, lógica de negocio y handlers HTTP coexisten en un archivo de ~392 líneas.

**Evidencia:** `backend/app/routes.py` — desde imports (línea 1) hasta último endpoint B2C (línea 391).

**Consecuencia:** Dificulta navegación, revisiones de PR y evolución independiente de capas.

---

### 2. Regeneración de datos en cada request sin caché (Categoría: Performance)

**Riesgo:** Cada handler llama `generate_mock_movements(seed=42)`, reconstruyendo 360 movimientos por petición.

**Evidencia:** Líneas 255, 264, 277, 295, 311, 350, 370, 386 en `routes.py`.

**Consecuencia:** Desperdicio de CPU; patrón incorrecto si se sustituye mock por DB sin refactor.

---

### 3. CORS permisivo e inválido con credenciales (Categoría: Seguridad)

**Riesgo:** `allow_origins=["*"]` combinado con `allow_credentials=True`.

**Evidencia:**

```7:12:backend/app/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Consecuencia:** Configuración que los navegadores rechazan con credenciales; señal de configuración copy-paste sin revisión para producción.

---

### 4. Dockerfiles orientados solo a desarrollo (Categoría: DevOps)

**Riesgo:** No existe variante de producción; contenedores exponen herramientas de debug y hot reload.

**Evidencia:**

```12:12:backend/Dockerfile
CMD ["python", "-m", "debugpy", "--listen", "0.0.0.0:5678", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
```

```12:12:frontend/Dockerfile
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
```

**Consecuencia:** Despliegue accidental de entorno dev; puerto 5678 expuesto innecesariamente.

---

### 5. Dependencias backend sin versiones pinneadas (Categoría: Dependencias)

**Riesgo:** `requirements.txt` lista paquetes sin versión fija.

**Evidencia:**

```1:6:backend/requirements.txt
fastapi
uvicorn[standard]
debugpy
pytest
pytest-cov
httpx
```

**Consecuencia:** Builds no reproducibles; actualizaciones pueden romper el proyecto sin aviso.

---

### 6. Crash potencial con lista vacía en `build_metrics_facets` (Categoría: Robustez)

**Riesgo:** Acceso a `ordered[0]` y `ordered[-1]` sin comprobar longitud.

**Evidencia:**

```150:158:backend/app/routes.py
def build_metrics_facets(movements: list[FinancialMovement]) -> MetricsFacets:
    ordered = ensure_chronological_order(movements)
    return MetricsFacets(
        operation_types=sorted({item.operation_type for item in ordered}),
        business_types=sorted({item.business_type for item in ordered}),
        categories=sorted({item.category for item in ordered}),
        min_date=ordered[0].create_date,
        max_date=ordered[-1].create_date,
    )
```

**Consecuencia:** `IndexError` si filtros dejan cero movimientos.

---

### 7. Duplicación frontend/backend y endpoints redundantes (Categoría: Arquitectura / DRY)

**Riesgo:** El frontend re-agrega datos con `computeKPIs`/`computeMonthlyData` mientras el backend expone `/api/metrics/summary`. Endpoints `/b2b` y `/b2c` duplican filtro por `business_type`.

**Evidencia:**

- Frontend: `App.tsx:32-33` — agregación client-side.
- Backend summary: `routes.py:268` — `@router.get("/api/metrics/summary", ...)`.
- B2B/B2C: `routes.py:362-391` vs filtro `business_type` en summary (línea 275).

**Consecuencia:** Deriva de lógica entre capas; más código que mantener.

---

### 8. Errores silenciados y sin validación runtime de JSON (Categoría: Calidad / Resiliencia)

**Riesgo:** `.catch(() => {...})` descarta el error; `response.json()` no valida forma del payload.

**Evidencia:**

```35:38:frontend/src/App.tsx
      .catch(() => {
        setError(
          "No se pudo cargar la informacion financiera. Revisa la API de backend.",
        );
      })
```

**Consecuencia:** Depuración difícil; respuestas malformadas pueden romper gráficos sin mensaje claro.

---

### 9. Periodo UI hardcodeado (Categoría: Precisión de producto)

**Riesgo:** El header muestra siempre "2024 - Full Year" independiente de los datos.

**Evidencia:** `App.tsx:49` — `<DashboardHeader period="2024 - Full Year" />`.

**Consecuencia:** Información engañosa si el dataset o filtros cambian.

---

### 10. Código muerto y locale inconsistente (Categoría: Mantenibilidad)

**Riesgo:** `mock-data.ts` no importado; mensajes de error en español con UI en inglés; título HTML genérico.

**Evidencia:**

- `frontend/src/lib/mock-data.ts` — 0 referencias en el proyecto.
- `App.tsx:37` — mensaje en español; labels de KPI en inglés.
- `frontend/index.html:7` — `<title>frontend</title>`.

**Consecuencia:** Confusión sobre fuente de datos; experiencia i18n inconsistente.

---

### 11. Uso de `float` para montos financieros (Categoría: Dominio)

**Riesgo:** `amount: float` en modelo Pydantic y TypeScript.

**Evidencia:** `routes.py:24`, `financial-types.ts:7`.

**Consecuencia:** Errores de redondeo en agregaciones a gran escala (menor impacto en demo, relevante si evoluciona a producción).

---

### 12. Lógica frágil de "sin datos" en gráfico (Categoría: Frontend)

**Riesgo:** `hasData` trata `profitPercent === 0` como ausencia de datos.

**Evidencia:** `profit-percent-chart.tsx:65` — `data.some((d) => d.profitPercent !== 0)`.

**Consecuencia:** Meses con margen 0% legítimo pueden ocultar el gráfico.

---

## Reglas propuestas (borrador para Fase 3)

Las siguientes reglas se materializarán en `.agents/rules/` en la Fase 3.

| # | Regla propuesta | Mitiga / preserva | Archivo destino |
|---|-----------------|-------------------|-----------------|
| 1 | Separar backend en `models/`, `services/`, `routes/` | Riesgo #1 monolito | `backend-layering.md` |
| 2 | Mantener `response_model`, `Literal` y validación `Query` | Buena práctica #1, #8 | `api-contracts.md` |
| 3 | Endpoint nuevo = test integración; función pura = test unitario | Buena práctica #3, #4; gap de cobertura | `testing-standards.md` |
| 4 | Lógica en `lib/`; preferir endpoints backend existentes | Riesgo #7 duplicación | `frontend-data-flow.md` |
| 5 | No silenciar errores; consistencia de idioma UI | Riesgo #8, #10 | `error-handling-i18n.md` |
| 6 | Documentar Dockerfiles como dev-only; pin de dependencias | Riesgo #4, #5 | `docker-and-deps.md` |

### Criterios verificables por regla

1. **Backend layering:** Ningún archivo de rutas supera ~150 líneas; modelos no viven en `routes.py`.
2. **API contracts:** Todo endpoint nuevo aparece en `/docs` con schema; enums como `Literal`.
3. **Testing:** PR con endpoint nuevo incluye test en `test_routes.py`; utilidad nueva en `*.test.ts`.
4. **Frontend data flow:** Agregaciones nuevas evalúan primero `/api/metrics/summary` o `/facets`.
5. **Error handling:** Bloques `catch` registran o propagan el error; mensajes UI en un solo idioma acordado.
6. **Docker/deps:** `requirements.txt` con versiones; README indica que compose es para desarrollo.

---

## Matriz de categorías

| Categoría | Buenas | Malas / Riesgos |
|-----------|--------|-----------------|
| Arquitectura | #2 funciones puras | #1 monolito, #7 duplicación |
| API / Tipado | #1 response_model, #8 Query bounds | #11 float para montos |
| Testing | #3 integración backend, #4 Vitest frontend | Gaps en funciones puras backend |
| UX | #5 loading/error | #9 periodo hardcodeado, #12 hasData |
| DX | #6 proxy Vite | — |
| DevOps | — | #4 Docker dev-only |
| Seguridad | — | #3 CORS |
| Dependencias | — | #5 sin pin |
| Robustez | #7 seed fijo | #6 IndexError facets |
| Mantenibilidad | — | #10 código muerto, i18n |
| Performance | — | #2 regeneración por request |

---

## Conclusión

El proyecto es mantenible como demo educativa pero requiere gobernanza explícita antes de escalar features o acercarse a producción. Las reglas de la Fase 3 priorizan preservar tipado, testing y separación de lógica, mientras mitigan monolito, duplicación, configuración insegura y deuda operativa.
