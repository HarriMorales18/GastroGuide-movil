import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, delay } from 'rxjs/operators';
import {
  AdminApprovalQueueData,
  AdminCourseDetailData,
  AdminDeleteQueueData,
  AdminLayoutConfigData,
  AdminModerationReportsData,
  AdminPendingCoursesData,
  AdminPublishedCoursesData,
  AdminUserActivityData,
  AdminUserProfileData,
  AdminUserRolesData,
  AdminUserSanctionsData,
  AdminSystemBackupsData,
  AdminSystemErrorsData,
  AdminSystemMonitoringData,
  AdminUsersListData
} from '@core/models/admin/admin-views.model';
import { BackendApiService } from '@core/services/backend-api.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminDataService {
  private readonly usersApiPath = '/api/admin/users';
  private readonly usersSearchApiPath = '/api/admin/users/search';
  private readonly userProfileApiPath = '/api/admin/users';
  private readonly userActivityApiPath = '/api/admin/users/activity';
  private readonly userSanctionsApiPath = '/api/admin/users/sanctions';
  private readonly userRolesApiPath = '/api/admin/users/roles';
  private readonly coursesApiPath = '/api/admin/courses/published';
  private readonly coursesSearchApiPath = '/api/admin/courses/search';
  private readonly moderationReportsApiPath = '/api/admin/moderation/reports';
  private readonly pendingCoursesApiPath = '/api/admin/courses/pending';
  private readonly approvalQueueApiPath = '/api/admin/courses/approval-queue';
  private readonly deleteQueueApiPath = '/api/admin/courses/deletion-queue';
  private readonly systemMonitoringApiPath = '/api/admin/system/monitoring';
  private readonly systemErrorsApiPath = '/api/admin/system/errors';
  private readonly systemBackupsApiPath = '/api/admin/system/backups';
  private readonly layoutConfigApiPath = '/api/admin/config/layout';

  constructor(private readonly backendApi: BackendApiService) {}

  getUsersList(): Observable<AdminUsersListData> {
    if (environment.useMockApi) {
      return of(this.getMockUsers()).pipe(delay(180));
    }

    return this.backendApi.get<AdminUsersListData>(this.usersApiPath).pipe(
      catchError((error) => throwError(() => error))
    );
  }

  getUsersSearch(query: string): Observable<AdminUsersListData> {
    if (environment.useMockApi) {
      const normalizedQuery = query.trim().toLowerCase();
      const source = this.getMockUsers();

      if (!normalizedQuery) {
        return of(source).pipe(delay(180));
      }

      const filtered = source.users.filter((user) => {
        return user.fullName.toLowerCase().includes(normalizedQuery)
          || user.email.toLowerCase().includes(normalizedQuery);
      });

      return of({
        totalUsers: filtered.length,
        users: filtered
      }).pipe(delay(180));
    }

    return this.backendApi.get<AdminUsersListData>(this.usersSearchApiPath, {
      params: { q: query }
    }).pipe(catchError((error) => throwError(() => error)));
  }

  getUserProfile(userId: number): Observable<AdminUserProfileData> {
    if (environment.useMockApi) {
      const profile = this.getMockUserProfiles().find((item) => item.id === userId);

      if (!profile) {
        return throwError(() => new Error('Usuario no encontrado en mock.'));
      }

      return of(profile).pipe(delay(180));
    }

    return this.backendApi.get<AdminUserProfileData>(`${this.userProfileApiPath}/${userId}`).pipe(
      catchError((error) => throwError(() => error))
    );
  }

  getUserActivity(): Observable<AdminUserActivityData> {
    if (environment.useMockApi) {
      return of(this.getMockUserActivity()).pipe(delay(180));
    }

    return this.backendApi.get<AdminUserActivityData>(this.userActivityApiPath).pipe(
      catchError((error) => throwError(() => error))
    );
  }

  getUserSanctions(): Observable<AdminUserSanctionsData> {
    if (environment.useMockApi) {
      return of(this.getMockUserSanctions()).pipe(delay(180));
    }

    return this.backendApi.get<AdminUserSanctionsData>(this.userSanctionsApiPath).pipe(
      catchError((error) => throwError(() => error))
    );
  }

  getUserRoles(): Observable<AdminUserRolesData> {
    if (environment.useMockApi) {
      return of(this.getMockUserRoles()).pipe(delay(180));
    }

    return this.backendApi.get<AdminUserRolesData>(this.userRolesApiPath).pipe(
      catchError((error) => throwError(() => error))
    );
  }

  getPublishedCourses(): Observable<AdminPublishedCoursesData> {
    if (environment.useMockApi) {
      return of(this.getMockPublishedCourses()).pipe(delay(180));
    }

    return this.backendApi.get<AdminPublishedCoursesData>(this.coursesApiPath).pipe(
      catchError((error) => throwError(() => error))
    );
  }

  getCoursesSearch(query: string): Observable<AdminPublishedCoursesData> {
    if (environment.useMockApi) {
      const normalizedQuery = query.trim().toLowerCase();
      const source = this.getMockPublishedCourses();

      if (!normalizedQuery) {
        return of(source).pipe(delay(180));
      }

      const filtered = source.courses.filter((course) => {
        return course.title.toLowerCase().includes(normalizedQuery)
          || course.creatorName.toLowerCase().includes(normalizedQuery)
          || course.category.toLowerCase().includes(normalizedQuery);
      });

      return of({
        totalCourses: filtered.length,
        courses: filtered
      }).pipe(delay(180));
    }

    return this.backendApi.get<AdminPublishedCoursesData>(this.coursesSearchApiPath, {
      params: { q: query }
    }).pipe(catchError((error) => throwError(() => error)));
  }

  getCourseDetail(courseId: number): Observable<AdminCourseDetailData> {
    if (environment.useMockApi) {
      const detail = this.getMockCourseDetails().find((item) => item.id === courseId);

      if (!detail) {
        return throwError(() => new Error('Curso no encontrado en mock.'));
      }

      return of(detail).pipe(delay(180));
    }

    return this.backendApi.get<AdminCourseDetailData>(`/api/admin/courses/${courseId}`).pipe(
      catchError((error) => throwError(() => error))
    );
  }

  getModerationReports(): Observable<AdminModerationReportsData> {
    if (environment.useMockApi) {
      return of(this.getMockModerationReports()).pipe(delay(180));
    }

    return this.backendApi.get<AdminModerationReportsData>(this.moderationReportsApiPath).pipe(
      catchError((error) => throwError(() => error))
    );
  }

  getPendingCourses(): Observable<AdminPendingCoursesData> {
    if (environment.useMockApi) {
      return of(this.getMockPendingCourses()).pipe(delay(180));
    }

    return this.backendApi.get<AdminPendingCoursesData>(this.pendingCoursesApiPath).pipe(
      catchError((error) => throwError(() => error))
    );
  }

  getApprovalQueue(): Observable<AdminApprovalQueueData> {
    if (environment.useMockApi) {
      return of(this.getMockApprovalQueue()).pipe(delay(180));
    }

    return this.backendApi.get<AdminApprovalQueueData>(this.approvalQueueApiPath).pipe(
      catchError((error) => throwError(() => error))
    );
  }

  getDeleteQueue(): Observable<AdminDeleteQueueData> {
    if (environment.useMockApi) {
      return of(this.getMockDeleteQueue()).pipe(delay(180));
    }

    return this.backendApi.get<AdminDeleteQueueData>(this.deleteQueueApiPath).pipe(
      catchError((error) => throwError(() => error))
    );
  }

  getSystemMonitoring(): Observable<AdminSystemMonitoringData> {
    if (environment.useMockApi) {
      return of(this.getMockSystemMonitoring()).pipe(delay(180));
    }

    return this.backendApi.get<AdminSystemMonitoringData>(this.systemMonitoringApiPath).pipe(
      catchError((error) => throwError(() => error))
    );
  }

  getSystemErrors(): Observable<AdminSystemErrorsData> {
    if (environment.useMockApi) {
      return of(this.getMockSystemErrors()).pipe(delay(180));
    }

    return this.backendApi.get<AdminSystemErrorsData>(this.systemErrorsApiPath).pipe(
      catchError((error) => throwError(() => error))
    );
  }

  getSystemBackups(): Observable<AdminSystemBackupsData> {
    if (environment.useMockApi) {
      return of(this.getMockSystemBackups()).pipe(delay(180));
    }

    return this.backendApi.get<AdminSystemBackupsData>(this.systemBackupsApiPath).pipe(
      catchError((error) => throwError(() => error))
    );
  }

  getLayoutConfig(): Observable<AdminLayoutConfigData> {
    if (environment.useMockApi) {
      return of(this.getMockLayoutConfig()).pipe(delay(180));
    }

    return this.backendApi.get<AdminLayoutConfigData>(this.layoutConfigApiPath).pipe(
      catchError((error) => throwError(() => error))
    );
  }

  private getMockUsers(): AdminUsersListData {
    return {
      totalUsers: 8,
      users: [
        {
          id: 101,
          fullName: 'Ana Ramirez',
          email: 'ana.ramirez@gastroguide.app',
          role: 'STUDENT',
          status: 'ACTIVE',
          registeredAt: '2026-03-02T10:14:00Z'
        },
        {
          id: 102,
          fullName: 'Diego Casas',
          email: 'diego.casas@gastroguide.app',
          role: 'CREATOR',
          status: 'ACTIVE',
          registeredAt: '2026-02-18T08:20:00Z'
        },
        {
          id: 103,
          fullName: 'Marta Lopez',
          email: 'marta.lopez@gastroguide.app',
          role: 'STUDENT',
          status: 'SUSPENDED',
          registeredAt: '2025-12-11T16:32:00Z'
        },
        {
          id: 104,
          fullName: 'Carlos Ortega',
          email: 'carlos.ortega@gastroguide.app',
          role: 'CREATOR',
          status: 'BANNED',
          registeredAt: '2025-10-01T12:05:00Z'
        },
        {
          id: 105,
          fullName: 'Admin Principal',
          email: 'admin@gastroguide.app',
          role: 'ADMIN',
          status: 'ACTIVE',
          registeredAt: '2025-01-10T09:00:00Z'
        },
        {
          id: 106,
          fullName: 'Luisa Gomez',
          email: 'luisa.gomez@gastroguide.app',
          role: 'STUDENT',
          status: 'ACTIVE',
          registeredAt: '2026-01-23T14:52:00Z'
        },
        {
          id: 107,
          fullName: 'Pedro Vera',
          email: 'pedro.vera@gastroguide.app',
          role: 'CREATOR',
          status: 'ACTIVE',
          registeredAt: '2026-03-21T07:41:00Z'
        },
        {
          id: 108,
          fullName: 'Nora Marin',
          email: 'nora.marin@gastroguide.app',
          role: 'STUDENT',
          status: 'ACTIVE',
          registeredAt: '2026-03-30T18:27:00Z'
        }
      ]
    };
  }

  private getMockPublishedCourses(): AdminPublishedCoursesData {
    return {
      totalCourses: 6,
      courses: [
        {
          id: 501,
          title: 'Pastas artesanales desde cero',
          creatorName: 'Diego Casas',
          category: 'Cocina italiana',
          rating: 4.8,
          studentsCount: 428,
          publishedAt: '2026-02-01T11:00:00Z',
          status: 'PUBLISHED'
        },
        {
          id: 502,
          title: 'Panaderia de masa madre',
          creatorName: 'Laura Sierra',
          category: 'Panaderia',
          rating: 4.7,
          studentsCount: 311,
          publishedAt: '2026-01-19T13:20:00Z',
          status: 'PUBLISHED'
        },
        {
          id: 503,
          title: 'Reposteria para emprendimiento',
          creatorName: 'Valentina Torres',
          category: 'Reposteria',
          rating: 4.9,
          studentsCount: 590,
          publishedAt: '2025-12-12T09:10:00Z',
          status: 'PUBLISHED'
        },
        {
          id: 504,
          title: 'Sushi inicial en casa',
          creatorName: 'Kenji Mori',
          category: 'Cocina japonesa',
          rating: 4.6,
          studentsCount: 205,
          publishedAt: '2026-02-27T16:45:00Z',
          status: 'PUBLISHED'
        },
        {
          id: 505,
          title: 'Fotografia de platos para redes',
          creatorName: 'Sofia Melo',
          category: 'Marketing gastronomico',
          rating: 4.5,
          studentsCount: 176,
          publishedAt: '2026-03-05T10:10:00Z',
          status: 'PUBLISHED'
        },
        {
          id: 506,
          title: 'Tecnicas de fermentacion moderna',
          creatorName: 'Pedro Vera',
          category: 'Tecnicas culinarias',
          rating: 4.7,
          studentsCount: 243,
          publishedAt: '2026-03-11T08:35:00Z',
          status: 'HIDDEN'
        }
      ]
    };
  }

  private getMockUserProfiles(): AdminUserProfileData[] {
    return [
      {
        id: 101,
        fullName: 'Ana Ramirez',
        email: 'ana.ramirez@gastroguide.app',
        role: 'STUDENT',
        status: 'ACTIVE',
        registeredAt: '2026-03-02T10:14:00Z',
        country: 'Colombia',
        acquiredCourses: 9,
        activity: {
          lastLoginAt: '2026-04-05T09:12:00Z',
          recentActions: [
            'Completo la leccion 4 del curso de panaderia.',
            'Publico una denuncia sobre contenido de curso.',
            'Actualizo su metodo de pago.'
          ]
        }
      },
      {
        id: 102,
        fullName: 'Diego Casas',
        email: 'diego.casas@gastroguide.app',
        role: 'CREATOR',
        status: 'ACTIVE',
        registeredAt: '2026-02-18T08:20:00Z',
        country: 'Peru',
        acquiredCourses: 3,
        publishedCourses: 4,
        totalRevenueUsd: 5240,
        activity: {
          lastLoginAt: '2026-04-05T11:47:00Z',
          recentActions: [
            'Envio un nuevo curso para aprobacion.',
            'Respondio feedback de moderacion.',
            'Actualizo recursos de un modulo publicado.'
          ]
        }
      },
      {
        id: 105,
        fullName: 'Admin Principal',
        email: 'admin@gastroguide.app',
        role: 'ADMIN',
        status: 'ACTIVE',
        registeredAt: '2025-01-10T09:00:00Z',
        country: 'Colombia',
        acquiredCourses: 0,
        activity: {
          lastLoginAt: '2026-04-05T13:10:00Z',
          recentActions: [
            'Aprobo dos cursos pendientes.',
            'Reviso alertas de monitoreo.',
            'Genero reporte de errores de plataforma.'
          ]
        }
      }
    ];
  }

  private getMockUserActivity(): AdminUserActivityData {
    return {
      totalEvents: 6,
      events: [
        {
          id: 1,
          userId: 101,
          fullName: 'Ana Ramirez',
          actionType: 'LOGIN',
          device: 'Chrome / Windows',
          ipAddress: '190.12.44.10',
          createdAt: '2026-04-05T09:12:00Z'
        },
        {
          id: 2,
          userId: 102,
          fullName: 'Diego Casas',
          actionType: 'COURSE_SUBMITTED',
          device: 'Safari / macOS',
          ipAddress: '181.23.51.40',
          createdAt: '2026-04-05T10:22:00Z'
        },
        {
          id: 3,
          userId: 103,
          fullName: 'Marta Lopez',
          actionType: 'PAYMENT_ATTEMPT',
          device: 'Android App',
          ipAddress: '200.88.10.19',
          createdAt: '2026-04-05T11:04:00Z'
        },
        {
          id: 4,
          userId: 107,
          fullName: 'Pedro Vera',
          actionType: 'CONTENT_EDIT',
          device: 'Firefox / Linux',
          ipAddress: '172.16.0.33',
          createdAt: '2026-04-05T11:40:00Z'
        },
        {
          id: 5,
          userId: 108,
          fullName: 'Nora Marin',
          actionType: 'COURSE_ENROLL',
          device: 'iOS App',
          ipAddress: '45.66.210.8',
          createdAt: '2026-04-05T12:15:00Z'
        },
        {
          id: 6,
          userId: 101,
          fullName: 'Ana Ramirez',
          actionType: 'REPORT_CREATED',
          device: 'Chrome / Windows',
          ipAddress: '190.12.44.10',
          createdAt: '2026-04-05T12:33:00Z'
        }
      ]
    };
  }

  private getMockUserSanctions(): AdminUserSanctionsData {
    return {
      totalActions: 4,
      sanctions: [
        {
          id: 31,
          fullName: 'Carlos Ortega',
          action: 'BANNED',
          reason: 'Reincidencia en incumplimiento de politicas de contenido.',
          appliedBy: 'Admin Principal',
          appliedAt: '2026-03-21T13:10:00Z'
        },
        {
          id: 32,
          fullName: 'Marta Lopez',
          action: 'SUSPENDED',
          reason: 'Fraude en transacciones reportado por pasarela.',
          appliedBy: 'Admin Principal',
          appliedAt: '2026-03-29T09:42:00Z',
          expiresAt: '2026-04-12T09:42:00Z'
        },
        {
          id: 33,
          fullName: 'Julian Pardo',
          action: 'SUSPENDED',
          reason: 'Spam reiterado en comentarios de cursos.',
          appliedBy: 'Moderador Senior',
          appliedAt: '2026-04-01T16:35:00Z',
          expiresAt: '2026-04-08T16:35:00Z'
        },
        {
          id: 34,
          fullName: 'Laura Sierra',
          action: 'RESTORED',
          reason: 'Apelacion validada tras verificacion manual.',
          appliedBy: 'Admin Principal',
          appliedAt: '2026-04-03T11:05:00Z'
        }
      ]
    };
  }

  private getMockUserRoles(): AdminUserRolesData {
    return {
      totalChanges: 4,
      changes: [
        {
          id: 71,
          fullName: 'Luisa Gomez',
          previousRole: 'STUDENT',
          newRole: 'CREATOR',
          changedBy: 'Admin Principal',
          changedAt: '2026-03-12T14:10:00Z'
        },
        {
          id: 72,
          fullName: 'Pedro Vera',
          previousRole: 'CREATOR',
          newRole: 'CREATOR',
          changedBy: 'Admin Principal',
          changedAt: '2026-03-20T10:00:00Z'
        },
        {
          id: 73,
          fullName: 'Nora Marin',
          previousRole: 'STUDENT',
          newRole: 'STUDENT',
          changedBy: 'Admin Principal',
          changedAt: '2026-03-26T08:25:00Z'
        },
        {
          id: 74,
          fullName: 'Diego Casas',
          previousRole: 'CREATOR',
          newRole: 'CREATOR',
          changedBy: 'Admin Principal',
          changedAt: '2026-04-01T12:50:00Z'
        }
      ]
    };
  }

  private getMockCourseDetails(): AdminCourseDetailData[] {
    return [
      {
        id: 501,
        title: 'Pastas artesanales desde cero',
        creatorName: 'Diego Casas',
        category: 'Cocina italiana',
        price: 39.9,
        status: 'PUBLISHED',
        rating: 4.8,
        studentsCount: 428,
        reportsCount: 1,
        publishedAt: '2026-02-01T11:00:00Z',
        structure: { modules: 6, lessons: 24, resources: 12 }
      },
      {
        id: 502,
        title: 'Panaderia de masa madre',
        creatorName: 'Laura Sierra',
        category: 'Panaderia',
        price: 34.5,
        status: 'PUBLISHED',
        rating: 4.7,
        studentsCount: 311,
        reportsCount: 0,
        publishedAt: '2026-01-19T13:20:00Z',
        structure: { modules: 5, lessons: 19, resources: 9 }
      },
      {
        id: 503,
        title: 'Reposteria para emprendimiento',
        creatorName: 'Valentina Torres',
        category: 'Reposteria',
        price: 42,
        status: 'PUBLISHED',
        rating: 4.9,
        studentsCount: 590,
        reportsCount: 2,
        publishedAt: '2025-12-12T09:10:00Z',
        structure: { modules: 8, lessons: 30, resources: 18 }
      },
      {
        id: 504,
        title: 'Sushi inicial en casa',
        creatorName: 'Kenji Mori',
        category: 'Cocina japonesa',
        price: 31,
        status: 'PUBLISHED',
        rating: 4.6,
        studentsCount: 205,
        reportsCount: 0,
        publishedAt: '2026-02-27T16:45:00Z',
        structure: { modules: 4, lessons: 14, resources: 8 }
      },
      {
        id: 505,
        title: 'Fotografia de platos para redes',
        creatorName: 'Sofia Melo',
        category: 'Marketing gastronomico',
        price: 24.9,
        status: 'PUBLISHED',
        rating: 4.5,
        studentsCount: 176,
        reportsCount: 0,
        publishedAt: '2026-03-05T10:10:00Z',
        structure: { modules: 3, lessons: 11, resources: 20 }
      },
      {
        id: 506,
        title: 'Tecnicas de fermentacion moderna',
        creatorName: 'Pedro Vera',
        category: 'Tecnicas culinarias',
        price: 29,
        status: 'HIDDEN',
        rating: 4.7,
        studentsCount: 243,
        reportsCount: 3,
        publishedAt: '2026-03-11T08:35:00Z',
        structure: { modules: 5, lessons: 16, resources: 7 }
      }
    ];
  }

  private getMockModerationReports(): AdminModerationReportsData {
    return {
      totalReports: 6,
      reports: [
        {
          id: 9001,
          courseId: 506,
          courseTitle: 'Tecnicas de fermentacion moderna',
          reason: 'Contenido potencialmente peligroso sin advertencias claras.',
          reportedBy: 'ana.ramirez@gastroguide.app',
          severity: 'HIGH',
          status: 'PENDING',
          createdAt: '2026-04-02T15:10:00Z'
        },
        {
          id: 9002,
          courseId: 503,
          courseTitle: 'Reposteria para emprendimiento',
          reason: 'Posible uso no autorizado de material externo.',
          reportedBy: 'lina.torres@gastroguide.app',
          severity: 'MEDIUM',
          status: 'IN_REVIEW',
          createdAt: '2026-04-01T09:00:00Z'
        },
        {
          id: 9003,
          courseId: 505,
          courseTitle: 'Fotografia de platos para redes',
          reason: 'Comentario ofensivo en recursos complementarios.',
          reportedBy: 'marco.vargas@gastroguide.app',
          severity: 'LOW',
          status: 'PENDING',
          createdAt: '2026-03-31T20:12:00Z'
        },
        {
          id: 9004,
          courseId: 501,
          courseTitle: 'Pastas artesanales desde cero',
          reason: 'Inconsistencia entre contenido y descripcion promocional.',
          reportedBy: 'nora.marin@gastroguide.app',
          severity: 'MEDIUM',
          status: 'RESOLVED',
          createdAt: '2026-03-30T08:47:00Z'
        },
        {
          id: 9005,
          courseId: 504,
          courseTitle: 'Sushi inicial en casa',
          reason: 'Video con audio deficiente en modulo 2.',
          reportedBy: 'santiago.rio@gastroguide.app',
          severity: 'LOW',
          status: 'IN_REVIEW',
          createdAt: '2026-03-29T11:30:00Z'
        },
        {
          id: 9006,
          courseId: 502,
          courseTitle: 'Panaderia de masa madre',
          reason: 'Posible desinformacion en tiempos de fermentacion.',
          reportedBy: 'juliana.restrepo@gastroguide.app',
          severity: 'HIGH',
          status: 'PENDING',
          createdAt: '2026-03-28T17:55:00Z'
        }
      ]
    };
  }

  private getMockPendingCourses(): AdminPendingCoursesData {
    return {
      totalPendingCourses: 5,
      courses: [
        {
          id: 1201,
          title: 'Menu degustacion de temporada',
          creatorName: 'Paula Mendez',
          category: 'Alta cocina',
          submittedAt: '2026-04-04T08:15:00Z',
          waitingHours: 29
        },
        {
          id: 1202,
          title: 'Bases de cocina vegana',
          creatorName: 'Diego Casas',
          category: 'Cocina saludable',
          submittedAt: '2026-04-03T18:42:00Z',
          waitingHours: 42
        },
        {
          id: 1203,
          title: 'Postres frios para cafeteria',
          creatorName: 'Lina Torres',
          category: 'Reposteria',
          submittedAt: '2026-04-03T11:05:00Z',
          waitingHours: 50
        },
        {
          id: 1204,
          title: 'Salsas madre y derivadas',
          creatorName: 'Pedro Vera',
          category: 'Tecnicas culinarias',
          submittedAt: '2026-04-02T14:50:00Z',
          waitingHours: 70
        },
        {
          id: 1205,
          title: 'Panaderia para brunch',
          creatorName: 'Sofia Melo',
          category: 'Panaderia',
          submittedAt: '2026-04-01T09:22:00Z',
          waitingHours: 99
        }
      ]
    };
  }

  private getMockApprovalQueue(): AdminApprovalQueueData {
    return {
      totalCourses: 4,
      courses: [
        {
          id: 1201,
          title: 'Menu degustacion de temporada',
          creatorName: 'Paula Mendez',
          category: 'Alta cocina',
          submittedAt: '2026-04-04T08:15:00Z',
          waitingHours: 29,
          checklist: {
            contentQuality: true,
            mediaReady: true,
            pricingValid: true,
            policyCompliance: true
          },
          suggestedDecision: 'APPROVE',
          adminNote: 'Contenido completo y coherente para publicacion inmediata.'
        },
        {
          id: 1202,
          title: 'Bases de cocina vegana',
          creatorName: 'Diego Casas',
          category: 'Cocina saludable',
          submittedAt: '2026-04-03T18:42:00Z',
          waitingHours: 42,
          checklist: {
            contentQuality: true,
            mediaReady: false,
            pricingValid: true,
            policyCompliance: true
          },
          suggestedDecision: 'REQUEST_CHANGES',
          adminNote: 'Faltan dos videos por procesar en el modulo final.'
        },
        {
          id: 1203,
          title: 'Postres frios para cafeteria',
          creatorName: 'Lina Torres',
          category: 'Reposteria',
          submittedAt: '2026-04-03T11:05:00Z',
          waitingHours: 50,
          checklist: {
            contentQuality: false,
            mediaReady: true,
            pricingValid: true,
            policyCompliance: false
          },
          suggestedDecision: 'REJECT',
          adminNote: 'Se detectaron recursos con contenido protegido sin autorizacion.'
        },
        {
          id: 1204,
          title: 'Salsas madre y derivadas',
          creatorName: 'Pedro Vera',
          category: 'Tecnicas culinarias',
          submittedAt: '2026-04-02T14:50:00Z',
          waitingHours: 70,
          checklist: {
            contentQuality: true,
            mediaReady: true,
            pricingValid: false,
            policyCompliance: true
          },
          suggestedDecision: 'REQUEST_CHANGES',
          adminNote: 'Ajustar precio y moneda para cumplir reglas de catalogo.'
        }
      ]
    };
  }

  private getMockDeleteQueue(): AdminDeleteQueueData {
    return {
      totalCourses: 4,
      courses: [
        {
          id: 506,
          title: 'Tecnicas de fermentacion moderna',
          creatorName: 'Pedro Vera',
          reasonCategory: 'Riesgo sanitario',
          riskLevel: 'HIGH',
          affectedStudents: 243,
          activeTransactions: 7,
          estimatedRefundAmount: 1765,
          reportedAt: '2026-04-02T15:10:00Z'
        },
        {
          id: 503,
          title: 'Reposteria para emprendimiento',
          creatorName: 'Valentina Torres',
          reasonCategory: 'Propiedad intelectual',
          riskLevel: 'HIGH',
          affectedStudents: 590,
          activeTransactions: 12,
          estimatedRefundAmount: 4898,
          reportedAt: '2026-04-01T09:00:00Z'
        },
        {
          id: 505,
          title: 'Fotografia de platos para redes',
          creatorName: 'Sofia Melo',
          reasonCategory: 'Lenguaje ofensivo',
          riskLevel: 'MEDIUM',
          affectedStudents: 176,
          activeTransactions: 2,
          estimatedRefundAmount: 398,
          reportedAt: '2026-03-31T20:12:00Z'
        },
        {
          id: 504,
          title: 'Sushi inicial en casa',
          creatorName: 'Kenji Mori',
          reasonCategory: 'Calidad de contenido',
          riskLevel: 'LOW',
          affectedStudents: 205,
          activeTransactions: 1,
          estimatedRefundAmount: 155,
          reportedAt: '2026-03-29T11:30:00Z'
        }
      ]
    };
  }

  private getMockSystemMonitoring(): AdminSystemMonitoringData {
    return {
      status: 'DEGRADED',
      metrics: [
        { name: 'CPU promedio', value: 81, unit: '%', trend: 'UP', thresholdExceeded: true },
        { name: 'Memoria RAM', value: 68, unit: '%', trend: 'STABLE', thresholdExceeded: false },
        { name: 'Latencia API', value: 412, unit: 'ms', trend: 'UP', thresholdExceeded: true },
        { name: 'Trafico', value: 3240, unit: 'req/min', trend: 'UP', thresholdExceeded: false },
        { name: 'Usuarios activos', value: 1278, unit: 'users', trend: 'DOWN', thresholdExceeded: false },
        { name: 'Nodos disponibles', value: 5, unit: 'nodes', trend: 'STABLE', thresholdExceeded: false }
      ],
      alerts: [
        {
          id: 301,
          severity: 'HIGH',
          message: 'Latencia elevada en servicio de pagos durante los ultimos 15 minutos.',
          startedAt: '2026-04-05T12:56:00Z'
        },
        {
          id: 302,
          severity: 'MEDIUM',
          message: 'CPU del cluster de cursos por encima del umbral de 80%.',
          startedAt: '2026-04-05T12:48:00Z'
        }
      ],
      updatedAt: '2026-04-05T13:30:00Z'
    };
  }

  private getMockSystemErrors(): AdminSystemErrorsData {
    return {
      totalErrors: 5,
      errors: [
        {
          id: 801,
          code: 'PAY-502',
          module: 'payments-service',
          severity: 'CRITICAL',
          occurrences: 27,
          firstSeenAt: '2026-04-05T10:11:00Z',
          lastSeenAt: '2026-04-05T13:22:00Z',
          status: 'IN_PROGRESS'
        },
        {
          id: 802,
          code: 'AUTH-401',
          module: 'auth-gateway',
          severity: 'HIGH',
          occurrences: 112,
          firstSeenAt: '2026-04-05T07:45:00Z',
          lastSeenAt: '2026-04-05T13:20:00Z',
          status: 'OPEN'
        },
        {
          id: 803,
          code: 'CAT-409',
          module: 'catalog-service',
          severity: 'MEDIUM',
          occurrences: 13,
          firstSeenAt: '2026-04-04T18:02:00Z',
          lastSeenAt: '2026-04-05T11:12:00Z',
          status: 'IN_PROGRESS'
        },
        {
          id: 804,
          code: 'CDN-408',
          module: 'media-delivery',
          severity: 'MEDIUM',
          occurrences: 6,
          firstSeenAt: '2026-04-04T14:40:00Z',
          lastSeenAt: '2026-04-05T09:05:00Z',
          status: 'RESOLVED'
        },
        {
          id: 805,
          code: 'ANL-400',
          module: 'analytics-service',
          severity: 'LOW',
          occurrences: 4,
          firstSeenAt: '2026-04-03T20:30:00Z',
          lastSeenAt: '2026-04-04T08:00:00Z',
          status: 'RESOLVED'
        }
      ]
    };
  }

  private getMockSystemBackups(): AdminSystemBackupsData {
    return {
      totalBackups: 4,
      backups: [
        {
          id: 901,
          type: 'FULL',
          storage: 'HYBRID',
          sizeGb: 128,
          integrity: 'VALID',
          createdAt: '2026-04-05T02:00:00Z'
        },
        {
          id: 902,
          type: 'INCREMENTAL',
          storage: 'CLOUD',
          sizeGb: 18,
          integrity: 'VALID',
          createdAt: '2026-04-05T08:00:00Z'
        },
        {
          id: 903,
          type: 'INCREMENTAL',
          storage: 'CLOUD',
          sizeGb: 21,
          integrity: 'VALID',
          createdAt: '2026-04-05T12:00:00Z'
        },
        {
          id: 904,
          type: 'FULL',
          storage: 'LOCAL',
          sizeGb: 124,
          integrity: 'INVALID',
          createdAt: '2026-04-04T02:00:00Z'
        }
      ],
      recoveryEvents: [
        {
          id: 601,
          backupId: 904,
          status: 'FAILED',
          startedAt: '2026-04-04T05:10:00Z',
          finishedAt: '2026-04-04T05:24:00Z'
        },
        {
          id: 602,
          backupId: 901,
          status: 'SUCCESS',
          startedAt: '2026-04-05T06:10:00Z',
          finishedAt: '2026-04-05T06:21:00Z'
        }
      ]
    };
  }

  private getMockLayoutConfig(): AdminLayoutConfigData {
    return {
      shellVariant: 'comfortable',
      primaryColor: '#1E40AF',
      secondaryColor: '#FF6B35',
      showSystemTab: true,
      enableQuickStats: true,
      updatedAt: '2026-04-05T13:52:00Z'
    };
  }
}
