import { Injectable, signal } from '@angular/core';
import { StudentCourseDetail } from './course-detail.model';

@Injectable({
  providedIn: 'root'
})
export class CourseDetailStateService {
  readonly selectedCourse = signal<StudentCourseDetail | null>(null);

  setSelectedCourse(course: StudentCourseDetail): void {
    this.selectedCourse.set(course);
  }

  clearSelectedCourse(): void {
    this.selectedCourse.set(null);
  }
}
