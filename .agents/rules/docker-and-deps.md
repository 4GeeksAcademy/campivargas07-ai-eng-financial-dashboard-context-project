# Docker, dependencias y entornos

## Alcance

`docker-compose.yml`, `backend/Dockerfile`, `frontend/Dockerfile`, `backend/requirements.txt`, `frontend/package.json` y documentación de arranque.

## Razón

Los Dockerfiles actuales ejecutan entorno de desarrollo (debugpy, uvicorn `--reload`, `npm run dev`). `requirements.txt` no pinnea versiones. Tratar estos artefactos como producción causaría despliegues inseguros y builds no reproducibles.

## Cómo aplicar en este repositorio

### Docker Compose = desarrollo local

`docker compose up --build` es el flujo documentado en README para Codespaces y local. No implica readiness para producción.

Servicios actuales:

| Servicio | Puerto | Modo |
|----------|--------|------|
| frontend | 5173 | Vite dev server |
| backend | 8000 | Uvicorn con reload |
| backend debug | 5678 | debugpy |

### Volumen `node_modules` en frontend

```8:10:docker-compose.yml
    volumes:
      - ./frontend:/app
      - /app/node_modules
```

No eliminar el volumen anónimo: evita conflictos entre dependencias del host y del contenedor. Si hay errores de permisos, instalar dependencias dentro del contenedor:

```bash
docker compose exec frontend npm install
```

### Pin de dependencias

**Backend:** fijar versiones en `requirements.txt`:

```text
# Ejemplo de formato esperado
fastapi==0.115.0
uvicorn[standard]==0.32.0
```

**Frontend:** `package-lock.json` debe commitearse; no borrar. Cambios en `package.json` requieren `npm install` y commit del lockfile.

Estado actual sin pin (a corregir en PR de deps):

```1:6:backend/requirements.txt
fastapi
uvicorn[standard]
debugpy
pytest
pytest-cov
httpx
```

### Separación dev / prod (futuro)

Si se necesita despliegue:

- `Dockerfile` o `Dockerfile.prod` con multi-stage build.
- Frontend: `npm run build` + servidor estático (`nginx` o `vite preview`).
- Backend: uvicorn sin `--reload` ni debugpy.
- Documentar en `memory-bank/current-state.md`.

No modificar los Dockerfiles dev existentes sin crear variante prod paralela.

### CORS y proxy

En desarrollo con Docker, el frontend usa proxy Vite (`vite.config.ts`) — CORS del backend es secundario. Si se despliega frontend y backend en orígenes distintos, configurar `allow_origins` con lista explícita, nunca `["*"]` con `allow_credentials=True` (`main.py:7-12`).

## Criterio de verificación

- [ ] README indica que compose es para desarrollo.
- [ ] Nuevas dependencias backend incluyen versión pinneada.
- [ ] `package-lock.json` actualizado tras cambios en `package.json`.
- [ ] No se expone debugpy (5678) en configuración de producción.

### Escenario de validación

**Tarea:** Agregar librería `pandas` al backend.

**Decisión guiada por la regla:** Añadir `pandas==<versión>` a `requirements.txt`; reconstruir imagen con `docker compose build backend`; documentar uso en `memory-bank/tech-stack.md` si es dependencia crítica.
