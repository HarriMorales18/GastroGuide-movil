# Inventario y Clasificacion del Codigo Actual

Fecha: 2026-03-24

## 1. Resumen por tipo

- Componentes: 41
- Servicios: 9
- Modelos: 6
- Interfaces: 0 archivos dedicados
- Guards: 0
- Pipes: 0
- Directives: 0
- Utils/Helpers: 0 archivos dedicados

## 2. Inventario por capa

### Core

- Models:
  - src/app/core/models/user.model.ts
- Services:
  - src/app/core/services/auth.service.ts
  - src/app/core/services/course.service.ts
  - src/app/core/services/payment.service.ts
  - src/app/core/services/user.service.ts

Clasificacion:
- auth.service.ts: bien ubicado (servicio transversal).
- user.model.ts: bien ubicado (modelo transversal).
- course.service.ts, payment.service.ts, user.service.ts: bien ubicados por capa, pero actualmente son placeholders (sin logica ni consumidores).

### Shared

- Components:
  - src/app/shared/components/course-card/course-card.component.ts
  - src/app/shared/components/navbar/navbar.component.ts
  - src/app/shared/components/tabs/tabs.component.ts
  - src/app/shared/components/video-player/video-player.component.ts
  - src/app/shared/components/form-components/button/button.component.ts
  - src/app/shared/components/form-components/input/input.component.ts
  - src/app/shared/components/form-components/select/select.component.ts
  - src/app/shared/components/form-components/datetime-button/datetime-button.component.ts

Clasificacion:
- Ubicacion correcta como libreria visual reutilizable.
- Hallazgo: no hay uso activo de sus selectores fuera de su propia carpeta; quedan como compartidos potenciales, pero no integrados hoy.

### Features

- auth:
  - login.component.ts, register.component.ts, forgot-password.component.ts, verify-account.component.ts
- admin:
  - layout.component.ts, dashboard.component.ts, users.component.ts, create-user.component.ts
- creator:
  - layout.component.ts, create-course.component.ts, modules.component.ts, statistics.component.ts, profile.component.ts
- payments:
  - checkout.component.ts
- student:
  - layout.component.ts
  - home/courses/search/course-detail/profile/config con sus componentes, servicios y modelos locales.

Clasificacion:
- Estructura por dominio correcta en terminos generales.
- Student esta bien cohesionada por feature (imports relativos internos).

## 3. Dependencias y cruces

### Dependencias entre capas detectadas

- features -> core: presente y esperada para AuthService.
  - Referencias activas a src/app/core/services/auth.service.ts desde:
    - src/app/features/auth/login/login.component.ts
    - src/app/features/auth/register/register.component.ts
    - src/app/features/student/profile/profile.component.ts
    - src/app/features/student/config/config.component.ts
    - src/app/features/admin/layout/layout.component.ts
    - src/app/features/creator/layout/layout.component.ts

### Dependencias cruzadas entre features

- No se detectaron imports directos entre features distintas.
- Los imports de student/layout hacia student/* son internos de la misma feature y son aceptables.

### Violaciones de direccion de dependencias

- No se detectaron imports core -> features.
- No se detectaron imports shared -> features.

## 4. Elementos mal ubicados o con riesgo arquitectonico

1) Duplicidad en Student Config (alto impacto en mantenimiento)
- Conviven dos juegos de componentes con contenido muy similar:
  - src/app/features/student/config/account-settings/account-settings.component.ts
  - src/app/features/student/config/preferences/preferences.component.ts
  - src/app/features/student/config/help/help.component.ts
  - y ademas:
  - src/app/features/student/config/views/account-config-view.component.ts
  - src/app/features/student/config/views/preferences-config-view.component.ts
  - src/app/features/student/config/views/support-config-view.component.ts

Clasificacion:
- No es un problema de capa, pero si de arquitectura interna por duplicidad funcional.
- Recomendacion: consolidar en un solo set (preferible views/*, porque es el que usa config.component.ts).

2) Shared sin consumo real (riesgo medio)
- Los componentes de shared/components no muestran uso actual en features.

Clasificacion:
- Potencialmente bien ubicados, pero hoy se comportan como codigo huérfano.
- Recomendacion: integrar o limpiar en una fase de higiene.

3) Servicios placeholder en Core (riesgo bajo)
- src/app/core/services/course.service.ts
- src/app/core/services/payment.service.ts
- src/app/core/services/user.service.ts

Clasificacion:
- Ubicacion correcta, madurez funcional baja.
- Recomendacion: mantener si hay roadmap cercano; si no, remover temporalmente.

4) Rutas de funcionalidades no enlazadas (riesgo medio)
- app.routes.ts expone login/register y layouts por rol.
- Componentes auth/admin/creator adicionales pueden quedar fuera del flujo principal.

Clasificacion:
- No necesariamente mal ubicados, pero hay riesgo de codigo no ejecutado.

## 5. Conclusiones para la siguiente fase

- La separacion base core/shared/features ya existe y va en buena direccion.
- El principal problema actual no es de capas, sino de inventario activo vs huerfano/duplicado.
- Prioridad recomendada para el siguiente bloque:
  1. Consolidar duplicados en student/config.
  2. Decidir integracion o retiro de shared/components no usados.
  3. Confirmar si los servicios placeholder de core quedan en backlog o se eliminan.

## 6. Estado tras higiene (aplicado)

- Se eliminaron duplicados de `student/config` no usados (`account-settings`, `preferences`, `help`) y se mantuvo el set activo en `views/`.
- Se eliminaron subpaginas placeholder sin uso en `student/pages/profile` (`course-player`, `edit-profile`, `my-courses`, `progress`, `settings`).
- Se validaron referencias e imports sin errores en archivos afectados.
