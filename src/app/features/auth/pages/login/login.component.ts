import { Component, OnInit } from '@angular/core';
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
export class LoginComponent implements OnInit {

  email = '';
  password = '';
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.resetForm();
  }

  private resetForm(): void {
    this.email = '';
    this.password = '';
    this.error = '';
  }

  login() {
    this.error = '';

    this.authService.loginWithBackend(this.email, this.password).subscribe((role) => {
      if (!role) {
        this.error = 'Credenciales invalidas o token sin rol';
        return;
      }

      this.resetForm();

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
