# Guia Operativa del Proyecto

Objetivo: mantener orden arquitectonico y consistencia de implementacion en nuevas funcionalidades.

## 1. Fuente de verdad

Cuando exista duda de ubicacion o imports, seguir este orden:
1. `docs/PROJECT_OPERATIONS_GUIDE.md` (esta guia)
2. `docs/ARCHITECTURE_GUIDELINES.md`
3. `docs/FEATURE_STRUCTURE_STANDARD.md`
4. `docs/PHASE_VALIDATION_CHECKLIST.md`
5. `docs/VALIDATION_STATUS.md`

## 2. Reglas de capas

- `core`: logica transversal (servicios globales, modelos compartidos globales).
- `shared`: UI reutilizable real y agnostica de dominio.
- `features`: logica por dominio (auth, student, creator, admin, payments).

Dependencias permitidas:
- `features` -> `core`, `shared`
- `shared` -> sin depender de `core/features`
- `core` -> sin depender de `shared/features`

No permitido:
- import cruzado entre features.

## 3. Estructura estandar para nuevas features

Base:

```text
src/app/features/<feature>/
  pages/
  models/        (opcional)
  services/      (opcional)
  components/    (opcional)
```

Criterio de ubicacion:
- Pagina navegable -> `pages/`
- Componente interno reutilizado dentro de la misma feature -> `components/`
- Servicio local de feature -> `services/` (sin alcance global)
- Tipos locales -> `models/`

## 4. Convenciones de nombres

- Archivos en kebab-case.
- Sufijos:
  - `*.component.ts|html|scss`
  - `*.service.ts`
  - `*.model.ts` / `*.interface.ts`
  - `*.guard.ts`, `*.interceptor.ts`, `*.resolver.ts`

## 5. Convenciones de imports

Aliases disponibles:
- `@app/*`
- `@core/*`
- `@shared/*`
- `@features/*`
- `@student-models/*`
- `@student-config-models/*`

Reglas practicas:
- Preferir aliases frente a rutas relativas profundas.
- Mantener `src/app/core/services/auth.service` para `AuthService` por compatibilidad del entorno de analisis/DI.
- Evitar barrels masivos (`index.ts`) que oculten ciclos.

## 6. Politica de servicios

- Servicios transversales en `core` con alcance global.
- Servicios de feature con alcance local (provider en layout/page de la feature cuando aplique).
- No dejar servicios de negocio de feature en alcance global por defecto.

## 7. Politica de Shared

Un recurso entra a `shared` solo si:
- Se usa en 2 o mas features.
- No depende de modelos/servicios de un dominio especifico.
- Tiene API desacoplada (`@Input`/`@Output` genericos).

Si no se cumple:
- mover a feature, o
- eliminar si es placeholder/huerfano.

## 8. Flujo operativo para una nueva implementacion

1. Definir alcance: pagina, componente, servicio y modelos.
2. Crear carpetas segun estandar de feature.
3. Implementar con aliases y reglas de capa.
4. Ejecutar validacion por fase:
   - `npm run check:architecture`
   - `npm run build`
   - `npm run lint`
   - `npm run test -- --watch=false --browsers=ChromeHeadless`
5. Verificacion funcional minima del flujo impactado.
6. Registrar evidencia en PR/bitacora.

## 9. Definition of Done (DoD)

Una implementacion queda cerrada cuando:
- cumple estructura y reglas de capas,
- no introduce dependencias prohibidas,
- no deja archivos huerfanos ni duplicados activos,
- pasa validaciones tecnicas (o documenta bloqueo real),
- incluye actualizacion de docs si cambia convencion/estructura.

## 10. Comandos de referencia

- Validacion arquitectura: `npm run check:architecture`
- Validacion fase (sin test): `npm run check:phase`
- Validacion fase completa: `npm run check:phase:full`
