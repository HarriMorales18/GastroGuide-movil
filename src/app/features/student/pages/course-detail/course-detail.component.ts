import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseDetailStateService } from '@core/services/student/course-detail-state.service';
import { StudentCourseDetail } from '@student-models/course-detail.model';
import { CourseAccessService } from '@core/services/student/course-access.service';

@Component({
  selector: 'app-course-detail',
  templateUrl: './course-detail.component.html',
  styleUrl: './course-detail.component.scss',
  standalone: true,
  imports: [CommonModule]
})
export class CourseDetailComponent {
  readonly selectedCourse = this.courseDetailState.selectedCourse;

  constructor(
    private readonly courseDetailState: CourseDetailStateService,
    private readonly courseAccess: CourseAccessService
  ) {}

  goBack(): void {
    this.courseAccess.revokeAccess();
    this.courseDetailState.clearSelectedCourse();
  }

  openLearningExperience(): void {
    this.courseAccess.grantAccessAndOpen();
  }

  hasProgress(course: StudentCourseDetail): boolean {
    return course.progressPercentage > 0;
  }

}
