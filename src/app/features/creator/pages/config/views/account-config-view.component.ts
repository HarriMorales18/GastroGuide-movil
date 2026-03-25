import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { addIcons } from 'ionicons';
import { alertCircleOutline, lockClosedOutline, checkmarkCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-account-config-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './account-config-view.component.html',
  styleUrl: './account-config-view.component.scss'
})
export class AccountConfigViewComponent {
  showPasswordForm = signal(false);
  passwordForm: FormGroup;
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
  isSubmitting = signal(false);

  constructor(private readonly fb: FormBuilder) {
    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', [Validators.required]],
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]]
      },
      { validators: this.passwordMatchValidator }
    );

    addIcons({
      lockClosedOutline,
      alertCircleOutline,
      checkmarkCircleOutline
    });
  }

  togglePasswordForm(): void {
    this.showPasswordForm.set(!this.showPasswordForm());
    this.successMessage.set(null);
    this.errorMessage.set(null);
    this.passwordForm.reset();
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

    this.isSubmitting.set(true);
    // Simular cambio de contraseña
    setTimeout(() => {
      this.successMessage.set('Contraseña actualizada correctamente');
      this.isSubmitting.set(false);
      this.showPasswordForm.set(false);
      this.passwordForm.reset();
    }, 1500);
  }
}
