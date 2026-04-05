import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth.service';

type CreateMode = 'student' | 'creator';
type AlertType = 'success' | 'danger' | 'warning' | 'info';

interface CreatedUser {
  mode: CreateMode;
  displayName: string;
  email: string;
  createdAt: string;
}

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.scss', './create-user.component2.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class CreateUserComponent {
  mode: CreateMode = 'student';

  username = '';
  firstName = '';
  lastName = '';
  email = '';
  password = '';

  loading = false;
  alertType: AlertType = 'info';
  alertMessage = '';

  createdUsers: CreatedUser[] = [];

  constructor(private readonly authService: AuthService) {}

  setMode(mode: CreateMode): void {
    this.mode = mode;
    this.alertMessage = '';
    this.username = '';
    this.firstName = '';
    this.lastName = '';
  }

  createUser(): void {
    this.alertMessage = '';

    if (!this.email.trim() || !this.password.trim()) {
      this.showAlert('warning', 'Completa email y password.');
      return;
    }

    if (this.mode === 'student' && !this.username.trim()) {
      this.showAlert('warning', 'Para estudiante, el username es obligatorio.');
      return;
    }

    if (this.mode === 'creator' && (!this.firstName.trim() || !this.lastName.trim())) {
      this.showAlert('warning', 'Para creador, completa nombre y apellido.');
      return;
    }

    this.loading = true;

    const request$ = this.mode === 'student'
      ? this.authService.registerStudent({
          username: this.username.trim(),
          email: this.email.trim(),
          password: this.password,
        })
      : this.authService.registerCreator({
          firstName: this.firstName.trim(),
          lastName: this.lastName.trim(),
          email: this.email.trim(),
          password: this.password,
        });

    request$.subscribe((ok) => {
      this.loading = false;

      if (!ok) {
        this.showAlert('danger', 'No se pudo crear el usuario. Verifica backend y datos.');
        return;
      }

      const displayName = this.mode === 'student'
        ? this.username.trim()
        : `${this.firstName.trim()} ${this.lastName.trim()}`;

      this.createdUsers = [
        {
          mode: this.mode,
          displayName,
          email: this.email.trim(),
          createdAt: new Date().toLocaleString(),
        },
        ...this.createdUsers,
      ];

      this.password = '';
      if (this.mode === 'student') {
        this.username = '';
      } else {
        this.firstName = '';
        this.lastName = '';
      }

      this.showAlert('success', 'Usuario creado correctamente.');
    });
  }

  get studentCount(): number {
    return this.createdUsers.filter((item) => item.mode === 'student').length;
  }

  get creatorCount(): number {
    return this.createdUsers.filter((item) => item.mode === 'creator').length;
  }

  private showAlert(type: AlertType, message: string): void {
    this.alertType = type;
    this.alertMessage = message;
  }

}
