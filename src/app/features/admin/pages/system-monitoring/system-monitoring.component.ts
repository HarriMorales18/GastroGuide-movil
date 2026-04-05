import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import {
  AdminSystemAlertItem,
  AdminSystemMonitoringData,
  AdminSystemMonitoringMetric
} from '@core/models/admin/admin-views.model';
import { AdminDataService } from '@core/services/admin/admin-data.service';

@Component({
  selector: 'app-system-monitoring',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './system-monitoring.component.html',
  styleUrls: ['./system-monitoring.component.scss']
})
export class SystemMonitoringComponent implements OnInit {
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly data = signal<AdminSystemMonitoringData>({
    status: 'HEALTHY',
    metrics: [],
    alerts: [],
    updatedAt: ''
  });

  constructor(private readonly adminDataService: AdminDataService) {}

  ngOnInit(): void {
    this.loadMonitoring();
  }

  loadMonitoring(): void {
    this.loading.set(true);
    this.error.set(null);

    this.adminDataService.getSystemMonitoring().subscribe({
      next: (data) => {
        this.data.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el tablero de monitoreo desde el endpoint.');
        this.loading.set(false);
      }
    });
  }

  trackByMetric(_index: number, item: AdminSystemMonitoringMetric): string {
    return item.name;
  }

  trackByAlert(_index: number, item: AdminSystemAlertItem): number {
    return item.id;
  }
}
