import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { addIcons } from 'ionicons';
import { alertCircleOutline, lockClosedOutline } from 'ionicons/icons';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIf],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss', './account.component2.scss']
})
export class AccountComponent {
  showPasswordForm = signal(false);
  passwordForm: FormGroup;
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  constructor(private readonly fb: FormBuilder) {
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    addIcons({
      lockClosedOutline,
      alertCircleOutline
    });
  }

  togglePasswordForm(): void {
    this.showPasswordForm.set(!this.showPasswordForm());
    this.successMessage.set(null);
    this.errorMessage.set(null);
  }

  passwordMatchValidator(group: FormGroup): { [key: string]: any } | null {
    const password = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.errorMessage.set('Por favor completa todos los campos correctamente');
      return;
    }

    this.successMessage.set('Contraseña cambiada exitosamente');
    this.passwordForm.reset();
    this.showPasswordForm.set(false);
  }

  cancelPasswordChange(): void {
    this.passwordForm.reset();
    this.showPasswordForm.set(false);
    this.errorMessage.set(null);
  }
}
