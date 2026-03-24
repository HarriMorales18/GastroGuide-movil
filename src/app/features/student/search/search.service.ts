import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { SearchFilters, StudentSearchData } from '../models/search.model';

@Injectable()
export class SearchService {
  private readonly apiUrl = '/api/student/search';

  constructor(private readonly http: HttpClient) {}

  getSearchData(): Observable<StudentSearchData> {
    return of(this.getMockSearchData());
  }

  searchFromApi(filters: SearchFilters): Observable<StudentSearchData> {
    let params = new HttpParams()
      .set('query', filters.query)
      .set('maxDuration', String(filters.maxDuration))
      .set('ratingMin', String(filters.ratingMin))
      .set('priceType', filters.priceType)
      .set('certificateOnly', String(filters.certificateOnly))
      .set('sortBy', filters.sortBy);

    filters.categories.forEach((value) => {
      params = params.append('categories', value);
    });

    filters.levels.forEach((value) => {
      params = params.append('levels', value);
    });

    filters.contentTypes.forEach((value) => {
      params = params.append('contentTypes', value);
    });

    filters.tags.forEach((value) => {
      params = params.append('tags', value);
    });

    return this.http.get<StudentSearchData>(this.apiUrl, { params });
  }

  private getMockSearchData(): StudentSearchData {
    return {
      options: {
        categories: [
          'Cocina internacional',
          'Panaderia',
          'Reposteria',
          'Tecnicas',
          'Marketing',
          'Emprendimiento',
          'Nutricion'
        ],
        tags: [
          'rapido',
          'vegano',
          'sin gluten',
          'economico',
          'batch cooking',
          'chef tips',
          'principiantes'
        ]
      },
      results: [
        {
          id: 101,
          title: 'Tecnicas de cuchillo para velocidad y precision',
          description: 'Mejora cortes, tiempos y seguridad con practica guiada paso a paso.',
          category: 'Tecnicas',
          level: 'beginner',
          contentType: 'course',
          instructor: 'Chef Laura Rojas',
          durationMinutes: 64,
          rating: 4.8,
          totalRatings: 1432,
          isFree: true,
          hasCertificate: true,
          tags: ['rapido', 'chef tips', 'principiantes'],
          thumbnailUrl: 'https://images.unsplash.com/photo-1601315488950-3b5047998b38?auto=format&fit=crop&w=900&q=80',
          updatedAtLabel: 'Actualizado hace 3 dias'
        },
        {
          id: 102,
          title: 'Batch cooking semanal para emprendedores',
          description: 'Planifica produccion y mise en place para vender mas en menos tiempo.',
          category: 'Emprendimiento',
          level: 'intermediate',
          contentType: 'masterclass',
          instructor: 'Chef Diego Rivas',
          durationMinutes: 92,
          rating: 4.7,
          totalRatings: 910,
          isFree: false,
          hasCertificate: true,
          tags: ['batch cooking', 'economico'],
          thumbnailUrl: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=900&q=80',
          updatedAtLabel: 'Actualizado hoy'
        },
        {
          id: 103,
          title: 'Recetas veganas para menu diario',
          description: 'Platos balanceados y sabrosos con ingredientes faciles de conseguir.',
          category: 'Nutricion',
          level: 'beginner',
          contentType: 'recipe',
          instructor: 'Chef Sofia Melo',
          durationMinutes: 38,
          rating: 4.6,
          totalRatings: 624,
          isFree: true,
          hasCertificate: false,
          tags: ['vegano', 'rapido', 'economico'],
          thumbnailUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80',
          updatedAtLabel: 'Nuevo'
        },
        {
          id: 104,
          title: 'Panes sin gluten con fermentacion controlada',
          description: 'Comprende harinas alternativas y manejo de humedad para mejores texturas.',
          category: 'Panaderia',
          level: 'advanced',
          contentType: 'course',
          instructor: 'Chef Mateo Rios',
          durationMinutes: 118,
          rating: 4.9,
          totalRatings: 780,
          isFree: false,
          hasCertificate: true,
          tags: ['sin gluten', 'chef tips'],
          thumbnailUrl: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=900&q=80',
          updatedAtLabel: 'Actualizado hace 1 semana'
        },
        {
          id: 105,
          title: 'Tips de emplatado para redes sociales',
          description: 'Eleva tu presentacion visual con trucos de composicion y luz.',
          category: 'Marketing',
          level: 'intermediate',
          contentType: 'tip',
          instructor: 'Chef Valentina Diaz',
          durationMinutes: 27,
          rating: 4.5,
          totalRatings: 488,
          isFree: true,
          hasCertificate: false,
          tags: ['chef tips', 'rapido'],
          thumbnailUrl: 'https://images.unsplash.com/photo-1511690078903-71dc5a49f5e3?auto=format&fit=crop&w=900&q=80',
          updatedAtLabel: 'Actualizado ayer'
        },
        {
          id: 106,
          title: 'Postres de vitrina rentables',
          description: 'Estandariza recetas y costos para aumentar margen por porcion.',
          category: 'Reposteria',
          level: 'advanced',
          contentType: 'masterclass',
          instructor: 'Chef Marco Paredes',
          durationMinutes: 110,
          rating: 4.8,
          totalRatings: 1006,
          isFree: false,
          hasCertificate: true,
          tags: ['economico', 'chef tips'],
          thumbnailUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80',
          updatedAtLabel: 'Actualizado hace 5 dias'
        }
      ]
    };
  }
}
