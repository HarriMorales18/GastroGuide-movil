import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BackendApiService } from '@core/services/backend-api.service';
import { CompleteLessonRequest, CompleteLessonResponse } from '@student-models/course-progress.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CourseProgressService {
  constructor(private readonly backendApi: BackendApiService) {}

  completeLesson(courseId: number, lessonId: number): Observable<CompleteLessonResponse> {
    const payload: CompleteLessonRequest = {
      completedAt: new Date().toISOString()
    };

    if (environment.useMockApi || !environment.apiUrl) {
      return of({
        success: true,
        courseId,
        lessonId
      });
    }

    const apiUrl = `/api/student/courses/${courseId}/lessons/${lessonId}/complete`;

    return this.backendApi.post<CompleteLessonResponse>(apiUrl, payload).pipe(
      catchError(() =>
        of({
          success: false,
          courseId,
          lessonId
        })
      )
    );
  }
}
