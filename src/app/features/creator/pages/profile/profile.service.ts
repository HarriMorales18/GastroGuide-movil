import { Injectable } from '@angular/core';
import { of, Observable } from 'rxjs';

export interface CreatorProfile {
  id: number;
  displayName: string;
  headline: string;
  bio: string;
  avatarUrl: string | null;
  specialties: string[];
  joinedAtLabel: string;
  stats: {
    publishedCourses: number;
    totalStudents: number;
    totalEarnings: number;
    averageRating: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  /**
   * Obtiene el perfil del creador actual
   */
  getCreatorProfile(): Observable<CreatorProfile> {
    // Mock data - En producción sería un HTTP call
    return of({
      id: 1,
      displayName: 'Juan García',
      headline: 'Chef especializado en técnicas culinarias modernas',
      bio: 'Creador de contenido gastronómico con 10 años de experiencia en cocina. Apasionado por enseñar técnicas avanzadas y compartir recetas innovadoras con la comunidad.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      specialties: ['Cocina Moderna', 'Repostería', 'Técnicas Avanzadas', 'Gastronomía Molecular'],
      joinedAtLabel: 'Miembro desde febrero 2023',
      stats: {
        publishedCourses: 12,
        totalStudents: 3450,
        totalEarnings: 15840.5,
        averageRating: 4.8
      }
    });
  }

  /**
   * Actualiza el perfil del creador
   */
  updateCreatorProfile(profile: Partial<CreatorProfile>): Observable<CreatorProfile> {
    // Mock update - En producción sería un HTTP call
    return this.getCreatorProfile();
  }
}
