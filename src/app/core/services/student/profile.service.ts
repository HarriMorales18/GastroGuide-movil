import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { MyProfile, ProfileHubData, UpdateMyProfileRequest } from '@student-models/profile.model';

@Injectable()
export class ProfileService {
  private readonly hubApiUrl = '/api/student/profile/hub';
  private readonly updateApiUrl = '/api/student/profile';

  constructor(private readonly http: HttpClient) {}

  getProfileHubData(): Observable<ProfileHubData> {
    return of(this.getMockHubData());
  }

  getProfileHubDataFromApi(): Observable<ProfileHubData> {
    return this.http.get<ProfileHubData>(this.hubApiUrl);
  }

  updateMyProfile(payload: UpdateMyProfileRequest): Observable<MyProfile> {
    const current = this.getMockHubData().me;

    return of({
      ...current,
      ...payload
    });
  }

  updateMyProfileFromApi(payload: UpdateMyProfileRequest): Observable<MyProfile> {
    return this.http.put<MyProfile>(this.updateApiUrl, payload);
  }

  private getMockHubData(): ProfileHubData {
    return {
      me: {
        id: 1,
        role: 'student',
        displayName: 'Juan Garcia',
        username: '@juangarcia',
        headline: 'Aprendiendo cocina creativa y emprendimiento gastrono mico',
        bio: 'Me encanta explorar tecnicas nuevas, optimizar tiempos de cocina y compartir resultados.',
        avatarUrl: null,
        specialties: ['meal prep', 'panaderia', 'cocina italiana'],
        stats: {
          completedCourses: 4,
          inProgressCourses: 5,
          followers: 142,
          following: 98
        },
        email: 'juan@example.com',
        city: 'Bogota',
        joinedAtLabel: 'Miembro desde febrero 2025'
      },
      creators: [
        {
          id: 201,
          role: 'creator',
          displayName: 'Chef Laura Rojas',
          username: '@laurarojaschef',
          headline: 'Especialista en cocina italiana contemporanea',
          bio: 'Ayudo a estudiantes a dominar bases tecnicas y montaje profesional de platos.',
          avatarUrl: null,
          specialties: ['pastas', 'salsas madre', 'emplatado'],
          stats: {
            completedCourses: 38,
            inProgressCourses: 2,
            followers: 9850,
            following: 126
          }
        },
        {
          id: 202,
          role: 'creator',
          displayName: 'Chef Mateo Rios',
          username: '@mateopan',
          headline: 'Panaderia artesanal y fermentaciones',
          bio: 'Comparto procesos claros para que puedas hornear con consistencia.',
          avatarUrl: null,
          specialties: ['masa madre', 'brioche', 'fermentacion'],
          stats: {
            completedCourses: 27,
            inProgressCourses: 1,
            followers: 7110,
            following: 85
          }
        }
      ],
      students: [
        {
          id: 301,
          role: 'student',
          displayName: 'Valentina Diaz',
          username: '@vale.diaz',
          headline: 'Estudiante de reposteria enfocada en negocio',
          bio: 'Aprendo para lanzar mi marca de postres personalizados.',
          avatarUrl: null,
          specialties: ['postres', 'costeo', 'fotografia food'],
          stats: {
            completedCourses: 9,
            inProgressCourses: 3,
            followers: 220,
            following: 180
          }
        },
        {
          id: 302,
          role: 'student',
          displayName: 'Andres Melo',
          username: '@andrescook',
          headline: 'Aprendiendo cocina saludable para meal prep',
          bio: 'Busco mejorar mis habitos y cocinar mas rapido durante la semana.',
          avatarUrl: null,
          specialties: ['nutricion', 'batch cooking', 'vegano'],
          stats: {
            completedCourses: 6,
            inProgressCourses: 4,
            followers: 136,
            following: 141
          }
        }
      ]
    };
  }
}
