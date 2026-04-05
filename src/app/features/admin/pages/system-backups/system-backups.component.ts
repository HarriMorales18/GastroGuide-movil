import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import {
  AdminBackupItem,
  AdminRecoveryEventItem,
  AdminSystemBackupsData
} from '@core/models/admin/admin-views.model';
import { AdminDataService } from '@core/services/admin/admin-data.service';

@Component({
  selector: 'app-system-backups',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './system-backups.component.html',
  styleUrls: ['./system-backups.component.scss']
})
export class SystemBackupsComponent implements OnInit {
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly data = signal<AdminSystemBackupsData>({ totalBackups: 0, backups: [], recoveryEvents: [] });

  constructor(private readonly adminDataService: AdminDataService) {}

  ngOnInit(): void {
    this.loadBackups();
  }

  loadBackups(): void {
    this.loading.set(true);
    this.error.set(null);

    this.adminDataService.getSystemBackups().subscribe({
      next: (data) => {
        this.data.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la gestión de backups desde el endpoint.');
        this.loading.set(false);
      }
    });
  }

  trackByBackupId(_index: number, item: AdminBackupItem): number {
    return item.id;
  }

  trackByRecoveryId(_index: number, item: AdminRecoveryEventItem): number {
    return item.id;
  }
}
