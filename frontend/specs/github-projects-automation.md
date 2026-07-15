# GitHub Projects Automation Guide

Esta guía permite crear o usar un Project de GitHub y agregar los issues TASK-01 a TASK-15.

## Estado actual

- En este entorno, el token activo no tiene permisos sobre Projects del owner 4GeeksAcademy.
- Error observado: Resource not accessible by integration.

## Requisitos de permisos

Usa una sesión de gh con permisos suficientes para organización y Projects.

- Alcance recomendado para token clásico:
  - repo
  - read:org
  - project

Si usas fine-grained token:

- Repository permissions:
  - Issues: Read and write
- Organization permissions:
  - Projects: Read and write

## Opción A: crear un Project nuevo y agregar los 15 issues

Ejecuta estos comandos en terminal:

    REPO=4GeeksAcademy/ai-eng-financial-dashboard-context-project
    OWNER=4GeeksAcademy
    PROJECT_TITLE=Frontend Specs Delivery

    gh auth login
    gh auth status

    gh project create --owner "$OWNER" --title "$PROJECT_TITLE"
    gh project list --owner "$OWNER"

Identifica el numero del project creado y reemplaza PROJECT_NUMBER:

    PROJECT_NUMBER=REEMPLAZAR_NUMERO

Agregar issues #10..#24 al project:

    for i in $(seq 10 24); do
      gh project item-add "$PROJECT_NUMBER" --owner "$OWNER" --url "https://github.com/$REPO/issues/$i"
    done

## Opción B: usar un Project existente

Si ya tienes un project creado, solo necesitas su numero:

    REPO=4GeeksAcademy/ai-eng-financial-dashboard-context-project
    OWNER=4GeeksAcademy
    PROJECT_NUMBER=REEMPLAZAR_NUMERO

    for i in $(seq 10 24); do
      gh project item-add "$PROJECT_NUMBER" --owner "$OWNER" --url "https://github.com/$REPO/issues/$i"
    done

## Verificación

Comprobar que el project contiene items:

    gh project item-list "$PROJECT_NUMBER" --owner "$OWNER" --format json

## Sugerencia de organización dentro del Project

- Group by: Label o Milestone.
- Campos sugeridos:
  - Status: Todo, In Progress, In Review, Done.
  - Priority: P1, P2.
  - Milestone: A, B, C, D, E.

Mapeo recomendado de milestones por issue:

- A: 10, 11, 12
- B: 13, 14
- C: 15, 16, 17
- D: 18, 19, 20, 21, 22
- E: 23, 24
