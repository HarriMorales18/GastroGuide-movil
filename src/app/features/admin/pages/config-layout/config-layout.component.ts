import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { AdminLayoutConfigData } from '@core/models/admin/admin-views.model';
import { AdminDataService } from '@core/services/admin/admin-data.service';

@Component({
  selector: 'app-config-layout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './config-layout.component.html',
  styleUrls: ['./config-layout.component.scss']
})
export class ConfigLayoutComponent implements OnInit {
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly config = signal<AdminLayoutConfigData | null>(null);

  constructor(private readonly adminDataService: AdminDataService) {}

  ngOnInit(): void {
    this.loadConfig();
  }

  loadConfig(): void {
    this.loading.set(true);
    this.error.set(null);

    this.adminDataService.getLayoutConfig().subscribe({
      next: (data) => {
        this.config.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la configuración de layout desde el endpoint.');
        this.loading.set(false);
      }
    });
  }
}
