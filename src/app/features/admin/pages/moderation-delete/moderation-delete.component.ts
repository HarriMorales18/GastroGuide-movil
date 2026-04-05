import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { AdminDeleteCourseItem, AdminDeleteQueueData } from '@core/models/admin/admin-views.model';
import { AdminDataService } from '@core/services/admin/admin-data.service';

@Component({
  selector: 'app-moderation-delete',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './moderation-delete.component.html',
  styleUrls: ['./moderation-delete.component.scss']
})
export class ModerationDeleteComponent implements OnInit {
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly data = signal<AdminDeleteQueueData>({ totalCourses: 0, courses: [] });

  constructor(private readonly adminDataService: AdminDataService) {}

  ngOnInit(): void {
    this.loadDeleteQueue();
  }

  loadDeleteQueue(): void {
    this.loading.set(true);
    this.error.set(null);

    this.adminDataService.getDeleteQueue().subscribe({
      next: (data) => {
        this.data.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la cola de eliminación desde el endpoint.');
        this.loading.set(false);
      }
    });
  }

  trackByCourseId(_index: number, item: AdminDeleteCourseItem): number {
    return item.id;
  }
}
