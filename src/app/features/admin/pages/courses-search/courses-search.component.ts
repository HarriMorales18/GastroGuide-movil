import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AdminPublishedCourseItem,
  AdminPublishedCoursesData
} from '@core/models/admin/admin-views.model';
import { AdminDataService } from '@core/services/admin/admin-data.service';

@Component({
  selector: 'app-courses-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './courses-search.component.html',
  styleUrls: ['./courses-search.component.scss']
})
export class CoursesSearchComponent implements OnInit {
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly data = signal<AdminPublishedCoursesData>({ totalCourses: 0, courses: [] });

  query = '';

  constructor(private readonly adminDataService: AdminDataService) {}

  ngOnInit(): void {
    this.search();
  }

  search(): void {
    this.loading.set(true);
    this.error.set(null);

    this.adminDataService.getCoursesSearch(this.query).subscribe({
      next: (data) => {
        this.data.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo buscar cursos desde el endpoint.');
        this.loading.set(false);
      }
    });
  }

  trackByCourseId(_index: number, item: AdminPublishedCourseItem): number {
    return item.id;
  }
}
