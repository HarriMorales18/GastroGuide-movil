import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseDetailStateService } from './course-detail-state.service';
import { StudentCourseDetail } from '../../models/course-detail.model';

@Component({
  selector: 'app-course-detail',
  templateUrl: './course-detail.component.html',
  styleUrl: './course-detail.component.scss',
  standalone: true,
  imports: [CommonModule]
})
export class CourseDetailComponent {
  readonly selectedCourse = this.courseDetailState.selectedCourse;

  constructor(private readonly courseDetailState: CourseDetailStateService) {}

  goBack(): void {
    this.courseDetailState.clearSelectedCourse();
  }

  hasProgress(course: StudentCourseDetail): boolean {
    return course.progressPercentage > 0;
  }

}
