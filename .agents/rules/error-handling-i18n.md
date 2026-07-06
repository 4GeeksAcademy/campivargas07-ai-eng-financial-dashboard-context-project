# Manejo de errores e internacionalización

## Alcance

Cualquier capa: `frontend/src/`, `backend/app/`, mensajes al usuario y logging.

## Razón

`App.tsx` silencia errores en `.catch(() => {...})` sin registrar la causa. Los mensajes de error están en español mientras labels de KPI y gráficos están en inglés. `index.html` usa título genérico `frontend`. Esto dificulta depuración y genera UX inconsistente.

## Cómo aplicar en este repositorio

### Manejo de errores (frontend)

1. **No usar `catch` vacío** ni descartar el objeto error.
2. **Registrar en consola en desarrollo:** `console.error("fetchFinancialData failed", error)`.
3. **Mensaje al usuario:** genérico y accionable, en el idioma acordado del proyecto.
4. **Cleanup en useEffect:** usar `AbortController` si el fetch puede completar tras desmontar el componente.

Patrón actual a corregir:

```35:38:frontend/src/App.tsx
      .catch(() => {
        setError(
          "No se pudo cargar la informacion financiera. Revisa la API de backend.",
        );
      })
```

Patrón deseado:

```typescript
.catch((error: unknown) => {
  console.error("Failed to load financial data", error);
  setError("Could not load financial data. Check that the backend API is running.");
})
```

### Manejo de errores (backend)

1. Dejar que FastAPI devuelva 422 para validación (ya ocurre con `Query` bounds).
2. Guardas explícitas para listas vacías antes de indexar (ver `build_metrics_facets`).
3. No capturar excepciones genéricas en handlers sin re-raise o HTTPException.

Riesgo actual:

```156:157:backend/app/routes.py
        min_date=ordered[0].create_date,
        max_date=ordered[-1].create_date,
```

Debe comprobarse `if not ordered` antes de acceder a índices.

### Internacionalización

**Idioma por defecto del proyecto: inglés** para UI visible (labels, títulos, mensajes de error). El README bilingüe es documentación, no UI.

| Elemento | Idioma | Ejemplo |
|----------|--------|---------|
| Labels KPI | EN | "Total Income", "Profit Margin" |
| Mensajes de error | EN | "Could not load financial data." |
| `index.html` title | EN | "Financial Metrics Dashboard" |
| Documentación de gobernanza | ES | `docs/`, `memory-bank/` (este repo) |

Si se requiere español en UI, migrar **todos** los strings visibles en un PR dedicado, no mezclar.

## Criterio de verificación

- [ ] Ningún `.catch(() =>` sin parámetro de error en código nuevo.
- [ ] Mensajes de error UI están en un solo idioma (inglés por defecto).
- [ ] `index.html` title describe el producto.
- [ ] Funciones que indexan listas validan `len > 0`.

### Escenario de validación

**Tarea:** El backend devuelve 500 por timeout.

**Decisión guiada por la regla:** `catch` registra status y error; usuario ve mensaje EN genérico; no se expone stack trace en UI.
