import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseDetailStateService } from '@core/services/student/course-detail-state.service';
import { StudentCourseDetail } from '@student-models/course-detail.model';
import { CourseAccessService } from '@core/services/student/course-access.service';
import { CoursePurchaseService } from '@core/services/student/course-purchase.service';

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
    private readonly courseAccess: CourseAccessService,
    private readonly coursePurchaseService: CoursePurchaseService
  ) {}

  goBack(): void {
    this.courseAccess.revokeAccess();
    this.courseDetailState.clearSelectedCourse();
  }

  openLearningExperience(): void {
    const course = this.selectedCourse();
    if (!course) {
      return;
    }

    if (!this.isCoursePurchased(course)) {
      this.courseAccess.requestPurchaseAndOpen();
      return;
    }

    this.courseAccess.grantAccessAndOpen();
  }

  hasProgress(course: StudentCourseDetail): boolean {
    return course.progressPercentage > 0;
  }

  isCoursePurchased(course: StudentCourseDetail): boolean {
    return course.isPurchased || this.coursePurchaseService.isCoursePurchased(course);
  }

}
