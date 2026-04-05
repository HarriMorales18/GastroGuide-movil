import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import {
  AdminPublishedCourseItem,
  AdminPublishedCoursesData
} from '@core/models/admin/admin-views.model';
import { AdminDataService } from '@core/services/admin/admin-data.service';

@Component({
  selector: 'app-published-courses',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './published-courses.component.html',
  styleUrls: ['./published-courses.component.scss']
})
export class PublishedCoursesComponent implements OnInit {
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly data = signal<AdminPublishedCoursesData>({ totalCourses: 0, courses: [] });

  constructor(private readonly adminDataService: AdminDataService) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.loading.set(true);
    this.error.set(null);

    this.adminDataService.getPublishedCourses().subscribe({
      next: (data) => {
        this.data.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el listado de cursos publicados desde el endpoint.');
        this.loading.set(false);
      }
    });
  }

  trackByCourseId(_index: number, item: AdminPublishedCourseItem): number {
    return item.id;
  }
}
