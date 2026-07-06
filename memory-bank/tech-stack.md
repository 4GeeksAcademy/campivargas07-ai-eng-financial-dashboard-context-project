# Tech Stack — Financial Metrics Dashboard

Inventario tecnológico basado en `package.json`, `requirements.txt`, Dockerfiles y `docker-compose.yml`.

---

## Vista general

| Capa | Tecnología principal | Versión / imagen |
|------|---------------------|------------------|
| Frontend runtime | React | ^19.2.4 |
| Frontend build | Vite | ^8.0.4 |
| Lenguaje frontend | TypeScript | ~6.0.2 |
| Backend runtime | Python | 3.13-slim (Docker) |
| Backend framework | FastAPI | sin pin en requirements |
| Servidor ASGI | Uvicorn | sin pin en requirements |
| Orquestación | Docker Compose | 2 servicios |

---

## Frontend

### Framework y build

| Paquete | Versión | Uso |
|---------|---------|-----|
| `react` / `react-dom` | ^19.2.4 | UI components |
| `vite` | ^8.0.4 | Dev server, bundler, proxy `/api` |
| `@vitejs/plugin-react` | ^6.0.1 | JSX/TSX transform |
| `typescript` | ~6.0.2 | Tipado estático |

### Estilos y UI

| Paquete | Versión | Uso |
|---------|---------|-----|
| `tailwindcss` | ^4.2.2 | Utility CSS |
| `@tailwindcss/vite` | ^4.2.2 | Plugin Vite para Tailwind 4 |
| `class-variance-authority` | ^0.7.1 | Variantes de componentes |
| `clsx` + `tailwind-merge` | ^2.1.1 / ^3.5.0 | Utilidad `cn()` en `lib/utils.ts` |
| shadcn/ui (manual) | — | `components/ui/card.tsx`, `skeleton.tsx` via `components.json` |
| `lucide-react` | ^1.8.0 | Iconos en KPI cards |

### Gráficos

| Paquete | Versión | Uso |
|---------|---------|-----|
| `recharts` | ^3.8.1 | Bar chart (income/outcome), line chart (profit %) |

### Calidad de código

| Herramienta | Versión | Config |
|-------------|---------|--------|
| ESLint | ^9.39.4 | `eslint.config.js` |
| Vitest | ^4.1.4 | `npm test`, tests en `lib/*.test.ts` |
| `@vitest/coverage-v8` | ^4.1.4 | `npm run test:coverage` |

### Entry points frontend

| Archivo | Rol |
|---------|-----|
| `index.html` | Shell HTML, carga `/src/main.tsx` |
| `src/main.tsx` | `createRoot`, `StrictMode` |
| `src/App.tsx` | Página principal |
| `vite.config.ts` | Alias `@/`, proxy API, host `0.0.0.0` |

### Conexión al backend

- **Desarrollo (Docker):** proxy Vite `"/api" → http://backend:8000`
- **Override:** `VITE_API_BASE_URL` en `.env` (ver `.env.example`)
- **Producción:** el proxy de Vite no aplica; requiere reverse proxy o URL absoluta en build time

---

## Backend

### Dependencias (`requirements.txt`)

| Paquete | Pinneado | Uso |
|---------|----------|-----|
| `fastapi` | No | Framework HTTP, Pydantic integration |
| `uvicorn[standard]` | No | Servidor ASGI |
| `debugpy` | No | Remote debugging puerto 5678 |
| `pytest` | No | Test runner |
| `pytest-cov` | No | Cobertura (sin config en repo) |
| `httpx` | No | Cliente HTTP (transitivo para TestClient) |

### Estructura de aplicación

| Archivo | Rol |
|---------|-----|
| `app/main.py` | FastAPI app, CORS middleware, router |
| `app/routes.py` | Modelos, mock data, lógica, 9 endpoints GET |
| `tests/conftest.py` | `sys.path` setup |
| `tests/test_routes.py` | 15 tests (unit + integration) |

### API

- Documentación interactiva: http://localhost:8000/docs (Swagger/OpenAPI autogenerado)
- Health check: `GET /health` → `{"status": "ok"}`

---

## Infraestructura y tooling

### Docker Compose

```yaml
services:
  frontend:  # node:24-alpine, puerto 5173, npm run dev
  backend:   # python:3.13-slim, puertos 8000 + 5678, uvicorn --reload
```

Volúmenes:

- Bind-mount de código fuente (`./frontend:/app`, `./backend:/app`)
- Volumen anónimo `/app/node_modules` en frontend

### Dockerfiles (modo desarrollo)

| Servicio | Imagen base | CMD |
|----------|-------------|-----|
| Frontend | `node:24-alpine` | `npm run dev -- --host 0.0.0.0 --port 5173` |
| Backend | `python:3.13-slim` | `debugpy` + `uvicorn --reload` |

**No hay** Dockerfile de producción ni multi-stage build en el repo actual.

### CI/CD

No detectado:

- Sin `.github/workflows/`
- Sin Jenkins, GitLab CI ni similar
- Tests no se ejecutan automáticamente en PR

### Git y agentes

| Artefacto | Ubicación |
|-----------|-----------|
| Reglas de gobernanza | `.agents/rules/*.md` |
| Memoria del proyecto | `memory-bank/*.md` |
| Instrucciones agentes | `AGENTS.md` |

---

## Comandos de referencia

```bash
# Arranque completo
docker compose up --build

# Tests backend (con entorno Python configurado)
pytest backend/tests/

# Tests frontend
cd frontend && npm test

# Build frontend (no usado en Docker actual)
cd frontend && npm run build

# Lint frontend
cd frontend && npm run lint
```

## Dependencias críticas para mantenimiento

1. **FastAPI + Pydantic** — contrato API y validación.
2. **Vite proxy** — conectividad frontend-backend en dev sin CORS.
3. **Recharts** — todos los gráficos del dashboard.
4. **Docker Compose** — flujo de arranque documentado en README.

## Deuda técnica de stack

- `requirements.txt` sin versiones pinneadas (ver regla `.agents/rules/docker-and-deps.md`).
- Dockerfiles solo para desarrollo.
- Sin pipeline CI para pytest/vitest/eslint.
