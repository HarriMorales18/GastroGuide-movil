import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
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
    this.error = '';

    this.authService.loginWithBackend(this.email, this.password).subscribe((role) => {
      if (!role) {
        this.error = 'Credenciales invalidas o token sin rol';
        return;
      }

      switch (role) {
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
    });
  }
}
