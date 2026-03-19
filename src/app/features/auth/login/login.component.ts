import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  email = '';
  password = '';
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login() {
    const user = this.authService.login(this.email, this.password);

    if (!user) {
      this.error = 'Credenciales inválidas';
      return;
    }

    // 🔥 REDIRECCIÓN POR ROL
    switch (user.role) {
      case 'student':
        this.router.navigate(['/student']);
        break;
      case 'creator':
        this.router.navigate(['/creator']);
        break;
      case 'admin':
        this.router.navigate(['/admin']);
        break;
    }
  }
}