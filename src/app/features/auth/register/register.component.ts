import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth';

type RegisterMode = 'student' | 'creator';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
})
export class RegisterComponent {

  mode: RegisterMode = 'student';

  username = '';
  email = '';
  password = '';

  firstName = '';
  lastName = '';

  loading = false;
  error = '';
  success = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  selectMode(mode: RegisterMode) {
    this.mode = mode;
    this.error = '';
    this.success = '';
  }

  register() {
    this.error = '';
    this.success = '';

    if (!this.email || !this.password) {
      this.error = 'Email y password son obligatorios';
      return;
    }

    if (this.mode === 'student' && !this.username) {
      this.error = 'El username es obligatorio para estudiante';
      return;
    }

    if (this.mode === 'creator' && (!this.firstName || !this.lastName)) {
      this.error = 'Nombre y apellido son obligatorios para creador';
      return;
    }

    this.loading = true;

    const request$ = this.mode === 'student'
      ? this.authService.registerStudent({
          username: this.username,
          email: this.email,
          password: this.password,
        })
      : this.authService.registerCreator({
          email: this.email,
          password: this.password,
          firstName: this.firstName,
          lastName: this.lastName,
        });

    request$.subscribe((ok) => {
      this.loading = false;

      if (!ok) {
        this.error = 'No se pudo registrar. Verifica los datos e intenta de nuevo.';
        return;
      }

      this.success = 'Registro exitoso. Inicia sesion con tu cuenta.';
      this.router.navigate(['/']);
    });
  }
}
