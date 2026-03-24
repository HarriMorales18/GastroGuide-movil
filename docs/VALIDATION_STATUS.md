# Estado de Validacion (Refactor Arquitectura)

Fecha: 2026-03-24

## 1) Resultado tecnico (automatizado)

Comandos ejecutados:
- `npm run check:architecture`: PASS
- `npm run build`: FAIL
- `npm run lint`: FAIL
- `npm run test -- --watch=false --browsers=ChromeHeadless`: FAIL (entorno)

Detalle de fallos:

### Build (FAIL)
Causa principal:
- Presupuestos de estilos (SCSS) excedidos en componentes, por ejemplo:
  - `student/pages/profile/profile.component.scss`
  - `student/pages/search/search.component.scss`
  - `student/pages/config/views/support-config-view.component.scss`
  - `student/pages/config/views/account-config-view.component.scss`

### Lint (FAIL)
Causas principales:
- Regla `@angular-eslint/prefer-inject` en multiples clases (constructor injection).
- Regla `@angular-eslint/no-empty-lifecycle-method` en componentes placeholder.

### Test (FAIL)
Causa de entorno:
- No se encontro Chrome en `C:\Program Files\Google\Chrome\Application\chrome.exe`.
- Requiere definir `CHROME_BIN` o instalar Chrome/Chromium.

## 2) Verificacion funcional minima (manual)

Estado: Pendiente de ejecucion manual en app levantada.

Checklist sugerido:
- Login/logout por rol.
- Navegacion principal (`student`, `creator`, `admin`).
- Configuracion de student (tabs account/preferences/help).
- Perfil de student (carga y guardado).
- Apertura/cierre de detalle de curso desde home/courses/search.

## 3) Checklist global de arquitectura y consistencia

- [x] Barrera de dependencias activa (`check:architecture`).
- [x] Estructura de features estandarizada con `pages/`.
- [x] Modelos normalizados por dominio (`student/models`).
- [x] Shared reducido a reutilizable real.
- [x] Duplicados y archivos huérfanos principales eliminados.
- [ ] Build verde (pendiente por budgets SCSS).
- [ ] Lint verde (pendiente por reglas `prefer-inject` y lifecycle vacio).
- [ ] Tests verdes en CI/local (pendiente por `CHROME_BIN`).

## 4) Acciones recomendadas para cierre total

1. Ajustar budgets de estilos en Angular o reducir SCSS por componente.
2. Ejecutar migracion `inject()` en componentes/servicios (`ng generate @angular/core:inject`).
3. Eliminar lifecycle hooks vacios restantes.
4. Configurar ChromeHeadless (o Playwright) para pruebas automatizadas.
