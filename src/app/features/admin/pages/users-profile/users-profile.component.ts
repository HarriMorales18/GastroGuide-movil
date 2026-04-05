import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminUserProfileData } from '@core/models/admin/admin-views.model';
import { AdminDataService } from '@core/services/admin/admin-data.service';

type ProfileOption = { id: number; label: string };

@Component({
  selector: 'app-users-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users-profile.component.html',
  styleUrls: ['./users-profile.component.scss']
})
export class UsersProfileComponent implements OnInit {
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly profile = signal<AdminUserProfileData | null>(null);

  readonly options: ProfileOption[] = [
    { id: 101, label: 'Ana Ramirez (STUDENT)' },
    { id: 102, label: 'Diego Casas (CREATOR)' },
    { id: 105, label: 'Admin Principal (ADMIN)' }
  ];

  selectedUserId = 101;

  constructor(private readonly adminDataService: AdminDataService) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  onChangeUser(): void {
    this.loadProfile();
  }

  private loadProfile(): void {
    this.loading.set(true);
    this.error.set(null);

    this.adminDataService.getUserProfile(this.selectedUserId).subscribe({
      next: (data) => {
        this.profile.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el perfil del usuario desde el endpoint.');
        this.loading.set(false);
      }
    });
  }
}
