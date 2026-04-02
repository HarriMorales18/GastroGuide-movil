import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BackendApiService } from '@core/services/backend-api.service';
import { CourseDetailResponse, CourseModuleResponse, PublishCourseRequest } from '@core/models/course-api.model';

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  private readonly baseApiUrl = '/api/courses';

  constructor(private readonly backendApi: BackendApiService) {}

  getCourseByIdFromApi(courseId: number): Observable<CourseDetailResponse> {
    return this.backendApi.get<CourseDetailResponse>(`${this.baseApiUrl}/${courseId}`);
  }

  getCourseModulesFromApi(courseId: number): Observable<CourseModuleResponse[]> {
    return this.backendApi.get<CourseModuleResponse[]>(`${this.baseApiUrl}/${courseId}/modules`);
  }

  publishCourseFromApi(payload: PublishCourseRequest): Observable<CourseDetailResponse> {
    return this.backendApi.post<CourseDetailResponse>(`${this.baseApiUrl}/publish`, payload);
  }

}
