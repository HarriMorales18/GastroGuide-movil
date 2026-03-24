# Shared Layer

La carpeta `shared` contiene solo piezas reutilizables reales y agnosticas de dominio.

## Regla de inclusion

Un recurso entra a `shared` solo si:
- Se usa en 2 o mas features.
- No depende de modelos/servicios de un dominio especifico.
- Tiene API de entrada/salida desacoplada (`@Input`/`@Output` genericos).

## Estructura actual

- `components/form-components/`
  - `button`
  - `input`
  - `select`
  - `datetime-button`

## Regla de salida

Si un componente queda acoplado a una pantalla/flujo o deja de reutilizarse:
- volver a `features/<dominio>/...`, o
- eliminarse si es placeholder o codigo no usado.
