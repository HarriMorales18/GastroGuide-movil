import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BackendApiService } from '@core/services/backend-api.service';
import {
  CreateLessonRequest,
  CreateLessonResponse,
  CourseDetailResponse,
  CourseModuleResponse,
  CreateCourseRequest,
  CreateModuleRequest,
  CreateModuleResponse,
  UpdateCourseRequest,
  UpdateCourseResponse,
  UpdateModuleRequest,
  UpdateModuleResponse,
  CreateCourseResponse,
  PublishCourseRequest
} from '@core/models/course-api.model';

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  private readonly baseApiUrl = '/api/courses';
  private readonly modulesApiUrl = '/api/modules';
  private readonly lessonsApiUrl = '/api/lessons';

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

  createCourseFromApi(payload: CreateCourseRequest): Observable<CreateCourseResponse> {
    return this.backendApi.post<CreateCourseResponse>(`${this.baseApiUrl}/create`, payload);
  }

  updateCourseFromApi(courseId: number, payload: UpdateCourseRequest): Observable<UpdateCourseResponse> {
    return this.backendApi.patch<UpdateCourseResponse>(`${this.baseApiUrl}/${courseId}`, payload);
  }

  createModuleFromApi(payload: CreateModuleRequest): Observable<CreateModuleResponse> {
    return this.backendApi.post<CreateModuleResponse>(`${this.modulesApiUrl}/create`, payload);
  }

  createLessonFromApi(payload: CreateLessonRequest): Observable<CreateLessonResponse> {
    return this.backendApi.post<CreateLessonResponse>(this.lessonsApiUrl, payload);
  }

  updateModuleFromApi(payload: UpdateModuleRequest): Observable<UpdateModuleResponse> {
    return this.backendApi.patch<UpdateModuleResponse>(`${this.modulesApiUrl}/update`, payload);
  }

}
