import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AdminUserListItem,
  AdminUsersListData
} from '@core/models/admin/admin-views.model';
import { AdminDataService } from '@core/services/admin/admin-data.service';

@Component({
  selector: 'app-users-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users-search.component.html',
  styleUrls: ['./users-search.component.scss']
})
export class UsersSearchComponent implements OnInit {
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly data = signal<AdminUsersListData>({ totalUsers: 0, users: [] });
  readonly query = signal('');

  constructor(private readonly adminDataService: AdminDataService) {}

  ngOnInit(): void {
    this.search();
  }

  search(): void {
    this.loading.set(true);
    this.error.set(null);

    this.adminDataService.getUsersSearch(this.query()).subscribe({
      next: (data) => {
        this.data.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo ejecutar la busqueda de usuarios desde el endpoint.');
        this.loading.set(false);
      }
    });
  }

  clear(): void {
    this.query.set('');
    this.search();
  }

  trackByUserId(_index: number, item: AdminUserListItem): number {
    return item.id;
  }
}
