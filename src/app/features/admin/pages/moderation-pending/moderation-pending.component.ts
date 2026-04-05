import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import {
  AdminPendingCourseItem,
  AdminPendingCoursesData
} from '@core/models/admin/admin-views.model';
import { AdminDataService } from '@core/services/admin/admin-data.service';

@Component({
  selector: 'app-moderation-pending',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './moderation-pending.component.html',
  styleUrls: ['./moderation-pending.component.scss']
})
export class ModerationPendingComponent implements OnInit {
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly data = signal<AdminPendingCoursesData>({ totalPendingCourses: 0, courses: [] });

  constructor(private readonly adminDataService: AdminDataService) {}

  ngOnInit(): void {
    this.loadPending();
  }

  loadPending(): void {
    this.loading.set(true);
    this.error.set(null);

    this.adminDataService.getPendingCourses().subscribe({
      next: (data) => {
        this.data.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar los cursos pendientes desde el endpoint.');
        this.loading.set(false);
      }
    });
  }

  trackByCourseId(_index: number, item: AdminPendingCourseItem): number {
    return item.id;
  }
}
