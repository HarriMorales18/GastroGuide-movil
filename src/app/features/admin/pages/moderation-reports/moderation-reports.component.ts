import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import {
  AdminModerationReportItem,
  AdminModerationReportsData
} from '@core/models/admin/admin-views.model';
import { AdminDataService } from '@core/services/admin/admin-data.service';

@Component({
  selector: 'app-moderation-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './moderation-reports.component.html',
  styleUrls: ['./moderation-reports.component.scss']
})
export class ModerationReportsComponent implements OnInit {
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly data = signal<AdminModerationReportsData>({ totalReports: 0, reports: [] });

  constructor(private readonly adminDataService: AdminDataService) {}

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.loading.set(true);
    this.error.set(null);

    this.adminDataService.getModerationReports().subscribe({
      next: (data) => {
        this.data.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el listado de denuncias desde el endpoint.');
        this.loading.set(false);
      }
    });
  }

  trackByReportId(_index: number, item: AdminModerationReportItem): number {
    return item.id;
  }
}
