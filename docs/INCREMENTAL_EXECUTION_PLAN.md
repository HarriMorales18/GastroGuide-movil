# Plan Incremental de Ejecucion

Objetivo: ejecutar cambios en bloques pequenos, acotados y verificables, evitando refactors masivos en una sola tanda.

## 1) Reglas del plan

- Tamano de bloque recomendado: 1 objetivo tecnico principal.
- Limite sugerido: 5-12 archivos por bloque (excepto movimientos mecanicos controlados).
- Cada bloque debe incluir:
  - alcance claro,
  - criterio de aceptacion,
  - validacion automatizada,
  - verificacion funcional minima.
- No abrir un bloque nuevo con el bloque anterior en FAIL.

## 2) Secuencia propuesta (actualizada)

### Bloque A - Estabilizacion de pipeline
Objetivo:
- Dejar verde build/lint/test para evitar arrastrar deuda a nuevos bloques.

Alcance:
- Ajustar budgets de SCSS.
- Reducir errores de lint (prefer-inject, lifecycle vacio).
- Configurar entorno de tests (CHROME_BIN o runner alterno).

Cierre del bloque:
- check:architecture PASS
- build PASS
- lint PASS
- test PASS o N/A documentado por entorno

### Bloque B - Consolidacion final de Config Student
Objetivo:
- Confirmar que solo existe el set activo en views.

Alcance:
- Revisar templates/imports y evitar reintroduccion de duplicados.

Cierre del bloque:
- Sin referencias a componentes eliminados.
- Flujo de tabs de config validado manualmente.

### Bloque C - Limpieza de placeholders en features no student
Objetivo:
- Eliminar o completar componentes vacios heredados en auth/admin/creator/payments.

Alcance:
- Componentes con ngOnInit vacio y sin logica real.

Cierre del bloque:
- No-empty-lifecycle-method sin pendientes en alcance del bloque.

### Bloque D - Normalizacion de inyeccion en Angular
Objetivo:
- Alinear con regla prefer-inject.

Alcance:
- Migrar gradualmente por feature usando inject().

Cierre del bloque:
- Errores de prefer-inject reducidos a 0 en alcance del bloque.

### Bloque E - Cierre global de calidad
Objetivo:
- Consolidar rama con validaciones globales verdes.

Alcance:
- Ejecutar checklist completo y evidencia final.

Cierre del bloque:
- check:phase:full PASS.
- Checklist global de docs actualizado.

## 3) Procedimiento por bloque

1. Definir alcance del bloque.
2. Ejecutar cambios acotados.
3. Validar:
   - npm run check:architecture
   - npm run build
   - npm run lint
   - npm run test -- --watch=false --browsers=ChromeHeadless
4. Probar flujo funcional minimo del alcance.
5. Registrar evidencia en docs/VALIDATION_STATUS.md.
6. Marcar bloque como PASS/FAIL y riesgos abiertos.

## 4) Plantilla de bloque

```text
Bloque: <A/B/C/...>
Objetivo:
Alcance (archivos/modulos):
Riesgo:

Resultado:
- architecture: PASS/FAIL
- build: PASS/FAIL
- lint: PASS/FAIL
- test: PASS/FAIL | N/A

Funcional minimo:
- <flujo 1>: PASS/FAIL
- <flujo 2>: PASS/FAIL

Pendientes para siguiente bloque:
```

## 5) Criterios anti-refactor masivo

Detener y dividir en sub-bloques si ocurre alguno:
- Cambios en demasiadas capas a la vez (core + shared + varias features).
- Ajustes estructurales y de logica funcional en el mismo bloque.
- Build o lint rojo sin causa clara.
- Dificultad para describir impacto en menos de 5 lineas.
