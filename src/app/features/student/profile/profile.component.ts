import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
  <section class="profile-hub">
    <header class="hub-header">
      <div class="avatar">
        <img *ngIf="photoUrl; else initials" [src]="photoUrl" alt="Foto de perfil" />
        <ng-template #initials>
          <div class="initials">{{ initials }}</div>
        </ng-template>
      </div>

      <div class="user-info">
        <h2 class="user-name">{{ name }}</h2>
        <p class="user-bio">{{ bio }}</p>
        <div class="counters">
          <div class="counter">
            <div class="count">{{ completedCount }}</div>
            <div class="label">Cursos completados</div>
          </div>
          <div class="counter">
            <div class="count">{{ inProgressCount }}</div>
            <div class="label">Cursos en progreso</div>
          </div>
        </div>
      </div>
    </header>

    <nav class="quick-actions">
      <button class="btn primary" (click)="goToMyCourses()">Mis cursos</button>
      <button class="btn dark" (click)="editProfile()">Editar perfil</button>
      <button class="btn secondary" (click)="openSettings()">Configuración</button>
    </nav>

    <footer class="hub-footer">
      <button class="btn logout" (click)="logout()">Cerrar sesión</button>
    </footer>
  </section>
  `,
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  // Mocked / placeholder data for the UI hub
  photoUrl: string | null = null;
  name = 'Harrinson Morales';
  bio = 'Apasionado por la gastronomía y el aprendizaje continuo.';
  completedCount = 3;
  inProgressCount = 2;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // placeholder: try to load a user photo if available in storage/session
    // keep null to show initials fallback
    // this.photoUrl = 'assets/profile/harrinson.jpg';
  }

  // Action placeholders — later los conectaremos a rutas/servicios reales
  goToMyCourses() {
    this.router.navigate(['/student/courses']);
  }

  editProfile() {
    this.router.navigate(['/student/profile/edit']);
  }

  openSettings() {
    this.router.navigate(['/student/profile/settings']);
  }

  logout() {
    this.authService.logoutWithBackend().subscribe(() => {
      this.router.navigate(['/']);
    });
  }

  get initials(): string {
    try {
      return this.name
        .split(' ')
        .map(n => n ? n[0] : '')
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase();
    } catch {
      return '';
    }
  }
}