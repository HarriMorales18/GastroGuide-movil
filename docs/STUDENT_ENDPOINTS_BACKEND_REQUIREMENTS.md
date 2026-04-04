# Student Feature Backend Endpoints

Este documento define los endpoints necesarios para el funcionamiento correcto de las vistas en `features/student`.
Los bloques JSON de las vistas conectadas reflejan el mock exacto que usa hoy el frontend cuando `useMockApi` está activo o cuando el backend responde con error.
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
- Respuesta esperada (`StudentHomeData`, mock exacto del frontend):

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
          "thumbnailUrl": "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=800&q=80"
        },
        {
          "id": 102,
          "title": "Panaderia Casera Esencial",
          "category": "Panaderia",
          "durationMinutes": 84,
          "author": "Chef Mateo Rios",
          "rating": 4.7,
          "progressPercentage": 35,
          "thumbnailUrl": "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80"
        },
        {
          "id": 103,
          "title": "Postres para Emprender",
          "category": "Reposteria",
          "durationMinutes": 110,
          "author": "Chef Valentina Diaz",
          "rating": 4.9,
          "progressPercentage": 18,
          "thumbnailUrl": "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=800&q=80"
        }
      ]
    },
    {
      "key": "recommended",
      "title": "Recomendados para ti",
      "subtitle": "Basado en tus cursos recientes",
      "courses": [
        {
          "id": 201,
          "title": "Sushi para Principiantes",
          "category": "Cocina Japonesa",
          "durationMinutes": 78,
          "author": "Chef Kenji Mori",
          "rating": 4.6,
          "thumbnailUrl": "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=800&q=80"
        },
        {
          "id": 202,
          "title": "Tacos, Salsas y Guarniciones",
          "category": "Cocina Mexicana",
          "durationMinutes": 88,
          "author": "Chef Ana Lira",
          "rating": 4.8,
          "thumbnailUrl": "https://images.unsplash.com/photo-1565299585323-38174c4a6fdd?auto=format&fit=crop&w=800&q=80"
        },
        {
          "id": 203,
          "title": "Bases de Cocina Francesa",
          "category": "Alta Cocina",
          "durationMinutes": 120,
          "author": "Chef Pierre Legrand",
          "rating": 4.9,
          "thumbnailUrl": "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80"
        }
      ]
    },
    {
      "key": "popular",
      "title": "Populares",
      "subtitle": "Los favoritos de la comunidad",
      "courses": [
        {
          "id": 301,
          "title": "Hamburguesas Gourmet",
          "category": "Street Food",
          "durationMinutes": 72,
          "author": "Chef Diego Rivas",
          "rating": 4.7,
          "thumbnailUrl": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80"
        },
        {
          "id": 302,
          "title": "Coffee Lab en Casa",
          "category": "Bebidas",
          "durationMinutes": 64,
          "author": "Barista Sofia Melo",
          "rating": 4.8,
          "thumbnailUrl": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80"
        },
        {
          "id": 303,
          "title": "Ceviches y Tiraditos",
          "category": "Cocina Peruana",
          "durationMinutes": 80,
          "author": "Chef Marco Paredes",
          "rating": 4.9,
          "thumbnailUrl": "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&w=800&q=80"
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
- Respuesta esperada (`StudentCoursesData`, mock exacto del frontend):

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
      "thumbnailUrl": "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=900&q=80",
      "updatedAtLabel": "Actualizado hace 2 dias"
    },
    {
      "id": 2,
      "title": "Panaderia Artesanal en Casa",
      "category": "Panaderia",
      "instructor": "Chef Mateo Rios",
      "durationMinutes": 95,
      "progressPercentage": 38,
      "lessonsCompleted": 5,
      "lessonsTotal": 13,
      "status": "in-progress",
      "isFavorite": false,
      "thumbnailUrl": "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=900&q=80",
      "updatedAtLabel": "Actualizado hoy"
    },
    {
      "id": 3,
      "title": "Postres para Negocio",
      "category": "Reposteria",
      "instructor": "Chef Valentina Diaz",
      "durationMinutes": 88,
      "progressPercentage": 100,
      "lessonsCompleted": 12,
      "lessonsTotal": 12,
      "status": "completed",
      "isFavorite": true,
      "thumbnailUrl": "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80",
      "updatedAtLabel": "Completado hace 1 semana"
    },
    {
      "id": 4,
      "title": "Bases de Cocina Mexicana",
      "category": "Cocina internacional",
      "instructor": "Chef Ana Lira",
      "durationMinutes": 104,
      "progressPercentage": 15,
      "lessonsCompleted": 2,
      "lessonsTotal": 13,
      "status": "in-progress",
      "isFavorite": false,
      "thumbnailUrl": "https://images.unsplash.com/photo-1562967914-01efa7cd8216?auto=format&fit=crop&w=900&q=80",
      "updatedAtLabel": "Actualizado hace 4 dias"
    },
    {
      "id": 5,
      "title": "Gestion de Costos para Cocineros",
      "category": "Emprendimiento",
      "instructor": "Chef Diego Rivas",
      "durationMinutes": 75,
      "progressPercentage": 0,
      "lessonsCompleted": 0,
      "lessonsTotal": 10,
      "status": "pending",
      "isFavorite": false,
      "thumbnailUrl": "https://images.unsplash.com/photo-1556911220-bda9f7f7597e?auto=format&fit=crop&w=900&q=80",
      "updatedAtLabel": "Nuevo curso"
    },
    {
      "id": 6,
      "title": "Fotografia de Platos para Redes",
      "category": "Marketing",
      "instructor": "Chef Sofia Melo",
      "durationMinutes": 66,
      "progressPercentage": 100,
      "lessonsCompleted": 9,
      "lessonsTotal": 9,
      "status": "completed",
      "isFavorite": false,
      "thumbnailUrl": "https://images.unsplash.com/photo-1495195134817-aeb325a55b65?auto=format&fit=crop&w=900&q=80",
      "updatedAtLabel": "Completado hace 3 semanas"
    },
    {
      "id": 7,
      "title": "Fermentos y Conservas Modernas",
      "category": "Tecnicas",
      "instructor": "Chef Marco Paredes",
      "durationMinutes": 92,
      "progressPercentage": 47,
      "lessonsCompleted": 7,
      "lessonsTotal": 15,
      "status": "in-progress",
      "isFavorite": true,
      "thumbnailUrl": "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=900&q=80",
      "updatedAtLabel": "Actualizado ayer"
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
- Respuesta esperada (`StudentSearchData`, mock exacto del frontend):

```json
{
  "options": {
    "categories": [
      "Cocina internacional",
      "Panaderia",
      "Reposteria",
      "Tecnicas",
      "Marketing",
      "Emprendimiento",
      "Nutricion"
    ],
    "tags": [
      "rapido",
      "vegano",
      "sin gluten",
      "economico",
      "batch cooking",
      "chef tips",
      "principiantes"
    ]
  },
  "results": [
    {
      "id": 101,
      "title": "Tecnicas de cuchillo para velocidad y precision",
      "description": "Mejora cortes, tiempos y seguridad con practica guiada paso a paso.",
      "category": "Tecnicas",
      "level": "beginner",
      "contentType": "course",
      "instructor": "Chef Laura Rojas",
      "durationMinutes": 64,
      "rating": 4.8,
      "totalRatings": 1432,
      "isFree": true,
      "hasCertificate": true,
      "tags": ["rapido", "chef tips", "principiantes"],
      "thumbnailUrl": "https://images.unsplash.com/photo-1601315488950-3b5047998b38?auto=format&fit=crop&w=900&q=80",
      "updatedAtLabel": "Actualizado hace 3 dias"
    },
    {
      "id": 102,
      "title": "Batch cooking semanal para emprendedores",
      "description": "Planifica produccion y mise en place para vender mas en menos tiempo.",
      "category": "Emprendimiento",
      "level": "intermediate",
      "contentType": "masterclass",
      "instructor": "Chef Diego Rivas",
      "durationMinutes": 92,
      "rating": 4.7,
      "totalRatings": 910,
      "isFree": false,
      "hasCertificate": true,
      "tags": ["batch cooking", "economico"],
      "thumbnailUrl": "https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=900&q=80",
      "updatedAtLabel": "Actualizado hoy"
    },
    {
      "id": 103,
      "title": "Recetas veganas para menu diario",
      "description": "Platos balanceados y sabrosos con ingredientes faciles de conseguir.",
      "category": "Nutricion",
      "level": "beginner",
      "contentType": "recipe",
      "instructor": "Chef Sofia Melo",
      "durationMinutes": 38,
      "rating": 4.6,
      "totalRatings": 624,
      "isFree": true,
      "hasCertificate": false,
      "tags": ["vegano", "rapido", "economico"],
      "thumbnailUrl": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80",
      "updatedAtLabel": "Nuevo"
    },
    {
      "id": 104,
      "title": "Panes sin gluten con fermentacion controlada",
      "description": "Comprende harinas alternativas y manejo de humedad para mejores texturas.",
      "category": "Panaderia",
      "level": "advanced",
      "contentType": "course",
      "instructor": "Chef Mateo Rios",
      "durationMinutes": 118,
      "rating": 4.9,
      "totalRatings": 780,
      "isFree": false,
      "hasCertificate": true,
      "tags": ["sin gluten", "chef tips"],
      "thumbnailUrl": "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=900&q=80",
      "updatedAtLabel": "Actualizado hace 1 semana"
    },
    {
      "id": 105,
      "title": "Tips de emplatado para redes sociales",
      "description": "Eleva tu presentacion visual con trucos de composicion y luz.",
      "category": "Marketing",
      "level": "intermediate",
      "contentType": "tip",
      "instructor": "Chef Valentina Diaz",
      "durationMinutes": 27,
      "rating": 4.5,
      "totalRatings": 488,
      "isFree": true,
      "hasCertificate": false,
      "tags": ["chef tips", "rapido"],
      "thumbnailUrl": "https://images.unsplash.com/photo-1511690078903-71dc5a49f5e3?auto=format&fit=crop&w=900&q=80",
      "updatedAtLabel": "Actualizado ayer"
    },
    {
      "id": 106,
      "title": "Postres de vitrina rentables",
      "description": "Estandariza recetas y costos para aumentar margen por porcion.",
      "category": "Reposteria",
      "level": "advanced",
      "contentType": "masterclass",
      "instructor": "Chef Marco Paredes",
      "durationMinutes": 110,
      "rating": 4.8,
      "totalRatings": 1006,
      "isFree": false,
      "hasCertificate": true,
      "tags": ["economico", "chef tips"],
      "thumbnailUrl": "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80",
      "updatedAtLabel": "Actualizado hace 5 dias"
    }
  ]
}
```

## 5) Perfil (mi perfil + perfiles publicos)

### `GET /api/student/profile/hub`
- Vistas: `student/profile`, `student/layout` (iniciales del usuario).
- Estado: conectado por `StudentFacadeService -> ProfileService`.
- Respuesta esperada (`ProfileHubData`, mock exacto del frontend):

```json
{
  "me": {
    "id": 1,
    "role": "student",
    "displayName": "Juan Garcia",
    "username": "@juangarcia",
    "headline": "Aprendiendo cocina creativa y emprendimiento gastronomico",
    "bio": "Me encanta explorar tecnicas nuevas, optimizar tiempos de cocina y compartir resultados.",
    "avatarUrl": null,
    "specialties": ["meal prep", "panaderia", "cocina italiana"],
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
  "creators": [
    {
      "id": 201,
      "role": "creator",
      "displayName": "Chef Laura Rojas",
      "username": "@laurarojaschef",
      "headline": "Especialista en cocina italiana contemporanea",
      "bio": "Ayudo a estudiantes a dominar bases tecnicas y montaje profesional de platos.",
      "avatarUrl": null,
      "specialties": ["pastas", "salsas madre", "emplatado"],
      "stats": {
        "completedCourses": 38,
        "inProgressCourses": 2,
        "followers": 9850,
        "following": 126
      }
    },
    {
      "id": 202,
      "role": "creator",
      "displayName": "Chef Mateo Rios",
      "username": "@mateopan",
      "headline": "Panaderia artesanal y fermentaciones",
      "bio": "Comparto procesos claros para que puedas hornear con consistencia.",
      "avatarUrl": null,
      "specialties": ["masa madre", "brioche", "fermentacion"],
      "stats": {
        "completedCourses": 27,
        "inProgressCourses": 1,
        "followers": 7110,
        "following": 85
      }
    }
  ],
  "students": [
    {
      "id": 301,
      "role": "student",
      "displayName": "Valentina Diaz",
      "username": "@vale.diaz",
      "headline": "Estudiante de reposteria enfocada en negocio",
      "bio": "Aprendo para lanzar mi marca de postres personalizados.",
      "avatarUrl": null,
      "specialties": ["postres", "costeo", "fotografia food"],
      "stats": {
        "completedCourses": 9,
        "inProgressCourses": 3,
        "followers": 220,
        "following": 180
      }
    },
    {
      "id": 302,
      "role": "student",
      "displayName": "Andres Melo",
      "username": "@andrescook",
      "headline": "Aprendiendo cocina saludable para meal prep",
      "bio": "Busco mejorar mis habitos y cocinar mas rapido durante la semana.",
      "avatarUrl": null,
      "specialties": ["nutricion", "batch cooking", "vegano"],
      "stats": {
        "completedCourses": 6,
        "inProgressCourses": 4,
        "followers": 136,
        "following": 141
      }
    }
  ]
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

- Respuesta esperada (`MyProfile`):

```json
{
  "id": 1,
  "role": "student",
  "displayName": "Juan Garcia",
  "username": "@juangarcia",
  "headline": "Nuevo titular",
  "bio": "Nueva bio",
  "avatarUrl": null,
  "specialties": ["meal prep", "panaderia", "cocina italiana"],
  "stats": {
    "completedCourses": 4,
    "inProgressCourses": 5,
    "followers": 142,
    "following": 98
  },
  "email": "juan@example.com",
  "city": "Bogota",
  "joinedAtLabel": "Miembro desde febrero 2025"
}
```

## 6) Course Detail / Course (recomendado para backend real)

Estas vistas hoy funcionan con datos derivados de Home/Courses/Search via mapper en frontend.
Para produccion real se recomienda exponer un endpoint dedicado de detalle de curso.

### `GET /api/student/courses/{courseId}/detail`
- Vistas: `student/course-detail`, `student/course`.
- Estado: pendiente de conexion directa.
- Respuesta esperada (`StudentCourseDetail`, generada por mapper del frontend a partir de home/courses/search):

```json
{
  "id": 101,
  "title": "Pastas Artesanales desde Cero",
  "category": "Cocina Italiana",
  "instructor": "Chef Laura Rojas",
  "thumbnailUrl": "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=800&q=80",
  "description": "Curso destacado para mejorar tus tecnicas y resultados en cocina paso a paso.",
  "durationMinutes": 95,
  "rating": 4.8,
  "totalRatings": 901,
  "lessonsCompleted": 7,
  "lessonsTotal": 12,
  "progressPercentage": 62,
  "levelLabel": "Intermedio",
  "contentTypeLabel": "Curso",
  "priceLabel": "Incluido en tu plan",
  "priceCop": 0,
  "isPurchased": true,
  "hasCertificate": true,
  "updatedAtLabel": "Actualizado recientemente",
  "tags": ["chef tips", "practico", "destacado"],
  "whatYouWillLearn": [
    "Dominar tecnicas clave para ejecutar recetas de forma consistente.",
    "Organizar mise en place y tiempos para cocinar con confianza.",
    "Evitar errores frecuentes y mejorar sabor, textura y presentacion."
  ],
  "modules": [
    {
      "id": 1,
      "title": "Modulo 1",
      "description": "Bloque formativo con 3 lecciones enfocadas en progresion practica.",
      "durationMinutes": 30,
      "isCompleted": true,
      "lessons": [
        { "id": 1, "title": "Leccion 1", "durationMinutes": 6, "isCompleted": true, "videoUrl": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4", "summary": "Contenido practico para reforzar el modulo 1." },
        { "id": 2, "title": "Leccion 2", "durationMinutes": 9, "isCompleted": true, "videoUrl": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4", "summary": "Contenido practico para reforzar el modulo 1." },
        { "id": 3, "title": "Leccion 3", "durationMinutes": 12, "isCompleted": true, "videoUrl": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4", "summary": "Contenido practico para reforzar el modulo 1." }
      ]
    },
    {
      "id": 2,
      "title": "Modulo 2",
      "description": "Bloque formativo con 3 lecciones enfocadas en progresion practica.",
      "durationMinutes": 24,
      "isCompleted": true,
      "lessons": [
        { "id": 101, "title": "Leccion 4", "durationMinutes": 6, "isCompleted": true, "videoUrl": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4", "summary": "Contenido practico para reforzar el modulo 2." },
        { "id": 102, "title": "Leccion 5", "durationMinutes": 9, "isCompleted": true, "videoUrl": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4", "summary": "Contenido practico para reforzar el modulo 2." },
        { "id": 103, "title": "Leccion 6", "durationMinutes": 9, "isCompleted": true, "videoUrl": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4", "summary": "Contenido practico para reforzar el modulo 2." }
      ]
    },
    {
      "id": 3,
      "title": "Modulo 3",
      "description": "Bloque formativo con 3 lecciones enfocadas en progresion practica.",
      "durationMinutes": 24,
      "isCompleted": false,
      "lessons": [
        { "id": 201, "title": "Leccion 7", "durationMinutes": 6, "isCompleted": true, "videoUrl": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4", "summary": "Contenido practico para reforzar el modulo 3." },
        { "id": 202, "title": "Leccion 8", "durationMinutes": 9, "isCompleted": false, "videoUrl": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4", "summary": "Contenido practico para reforzar el modulo 3." },
        { "id": 203, "title": "Leccion 9", "durationMinutes": 9, "isCompleted": false, "videoUrl": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4", "summary": "Contenido practico para reforzar el modulo 3." }
      ]
    },
    {
      "id": 4,
      "title": "Modulo 4",
      "description": "Bloque formativo con 3 lecciones enfocadas en progresion practica.",
      "durationMinutes": 24,
      "isCompleted": false,
      "lessons": [
        { "id": 301, "title": "Leccion 10", "durationMinutes": 6, "isCompleted": false, "videoUrl": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4", "summary": "Contenido practico para reforzar el modulo 4." },
        { "id": 302, "title": "Leccion 11", "durationMinutes": 9, "isCompleted": false, "videoUrl": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4", "summary": "Contenido practico para reforzar el modulo 4." },
        { "id": 303, "title": "Leccion 12", "durationMinutes": 9, "isCompleted": false, "videoUrl": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4", "summary": "Contenido practico para reforzar el modulo 4." }
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
- Respuesta esperada (`PaymentTransactionRecord[]`, forma exacta del registro que persiste el frontend):

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
- Respuesta sugerida (`GET`):

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
- Respuesta sugerida (`GET`):

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

- Respuesta sugerida (`POST`):

```json
{
  "ticketId": "SUP-2026-001",
  "status": "open"
}
```

## Nota final

Con este contrato, `features/student` queda cubierto endpoint por endpoint. 
Los endpoints marcados como "pendiente" son los que faltan para que ninguna vista dependa de datos simulados locales.
