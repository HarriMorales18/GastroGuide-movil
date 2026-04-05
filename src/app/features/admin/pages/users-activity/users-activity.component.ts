import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { AdminUserActivityData, AdminUserActivityItem } from '@core/models/admin/admin-views.model';
import { AdminDataService } from '@core/services/admin/admin-data.service';

@Component({
  selector: 'app-users-activity',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users-activity.component.html',
  styleUrls: ['./users-activity.component.scss']
})
export class UsersActivityComponent implements OnInit {
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly data = signal<AdminUserActivityData>({ totalEvents: 0, events: [] });

  constructor(private readonly adminDataService: AdminDataService) {}

  ngOnInit(): void {
    this.loadActivity();
  }

  loadActivity(): void {
    this.loading.set(true);
    this.error.set(null);

    this.adminDataService.getUserActivity().subscribe({
      next: (data) => {
        this.data.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el historial de actividad desde el endpoint.');
        this.loading.set(false);
      }
    });
  }

  trackByEventId(_index: number, item: AdminUserActivityItem): number {
    return item.id;
  }
}
