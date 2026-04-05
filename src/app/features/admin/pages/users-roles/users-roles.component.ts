import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { AdminUserRoleChangeItem, AdminUserRolesData } from '@core/models/admin/admin-views.model';
import { AdminDataService } from '@core/services/admin/admin-data.service';

@Component({
  selector: 'app-users-roles',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users-roles.component.html',
  styleUrls: ['./users-roles.component.scss']
})
export class UsersRolesComponent implements OnInit {
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly data = signal<AdminUserRolesData>({ totalChanges: 0, changes: [] });

  constructor(private readonly adminDataService: AdminDataService) {}

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.loading.set(true);
    this.error.set(null);

    this.adminDataService.getUserRoles().subscribe({
      next: (data) => {
        this.data.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar cambios de roles y permisos desde el endpoint.');
        this.loading.set(false);
      }
    });
  }

  trackByChangeId(_index: number, item: AdminUserRoleChangeItem): number {
    return item.id;
  }
}
