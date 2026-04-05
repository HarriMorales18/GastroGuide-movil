import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { AuthApiError } from 'src/app/core/models/auth/auth-api-error.model';

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
  readonly identificationTypeOptions: string[] = ['CC', 'CE', 'TI', 'PASAPORTE'];

  username = '';
  email = '';
  password = '';

  firstName = '';
  lastName = '';
  identificationNumber = '';
  identificationType = 'CC';
  nationality = 'Colombiana';
  avatarUrl = '';
  avatarFileName = '';
  phoneNumber = '';
  birthDate = '';
  specialization = '';

  loading = false;
  error = '';
  success = '';

  private avatarObjectUrl: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnDestroy(): void {
    this.revokeAvatarObjectUrl();
  }

  selectMode(mode: RegisterMode) {
    this.mode = mode;
    this.error = '';
    this.success = '';

    if (mode === 'student') {
      this.resetCreatorFields();
    }
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

    if (this.mode === 'creator') {
      const requiredCreatorFields = [
        this.firstName.trim(),
        this.lastName.trim(),
        this.identificationNumber.trim(),
        this.identificationType.trim(),
        this.nationality.trim(),
        this.avatarUrl.trim(),
        this.phoneNumber.trim(),
        this.birthDate,
        this.specialization.trim(),
      ];

      if (requiredCreatorFields.some((value) => !value)) {
        this.error = 'Completa todos los datos requeridos para registrar creador.';
        return;
      }
    }

    this.loading = true;

    if (this.mode === 'creator') {
      console.info('Submitting creator registration payload', {
        endpoint: '/api/creator/create',
        email: this.email.trim(),
        firstName: this.firstName.trim(),
        lastName: this.lastName.trim(),
        identificationNumber: this.identificationNumber.trim(),
        identificationType: this.identificationType,
        nationality: this.nationality.trim(),
        avatarUrlScheme: this.avatarUrl.split(':')[0] || 'unknown',
        avatarUrlLength: this.avatarUrl.length,
        phoneNumber: this.phoneNumber.trim(),
        birthDate: this.birthDate,
        specialization: this.specialization.trim(),
      });
    }

    const request$ = this.mode === 'student'
      ? this.authService.registerStudent({
          username: this.username,
          email: this.email,
          password: this.password,
        })
      : this.authService.registerCreator({
          email: this.email,
          password: this.password,
          firstName: this.firstName.trim(),
          lastName: this.lastName.trim(),
          identificationNumber: this.identificationNumber.trim(),
          identificationType: this.identificationType,
          nationality: this.nationality.trim(),
          avatarUrl: this.avatarUrl.trim(),
          phoneNumber: this.phoneNumber.trim(),
          birthDate: this.birthDate,
          specialization: this.specialization.trim(),
        });

    request$.subscribe((ok) => {
      this.loading = false;

      if (!ok) {
        this.error = this.resolveRegisterErrorMessage();
        return;
      }

      this.success = 'Registro exitoso. Inicia sesion con tu cuenta.';
      setTimeout(() => {
        this.router.navigate(['/']);
      }, 1000);
    });
  }

  onAvatarSelected(event: Event): void {
    this.error = '';

    const input = event.target as HTMLInputElement;
    const selectedFile = input.files?.item(0);

    if (!selectedFile) {
      this.revokeAvatarObjectUrl();
      this.avatarUrl = '';
      this.avatarFileName = '';
      return;
    }

    if (!selectedFile.type.startsWith('image/')) {
      this.error = 'Selecciona una imagen valida desde la galeria.';
      input.value = '';
      this.revokeAvatarObjectUrl();
      this.avatarUrl = '';
      this.avatarFileName = '';
      return;
    }

    this.revokeAvatarObjectUrl();
    this.avatarObjectUrl = URL.createObjectURL(selectedFile);
    this.avatarUrl = this.avatarObjectUrl;
    this.avatarFileName = selectedFile.name;
  }

  private resetCreatorFields(): void {
    this.revokeAvatarObjectUrl();
    this.firstName = '';
    this.lastName = '';
    this.identificationNumber = '';
    this.identificationType = 'CC';
    this.nationality = 'Colombiana';
    this.avatarUrl = '';
    this.avatarFileName = '';
    this.phoneNumber = '';
    this.birthDate = '';
    this.specialization = '';
  }

  private revokeAvatarObjectUrl(): void {
    if (this.avatarObjectUrl) {
      URL.revokeObjectURL(this.avatarObjectUrl);
      this.avatarObjectUrl = null;
    }
  }

  private resolveRegisterErrorMessage(): string {
    const apiError = this.authService.getLastApiError();
    if (!apiError) {
      return 'No se pudo registrar. Verifica los datos e intenta de nuevo.';
    }

    const backendMessage = this.extractBackendErrorMessage(apiError);
    return backendMessage
      ? `No se pudo registrar (${apiError.status}): ${backendMessage}`
      : `No se pudo registrar (${apiError.status}) en ${apiError.endpoint}.`;
  }

  private extractBackendErrorMessage(apiError: AuthApiError): string | null {
    const details = apiError.details;

    if (typeof details === 'string' && details.trim().length > 0) {
      return details.trim();
    }

    if (!details || typeof details !== 'object') {
      return null;
    }

    const detailsRecord = details as Record<string, unknown>;
    const candidates = [
      detailsRecord['message'],
      detailsRecord['error'],
      detailsRecord['detail'],
    ];

    for (const candidate of candidates) {
      if (typeof candidate === 'string' && candidate.trim().length > 0) {
        return candidate.trim();
      }
    }

    return null;
  }
}
