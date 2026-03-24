# Validacion por Fase y Checklist de Cierre

## 1) Validacion obligatoria por fase

Ejecutar en este orden tras cada bloque de cambios:

1. `npm run check:architecture`
2. `npm run build`
3. `npm run lint`
4. `npm run test -- --watch=false --browsers=ChromeHeadless`

Atajo recomendado:
- Sin tests: `npm run check:phase`
- Completo: `npm run check:phase:full`

## 2) Criterios de aceptacion por fase

Una fase se considera cerrada solo si:
- `check:architecture` pasa sin violaciones.
- `build` termina sin errores.
- `lint` no reporta errores bloqueantes.
- `test` pasa (o queda documentado por que no pudo ejecutarse en entorno local).
- Se realiza verificacion funcional minima manual del flujo impactado.

## 3) Verificacion funcional minima (manual)

Checklist rapido para cambios de arquitectura/refactor:
- Login y logout funcionales por flujo principal.
- Navegacion principal por roles (`student`, `creator`, `admin`).
- Vista de configuracion de student abre tabs y vuelve correctamente.
- Perfil de student carga datos y permite actualizar.
- Curso detalle abre/cierra desde home/courses/search.

## 4) Registro de evidencia por fase

Registrar en PR o bitacora:
- Fecha/hora de validacion.
- Commit o rango de cambios.
- Resultado de comandos (`architecture`, `build`, `lint`, `test`).
- Evidencia funcional minima (que se probo y resultado).
- Riesgos abiertos si aplica.

## 5) Checklist global de cierre (fin de iniciativa)

Arquitectura:
- `core` no depende de `shared` ni `features`.
- `shared` no depende de `core` ni `features`.
- No hay imports cruzados entre features.
- Los aliases definidos en TSConfig estan en uso y consistentes.

Estructura:
- Features alineadas con estructura `pages/` (+ `models/services/components` cuando aplique).
- Shared contiene solo reutilizable real.
- No hay duplicados funcionales activos.
- No hay archivos huérfanos conocidos.

Calidad:
- `check:phase:full` pasa en rama final.
- Sin errores de compilacion en archivos principales.
- Documentacion de arquitectura y estructura actualizada.

## 6) Plantilla rapida de cierre de fase

```text
Fase: <numero/nombre>
Fecha: <yyyy-mm-dd hh:mm>
Cambios principales: <resumen breve>

Comandos:
- check:architecture: PASS/FAIL
- build: PASS/FAIL
- lint: PASS/FAIL
- test: PASS/FAIL | N/A (motivo)

Verificacion funcional minima:
- <flujo 1>: PASS/FAIL
- <flujo 2>: PASS/FAIL

Riesgos pendientes:
- <si/no>
```
