# Student Feature Backend Endpoints

Este documento define los endpoints necesarios para el funcionamiento correcto de las vistas en `features/student`.
Incluye:
- endpoint
- metodo HTTP
- vistas que lo usan
- respuesta esperada
- estado de integracion (conectado o pendiente)

## 1) Endpoints transversales de sesion (aplican a todas las vistas student)

### `POST /api/auth/refresh`
- Uso: renovacion de token cuando el interceptor recibe 401.
- Vistas impactadas: todas las vistas `student/*`.
- Estado: conectado (`auth.interceptor.ts` + `AuthService`).
- Respuesta esperada:

```json
{
  "token": "jwt-string"
}
```

Tambien se acepta:

```json
{
  "accessToken": "jwt-string"
}
```

### `POST /api/auth/logout`
- Uso: cerrar sesion desde Configuracion student.
- Vistas impactadas: `student/config`.
- Estado: conectado (`ConfigComponent.logout`).
- Request esperado:

```json
{
  "refreshToken": "refresh-token"
}
```

- Respuesta esperada:

```json
{
  "success": true
}
```

## 2) Home

### `GET /api/student/home`
- Vistas: `student/home`.
- Estado: conectado por `StudentFacadeService -> HomeService`.
- Respuesta esperada (`StudentHomeData`):

```json
{
  "student": {
    "id": 1,
    "firstName": "Juan",
    "lastName": "Garcia",
    "activeCourses": 4
  },
  "sections": [
    {
      "key": "continueLearning",
      "title": "Seguir aprendiendo",
      "subtitle": "Retoma donde te quedaste",
      "courses": [
        {
          "id": 101,
          "title": "Pastas Artesanales desde Cero",
          "category": "Cocina Italiana",
          "durationMinutes": 95,
          "author": "Chef Laura Rojas",
          "rating": 4.8,
          "progressPercentage": 62,
          "thumbnailUrl": "https://..."
        }
      ]
    }
  ]
}
```

## 3) Cursos

### `GET /api/student/courses`
- Vistas: `student/courses`.
- Estado: conectado por `StudentFacadeService -> CoursesService`.
- Respuesta esperada (`StudentCoursesData`):

```json
{
  "studentName": "Juan",
  "summary": {
    "totalCourses": 7,
    "inProgress": 4,
    "completed": 2
  },
  "courses": [
    {
      "id": 1,
      "title": "Fundamentos de Cocina Italiana",
      "category": "Cocina internacional",
      "instructor": "Chef Laura Rojas",
      "durationMinutes": 120,
      "progressPercentage": 64,
      "lessonsCompleted": 9,
      "lessonsTotal": 14,
      "status": "in-progress",
      "isFavorite": true,
      "thumbnailUrl": "https://...",
      "updatedAtLabel": "Actualizado hace 2 dias"
    }
  ]
}
```

## 4) Buscar

### `GET /api/student/search`
- Vistas: `student/search`.
- Estado: conectado por `StudentFacadeService -> SearchService`.
- Query params esperados:
  - `query`
  - `maxDuration`
  - `ratingMin`
  - `priceType`
  - `certificateOnly`
  - `sortBy`
  - multiples `categories`
  - multiples `levels`
  - multiples `contentTypes`
  - multiples `tags`
- Respuesta esperada (`StudentSearchData`):

```json
{
  "options": {
    "categories": ["Cocina internacional", "Panaderia"],
    "tags": ["rapido", "vegano"]
  },
  "results": [
    {
      "id": 101,
      "title": "Tecnicas de cuchillo",
      "description": "...",
      "category": "Tecnicas",
      "level": "beginner",
      "contentType": "course",
      "instructor": "Chef Laura Rojas",
      "durationMinutes": 64,
      "rating": 4.8,
      "totalRatings": 1432,
      "isFree": true,
      "hasCertificate": true,
      "tags": ["rapido", "chef tips"],
      "thumbnailUrl": "https://...",
      "updatedAtLabel": "Actualizado hace 3 dias"
    }
  ]
}
```

## 5) Perfil (mi perfil + perfiles publicos)

### `GET /api/student/profile/hub`
- Vistas: `student/profile`, `student/layout` (iniciales del usuario).
- Estado: conectado por `StudentFacadeService -> ProfileService`.
- Respuesta esperada (`ProfileHubData`):

```json
{
  "me": {
    "id": 1,
    "role": "student",
    "displayName": "Juan Garcia",
    "username": "@juangarcia",
    "headline": "...",
    "bio": "...",
    "avatarUrl": null,
    "specialties": ["meal prep"],
    "stats": {
      "completedCourses": 4,
      "inProgressCourses": 5,
      "followers": 142,
      "following": 98
    },
    "email": "juan@example.com",
    "city": "Bogota",
    "joinedAtLabel": "Miembro desde febrero 2025"
  },
  "creators": [],
  "students": []
}
```

### `PUT /api/student/profile`
- Vistas: `student/profile` (editar perfil).
- Estado: conectado por `StudentFacadeService -> ProfileService`.
- Request esperado:

```json
{
  "displayName": "Juan Garcia",
  "headline": "Nuevo titular",
  "bio": "Nueva bio",
  "city": "Bogota"
}
```

- Respuesta esperada (`MyProfile`): mismo shape de `me` actualizado.

## 6) Course Detail / Course (recomendado para backend real)

Estas vistas hoy funcionan con datos derivados de Home/Courses/Search via mapper en frontend.
Para produccion real se recomienda exponer un endpoint dedicado de detalle de curso.

### `GET /api/student/courses/{courseId}/detail`
- Vistas: `student/course-detail`, `student/course`.
- Estado: pendiente de conexion directa.
- Respuesta esperada (`StudentCourseDetail`):

```json
{
  "id": 101,
  "title": "Pastas Artesanales",
  "category": "Cocina Italiana",
  "instructor": "Chef Laura Rojas",
  "thumbnailUrl": "https://...",
  "description": "...",
  "durationMinutes": 95,
  "rating": 4.8,
  "totalRatings": 1200,
  "lessonsCompleted": 2,
  "lessonsTotal": 10,
  "progressPercentage": 20,
  "levelLabel": "Intermedio",
  "contentTypeLabel": "Curso",
  "priceLabel": "Pago",
  "priceCop": 89000,
  "isPurchased": false,
  "hasCertificate": true,
  "updatedAtLabel": "Actualizado hoy",
  "tags": ["chef tips"],
  "whatYouWillLearn": ["..."],
  "modules": [
    {
      "id": 1,
      "title": "Modulo 1",
      "description": "...",
      "durationMinutes": 30,
      "isCompleted": false,
      "lessons": [
        {
          "id": 101,
          "title": "Leccion 1",
          "durationMinutes": 12,
          "isCompleted": false,
          "videoUrl": "https://...",
          "summary": "..."
        }
      ]
    }
  ]
}
```

## 7) Compra de curso + transacciones

### `POST /api/student/courses/purchase-intents`
- Vistas: `student/course-purchase`.
- Estado: endpoint ya preparado en service.
- Request (`PurchaseIntentRequest`):

```json
{
  "courseId": 101,
  "amountCop": 89000,
  "currency": "COP"
}
```

- Respuesta (`PurchaseIntentResponse`):

```json
{
  "transactionReference": "REF-123",
  "checkoutUrl": "https://...",
  "publicKey": "pk_test_...",
  "testMode": true
}
```

### `POST /api/student/courses/purchases/confirm`
- Vistas: `student/course-purchase`.
- Estado: endpoint ya preparado en service.
- Request (`PurchaseConfirmationRequest`):

```json
{
  "courseId": 101,
  "transactionReference": "REF-123",
  "providerTransactionId": "TX-EXT-456"
}
```

- Respuesta (`PurchaseConfirmationResponse`):

```json
{
  "success": true,
  "purchasedAt": "2026-04-02T21:00:00.000Z"
}
```

### `GET /api/student/payments/transactions`
- Vistas: `student/config/views/transactions-config-view`.
- Estado: conectado (`hydrateTransactionHistoryFromBackend`).
- Respuesta esperada (`PaymentTransactionRecord[]`):

```json
[
  {
    "id": "TX-101-171209",
    "courseId": 101,
    "courseTitle": "Pastas Artesanales",
    "amountCop": 89000,
    "status": "approved",
    "gateway": "simulated",
    "message": "Pago aprobado por el usuario.",
    "createdAt": "2026-04-02T21:00:00.000Z",
    "backendSynced": true
  }
]
```

### `POST /api/student/payments/transactions`
- Vistas: `student/course-purchase` (registro de intentos).
- Estado: conectado (sin bloqueo UI, best-effort).
- Request (`CreatePaymentTransactionRequest`):

```json
{
  "id": "TX-101-171209",
  "courseId": 101,
  "courseTitle": "Pastas Artesanales",
  "amountCop": 89000,
  "status": "approved",
  "gateway": "simulated",
  "message": "Pago aprobado por el usuario.",
  "createdAt": "2026-04-02T21:00:00.000Z"
}
```

- Respuesta (`CreatePaymentTransactionResponse`):

```json
{
  "id": "TX-101-171209",
  "syncedAt": "2026-04-02T21:00:00.500Z"
}
```

## 8) Configuracion de cuenta / preferencias / soporte (pendiente de backend)

Estas vistas hoy son mayormente locales. Para cerrar backend de `student/config`, se recomienda:

### `POST /api/student/account/change-password`
- Vistas: `student/config/views/account-config-view`.
- Request sugerido:

```json
{
  "currentPassword": "actual",
  "newPassword": "nueva-segura"
}
```

- Respuesta esperada:

```json
{
  "success": true,
  "message": "Password updated"
}
```

### `GET /api/student/preferences`
### `PUT /api/student/preferences`
- Vistas: `student/config/views/preferences-config-view`.
- Response sugerido (`GET`):

```json
{
  "language": "es",
  "theme": "light",
  "notifications": [
    { "id": "course-updates", "enabled": true }
  ]
}
```

- Request sugerido (`PUT`): mismo shape.

### `GET /api/student/support/faqs`
### `POST /api/student/support/tickets`
- Vistas: `student/config/views/support-config-view`.
- Response sugerido (`GET`):

```json
[
  {
    "id": "faq-1",
    "question": "...",
    "answer": "..."
  }
]
```

- Request sugerido (`POST`):

```json
{
  "subject": "Problema con compra",
  "message": "No puedo completar el pago"
}
```

- Response sugerido (`POST`):

```json
{
  "ticketId": "SUP-2026-001",
  "status": "open"
}
```

## Nota final

Con este contrato, `features/student` queda cubierto endpoint por endpoint. 
Los endpoints marcados como "pendiente" son los que faltan para que ninguna vista dependa de datos simulados locales.
