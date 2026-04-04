import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
})
export class ForgotPasswordComponent {

  email = '';
  loading = false;
  error = '';
  success = '';

  constructor(private authService: AuthService) {}

  requestRecovery(): void {
    this.error = '';
    this.success = '';

    if (!this.email) {
      this.error = 'Debes ingresar un correo electronico';
      return;
    }

    this.loading = true;
    this.authService.recoverPassword({ email: this.email.trim() }).subscribe((ok) => {
      this.loading = false;

      if (!ok) {
        this.error = 'No se pudo enviar la solicitud de recuperacion. Intenta de nuevo.';
        return;
      }

      this.success = 'Si el correo existe, recibiras instrucciones para recuperar tu cuenta.';
      this.email = '';
    });
  }

}
