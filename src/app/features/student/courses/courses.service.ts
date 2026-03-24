import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { StudentCoursesData } from '../models/courses.model';

@Injectable({
  providedIn: 'root'
})
export class CoursesService {
  private readonly apiUrl = '/api/student/courses';

  constructor(private readonly http: HttpClient) {}

  getStudentCourses(): Observable<StudentCoursesData> {
    return of(this.getMockCoursesData());
  }

  getStudentCoursesFromApi(): Observable<StudentCoursesData> {
    return this.http.get<StudentCoursesData>(this.apiUrl);
  }

  private getMockCoursesData(): StudentCoursesData {
    return {
      studentName: 'Juan',
      summary: {
        totalCourses: 7,
        inProgress: 4,
        completed: 2
      },
      courses: [
        {
          id: 1,
          title: 'Fundamentos de Cocina Italiana',
          category: 'Cocina internacional',
          instructor: 'Chef Laura Rojas',
          durationMinutes: 120,
          progressPercentage: 64,
          lessonsCompleted: 9,
          lessonsTotal: 14,
          status: 'in-progress',
          isFavorite: true,
          thumbnailUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=900&q=80',
          updatedAtLabel: 'Actualizado hace 2 dias'
        },
        {
          id: 2,
          title: 'Panaderia Artesanal en Casa',
          category: 'Panaderia',
          instructor: 'Chef Mateo Rios',
          durationMinutes: 95,
          progressPercentage: 38,
          lessonsCompleted: 5,
          lessonsTotal: 13,
          status: 'in-progress',
          isFavorite: false,
          thumbnailUrl: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=900&q=80',
          updatedAtLabel: 'Actualizado hoy'
        },
        {
          id: 3,
          title: 'Postres para Negocio',
          category: 'Reposteria',
          instructor: 'Chef Valentina Diaz',
          durationMinutes: 88,
          progressPercentage: 100,
          lessonsCompleted: 12,
          lessonsTotal: 12,
          status: 'completed',
          isFavorite: true,
          thumbnailUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80',
          updatedAtLabel: 'Completado hace 1 semana'
        },
        {
          id: 4,
          title: 'Bases de Cocina Mexicana',
          category: 'Cocina internacional',
          instructor: 'Chef Ana Lira',
          durationMinutes: 104,
          progressPercentage: 15,
          lessonsCompleted: 2,
          lessonsTotal: 13,
          status: 'in-progress',
          isFavorite: false,
          thumbnailUrl: 'https://images.unsplash.com/photo-1562967914-01efa7cd8216?auto=format&fit=crop&w=900&q=80',
          updatedAtLabel: 'Actualizado hace 4 dias'
        },
        {
          id: 5,
          title: 'Gestion de Costos para Cocineros',
          category: 'Emprendimiento',
          instructor: 'Chef Diego Rivas',
          durationMinutes: 75,
          progressPercentage: 0,
          lessonsCompleted: 0,
          lessonsTotal: 10,
          status: 'pending',
          isFavorite: false,
          thumbnailUrl: 'https://images.unsplash.com/photo-1556911220-bda9f7f7597e?auto=format&fit=crop&w=900&q=80',
          updatedAtLabel: 'Nuevo curso'
        },
        {
          id: 6,
          title: 'Fotografia de Platos para Redes',
          category: 'Marketing',
          instructor: 'Chef Sofia Melo',
          durationMinutes: 66,
          progressPercentage: 100,
          lessonsCompleted: 9,
          lessonsTotal: 9,
          status: 'completed',
          isFavorite: false,
          thumbnailUrl: 'https://images.unsplash.com/photo-1495195134817-aeb325a55b65?auto=format&fit=crop&w=900&q=80',
          updatedAtLabel: 'Completado hace 3 semanas'
        },
        {
          id: 7,
          title: 'Fermentos y Conservas Modernas',
          category: 'Tecnicas',
          instructor: 'Chef Marco Paredes',
          durationMinutes: 92,
          progressPercentage: 47,
          lessonsCompleted: 7,
          lessonsTotal: 15,
          status: 'in-progress',
          isFavorite: true,
          thumbnailUrl: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=900&q=80',
          updatedAtLabel: 'Actualizado ayer'
        }
      ]
    };
  }
}
