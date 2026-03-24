# Reglas de Arquitectura Objetivo

Documento corto para mantener una estructura consistente en la app Ionic/Angular.

## 1) Capas y responsabilidades

### Core (`src/app/core`)
Usar para piezas transversales y singleton:
- Servicios globales de negocio/integracion (`auth`, `user`, `course`, `payment`, etc.).
- Guardias, interceptores, resolvers, inicializadores de app.
- Modelos/interfaces compartidos entre varias features (si no son exclusivos de una).
- Constantes globales y utilidades de infraestructura.

No debe contener componentes de UI de pagina.

### Shared (`src/app/shared`)
Usar para piezas reutilizables de presentacion:
- Componentes UI reutilizables reales (por ejemplo, controles de formulario).
- Pipes y directivas genericas.
- Helpers de UI sin logica de dominio fuerte.
- Modelos de UI (view models) no acoplados a una sola feature.

No debe contener servicios de negocio globales ni logica especifica de una sola pantalla.

Regla operativa:
- Si un componente de `shared` no tiene consumo real o es placeholder, eliminarlo.
- Si esta acoplado a una sola feature, moverlo a `features/<dominio>`.

### Features (`src/app/features/*`)
Usar para logica funcional por dominio (auth, student, creator, admin, payments):
- Paginas/vistas y componentes especificos del flujo.
- Estado local de la feature.
- Modelos/interfaces exclusivas de la feature.
- Servicios locales solo si son privados de la feature.

Si una pieza deja de ser especifica y se reutiliza en 2+ features, promoverla a `shared` (UI) o `core` (servicio/modelo transversal).

## 2) Reglas de dependencia

Direccion permitida:
- `features` -> `shared`, `core`
- `shared` -> (sin depender de `features`; evitar depender de `core` salvo casos justificados)
- `core` -> (sin depender de `features` ni `shared` de UI)

Prohibido:
- Importar desde una feature a otra feature directamente.
- Importar desde `features` dentro de `core`.

## 3) Convenciones de nombres

- Archivos: kebab-case.
- Sufijos:
  - `*.component.ts|html|scss`
  - `*.service.ts`
  - `*.model.ts` / `*.interface.ts`
  - `*.guard.ts`, `*.interceptor.ts`, `*.resolver.ts`
- Un tipo principal por archivo para facilitar busqueda y mantenimiento.

## 4) Convenciones de imports

Regla general:
- Evitar imports relativos profundos (`../../../../`) cuando sea posible.
- Favorecer imports consistentes por capa.

Aliases activos en TypeScript:
- `@app/*` -> `src/app/*`
- `@core/*` -> `src/app/core/*`
- `@shared/*` -> `src/app/shared/*`
- `@features/*` -> `src/app/features/*`
- `@student-models/*` -> `src/app/features/student/models/*`
- `@student-config-models/*` -> `src/app/features/student/pages/config/models/*`

Convencion de uso:
- Preferir aliases para rutas de feature y modelos compartidos de dominio.
- Mantener `src/app/core/services/auth.service` para `AuthService` por compatibilidad del entorno actual de analisis/DI.
- No usar barrels (`index.ts`) masivos que oculten dependencias ciclicas.

## 5) Criterio rapido para ubicar una pieza

Preguntas de decision:
1. Se usa en toda la app o cruza modulos -> `core`.
2. Es UI reutilizable y agnostica de dominio -> `shared`.
3. Es parte de un flujo/pantalla de un dominio especifico -> `features/<dominio>`.

## 6) Criterio de aceptacion para cambios de estructura

Antes de cerrar un refactor por bloques:
- Compila sin errores.
- No hay imports rotos.
- No se introducen dependencias en direccion prohibida.
- La ubicacion final de cada archivo cumple las reglas anteriores.

Validacion automatizada:
- Ejecutar `npm run check:architecture`.
- El chequeo falla si:
  - `core` importa desde `shared` o `features`.
  - `shared` importa desde `core` o `features`.
  - Una `feature` importa otra `feature` distinta.
