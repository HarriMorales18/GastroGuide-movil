import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { AdminUserSanctionItem, AdminUserSanctionsData } from '@core/models/admin/admin-views.model';
import { AdminDataService } from '@core/services/admin/admin-data.service';

@Component({
  selector: 'app-users-sanctions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users-sanctions.component.html',
  styleUrls: ['./users-sanctions.component.scss']
})
export class UsersSanctionsComponent implements OnInit {
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly data = signal<AdminUserSanctionsData>({ totalActions: 0, sanctions: [] });

  constructor(private readonly adminDataService: AdminDataService) {}

  ngOnInit(): void {
    this.loadSanctions();
  }

  loadSanctions(): void {
    this.loading.set(true);
    this.error.set(null);

    this.adminDataService.getUserSanctions().subscribe({
      next: (data) => {
        this.data.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar sanciones y restauraciones desde el endpoint.');
        this.loading.set(false);
      }
    });
  }

  trackBySanctionId(_index: number, item: AdminUserSanctionItem): number {
    return item.id;
  }
}
