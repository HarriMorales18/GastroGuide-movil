import { Injectable, signal } from '@angular/core';
import { StudentCourseDetail } from '../models/course-detail.model';

@Injectable()
export class CourseDetailStateService {
  readonly selectedCourse = signal<StudentCourseDetail | null>(null);

  setSelectedCourse(course: StudentCourseDetail): void {
    this.selectedCourse.set(course);
  }

  clearSelectedCourse(): void {
    this.selectedCourse.set(null);
  }
}
