import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { AdminSystemErrorItem, AdminSystemErrorsData } from '@core/models/admin/admin-views.model';
import { AdminDataService } from '@core/services/admin/admin-data.service';

@Component({
  selector: 'app-system-errors',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './system-errors.component.html',
  styleUrls: ['./system-errors.component.scss']
})
export class SystemErrorsComponent implements OnInit {
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly data = signal<AdminSystemErrorsData>({ totalErrors: 0, errors: [] });

  constructor(private readonly adminDataService: AdminDataService) {}

  ngOnInit(): void {
    this.loadErrors();
  }

  loadErrors(): void {
    this.loading.set(true);
    this.error.set(null);

    this.adminDataService.getSystemErrors().subscribe({
      next: (data) => {
        this.data.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el reporte de errores desde el endpoint.');
        this.loading.set(false);
      }
    });
  }

  trackByErrorId(_index: number, item: AdminSystemErrorItem): number {
    return item.id;
  }
}
