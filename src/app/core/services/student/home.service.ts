import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { StudentHomeData } from '@student-models/home.model';
import { BackendApiService } from '@core/services/backend-api.service';
import { environment } from 'src/environments/environment';

@Injectable()
export class HomeService {
  private readonly apiUrl = '/api/student/home';

  constructor(private readonly backendApi: BackendApiService) {}

  getHomeData(): Observable<StudentHomeData> {
    if (environment.useMockApi) {
      return of(this.getMockHomeData());
    }

    return this.getHomeDataFromApi().pipe(
      catchError(() => of(this.getMockHomeData()))
    );
  }

  getHomeDataFromApi(): Observable<StudentHomeData> {
    return this.backendApi.get<StudentHomeData>(this.apiUrl);
  }

  private getMockHomeData(): StudentHomeData {
    return {
      student: {
        id: 1,
        firstName: 'Juan',
        lastName: 'Garcia',
        activeCourses: 4
      },
      sections: [
        {
          key: 'continueLearning',
          title: 'Seguir aprendiendo',
          subtitle: 'Retoma donde te quedaste',
          courses: [
            {
              id: 101,
              title: 'Pastas Artesanales desde Cero',
              category: 'Cocina Italiana',
              durationMinutes: 95,
              author: 'Chef Laura Rojas',
              rating: 4.8,
              progressPercentage: 62,
              thumbnailUrl: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=800&q=80'
            },
            {
              id: 102,
              title: 'Panaderia Casera Esencial',
              category: 'Panaderia',
              durationMinutes: 84,
              author: 'Chef Mateo Rios',
              rating: 4.7,
              progressPercentage: 35,
              thumbnailUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80'
            },
            {
              id: 103,
              title: 'Postres para Emprender',
              category: 'Reposteria',
              durationMinutes: 110,
              author: 'Chef Valentina Diaz',
              rating: 4.9,
              progressPercentage: 18,
              thumbnailUrl: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=800&q=80'
            }
          ]
        },
        {
          key: 'recommended',
          title: 'Recomendados para ti',
          subtitle: 'Basado en tus cursos recientes',
          courses: [
            {
              id: 201,
              title: 'Sushi para Principiantes',
              category: 'Cocina Japonesa',
              durationMinutes: 78,
              author: 'Chef Kenji Mori',
              rating: 4.6,
              thumbnailUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=800&q=80'
            },
            {
              id: 202,
              title: 'Tacos, Salsas y Guarniciones',
              category: 'Cocina Mexicana',
              durationMinutes: 88,
              author: 'Chef Ana Lira',
              rating: 4.8,
              thumbnailUrl: 'https://images.unsplash.com/photo-1565299585323-38174c4a6fdd?auto=format&fit=crop&w=800&q=80'
            },
            {
              id: 203,
              title: 'Bases de Cocina Francesa',
              category: 'Alta Cocina',
              durationMinutes: 120,
              author: 'Chef Pierre Legrand',
              rating: 4.9,
              thumbnailUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80'
            }
          ]
        },
        {
          key: 'popular',
          title: 'Populares',
          subtitle: 'Los favoritos de la comunidad',
          courses: [
            {
              id: 301,
              title: 'Hamburguesas Gourmet',
              category: 'Street Food',
              durationMinutes: 72,
              author: 'Chef Diego Rivas',
              rating: 4.7,
              thumbnailUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80'
            },
            {
              id: 302,
              title: 'Coffee Lab en Casa',
              category: 'Bebidas',
              durationMinutes: 64,
              author: 'Barista Sofia Melo',
              rating: 4.8,
              thumbnailUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80'
            },
            {
              id: 303,
              title: 'Ceviches y Tiraditos',
              category: 'Cocina Peruana',
              durationMinutes: 80,
              author: 'Chef Marco Paredes',
              rating: 4.9,
              thumbnailUrl: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&w=800&q=80'
            }
          ]
        }
      ]
    };
  }

}
