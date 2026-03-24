import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-account-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIf],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './account-settings.component.html',
  styleUrl: './account-settings.component.scss'
})
export class AccountSettingsComponent {
  showPasswordForm = signal(false);
  passwordForm: FormGroup;
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  constructor(private fb: FormBuilder) {
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
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

    // TODO: Integrar con servicio de autenticación
    console.log('Cambiar contraseña:', this.passwordForm.value);

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
