# Payment Transactions Backend Contract

## Objetivo
Registrar y consultar historial de transacciones de pago (simuladas o reales) para cursos del estudiante.

## Endpoints

### 1. Crear transaccion
- Metodo: POST
- Ruta: `/api/student/payments/transactions`
- Request body:
```json
{
  "id": "TX-102-1775149999999",
  "courseId": 102,
  "courseTitle": "Batch cooking semanal para emprendedores",
  "amountCop": 89000,
  "status": "approved",
  "gateway": "simulated",
  "message": "Pago simulado aprobado por el usuario.",
  "createdAt": "2026-04-02T18:55:00.000Z"
}
```
- Response body:
```json
{
  "id": "TX-102-1775149999999",
  "syncedAt": "2026-04-02T18:55:01.000Z"
}
```

### 2. Listar transacciones
- Metodo: GET
- Ruta: `/api/student/payments/transactions`
- Response body:
```json
[
  {
    "id": "TX-102-1775149999999",
    "courseId": 102,
    "courseTitle": "Batch cooking semanal para emprendedores",
    "amountCop": 89000,
    "status": "approved",
    "gateway": "simulated",
    "message": "Pago simulado aprobado por el usuario.",
    "createdAt": "2026-04-02T18:55:00.000Z",
    "backendSynced": true
  }
]
```

## Reglas
- `status` permitido: `approved`, `rejected`, `canceled`.
- `id` debe ser unico por transaccion.
- Guardar transacciones ordenadas por `createdAt` descendente.
- Este contrato es compatible con flujo actual simulado y con pasarela real futura.
