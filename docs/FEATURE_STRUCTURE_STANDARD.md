# Estructura Estandar de Features

## Objetivo

Mantener una estructura consistente por dominio para facilitar mantenimiento, onboarding y refactor incremental.

## Estructura recomendada

```text
src/app/features/<feature>/
  pages/
    <page-a>/
      <page-a>.component.ts
      <page-a>.component.html
      <page-a>.component.scss
    <page-b>/
    layout/
  services/            # opcional, solo si hay servicios propios de la feature
  models/              # opcional, tipos locales de la feature
  components/          # opcional, componentes internos de la feature
```

## Reglas

- `pages/`: pantallas y vistas de navegacion de la feature.
- `services/`: logica de negocio local de la feature (sin alcance global).
- `models/`: tipos y contratos propios de la feature.
- `components/`: piezas de UI internas reutilizadas solo dentro de la feature.

## Regla de capas

- Si algo es transversal de negocio, mover a `core`.
- Si algo es UI reutilizable real en 2+ features, mover a `shared`.
- Evitar dependencias directas entre features.
