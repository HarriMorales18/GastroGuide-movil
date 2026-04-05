import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AdminCourseDetailData,
  AdminPublishedCourseItem
} from '@core/models/admin/admin-views.model';
import { AdminDataService } from '@core/services/admin/admin-data.service';

@Component({
  selector: 'app-admin-course-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './course-detail.component.html',
  styleUrls: ['./course-detail.component.scss']
})
export class CourseDetailComponent implements OnInit {
  readonly loading = signal(false);
  readonly loadingOptions = signal(true);
  readonly error = signal<string | null>(null);
  readonly availableCourses = signal<AdminPublishedCourseItem[]>([]);
  readonly selectedCourseId = signal<number | null>(null);
  readonly detail = signal<AdminCourseDetailData | null>(null);

  constructor(private readonly adminDataService: AdminDataService) {}

  ngOnInit(): void {
    this.loadAvailableCourses();
  }

  loadAvailableCourses(): void {
    this.loadingOptions.set(true);
    this.error.set(null);

    this.adminDataService.getPublishedCourses().subscribe({
      next: (data) => {
        this.availableCourses.set(data.courses);
        this.loadingOptions.set(false);

        if (data.courses.length > 0) {
          this.selectedCourseId.set(data.courses[0].id);
          this.loadDetail();
        }
      },
      error: () => {
        this.error.set('No se pudo cargar el listado base de cursos para seleccionar detalle.');
        this.loadingOptions.set(false);
      }
    });
  }

  loadDetail(): void {
    const courseId = this.selectedCourseId();
    if (!courseId) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.adminDataService.getCourseDetail(courseId).subscribe({
      next: (data) => {
        this.detail.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el detalle del curso desde el endpoint.');
        this.loading.set(false);
      }
    });
  }
}
