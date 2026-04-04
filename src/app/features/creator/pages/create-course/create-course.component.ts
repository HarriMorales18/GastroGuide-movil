import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@core/services/auth.service';
import {
  CreateCourseRequest,
  CreateCourseResponse,
  UpdateCourseRequest,
} from '@core/models/course-api.model';
import { CourseService } from '@core/services/course.service';
import {
  CREATOR_COURSE_DIFFICULTIES,
  CreatorCourseDifficulty,
  CreatorCourseDraft
} from '@app/core/models/creator-course-draft.model';
import { CreatorCourseDraftService } from '@app/core/services/creator-course-draft.service';
import { firstValueFrom } from 'rxjs';

type AlertType = 'success' | 'danger' | 'warning' | 'info';

type CreateCourseErrors = {
  title: boolean;
  description: boolean;
  category: boolean;
  cuisineType: boolean;
  difficulty: boolean;
  coverImage: boolean;
};

type CategoryOption = {
  label: string;
  apiValue: string;
};

type CuisineTypeOption = {
  label: string;
  value: string;
};

const DIFFICULTY_TO_API_MAP: Record<CreatorCourseDifficulty, string> = {
  principiante: 'BEGINNER',
  intermedio: 'INTERMEDIATE',
  avanzado: 'ADVANCED'
};

const CATEGORY_OPTIONS: CategoryOption[] = [
  { label: 'Tecnicas basicas', apiValue: 'BASIC_TECHNIQUES' },
  { label: 'Pasteleria', apiValue: 'PASTRY' },
  { label: 'Cocina internacional', apiValue: 'INTERNATIONAL_CUISINE' },
  { label: 'Mixologia', apiValue: 'MIXOLOGY' },
  { label: 'Gestion de restaurante', apiValue: 'RESTAURANT_MANAGEMENT' },
  { label: 'Cocina molecular', apiValue: 'MOLECULAR_CUISNE' },
  { label: 'Panaderia', apiValue: 'BAKING' },
  { label: 'Sommelier', apiValue: 'SMMELIER' },
  { label: 'Nutricion', apiValue: 'NUTRION' },
  { label: 'Fotografia gastronomica', apiValue: 'FOOD_PHOTOGRAPHY' }
];

const CUISINE_TYPE_OPTIONS: CuisineTypeOption[] = [
  { label: 'Italiana', value: 'ITALIAN' },
  { label: 'Francesa', value: 'FRENCH' },
  { label: 'Asiatica', value: 'ASIAN' },
  { label: 'Latinoamericana', value: 'LATIN_AMERICAN' },
  { label: 'Fusion', value: 'FUSION' },
  { label: 'Mediterranea', value: 'MEDITERRANEAN' },
  { label: 'Medio oriental', value: 'MIDDLE_EASTERN' },
  { label: 'Africana', value: 'AFRICAN' },
  { label: 'Americana', value: 'AMERICAN' },
  { label: 'Sin cocina especifica', value: 'NONE' },
  { label: 'Otra', value: 'OTHER' }
];

@Component({
  selector: 'app-create-course',
  templateUrl: './create-course.component.html',
  styleUrls: ['./create-course.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class CreateCourseComponent {
  @Output() readonly draftCreated = new EventEmitter<CreatorCourseDraft>();

  readonly categoryOptions: CategoryOption[] = CATEGORY_OPTIONS;
  readonly cuisineTypeOptions: CuisineTypeOption[] = CUISINE_TYPE_OPTIONS;
  difficulties: CreatorCourseDifficulty[] = CREATOR_COURSE_DIFFICULTIES;

  courseTitle = '';
  courseDescription = '';
  selectedCategory = '';
  selectedCuisineType = '';
  selectedDifficulty: CreatorCourseDifficulty | '' = '';

  coverImageDataUrl = '';
  coverImageName = '';
  coverImageObjectUrl = '';

  creatingCourse = false;

  alertType: AlertType = 'info';
  alertMessage = '';
  errors: CreateCourseErrors = this.buildEmptyErrors();

  constructor(
    private readonly draftService: CreatorCourseDraftService,
    private readonly courseService: CourseService,
    private readonly authService: AuthService
  ) {}

  ngOnDestroy(): void {
    this.revokeCoverImageObjectUrl();
  }

  onCoverSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selectedFile = input.files?.item(0);

    if (!selectedFile) {
      this.coverImageDataUrl = '';
      this.coverImageName = '';
      this.revokeCoverImageObjectUrl();
      return;
    }

    if (!selectedFile.type.startsWith('image/')) {
      this.showAlert('danger', 'Selecciona un archivo de imagen valido para la portada.');
      input.value = '';
      return;
    }

    this.revokeCoverImageObjectUrl();
    this.coverImageObjectUrl = URL.createObjectURL(selectedFile);

    const reader = new FileReader();
    reader.onload = () => {
      const loadedValue = reader.result;
      if (typeof loadedValue !== 'string') {
        this.showAlert('danger', 'No se pudo procesar la imagen seleccionada.');
        return;
      }

      this.coverImageDataUrl = loadedValue;
      this.coverImageName = selectedFile.name;
      this.errors.coverImage = false;
    };
    reader.readAsDataURL(selectedFile);
  }

  createDraftCourse(): void {
    if (!this.validateRequiredFields()) {
      this.showAlert('warning', 'Completa todos los campos obligatorios para crear el curso.');
      return;
    }

    if (this.authService.getRole() !== 'creator') {
      this.showAlert('danger', 'Debes iniciar sesion como creador para crear cursos.');
      return;
    }

    if (!this.authService.getAccessToken()) {
      this.showAlert('danger', 'Tu sesion no tiene token activo. Vuelve a iniciar sesion e intenta de nuevo.');
      return;
    }

    if (this.courseTitle.trim().length < 2) {
      this.errors.title = true;
      this.showAlert('warning', 'El titulo debe tener al menos 2 caracteres.');
      return;
    }

    if (this.courseDescription.trim().length < 10) {
      this.errors.description = true;
      this.showAlert('warning', 'La descripcion debe tener al menos 10 caracteres.');
      return;
    }

    const payload = this.buildCreateCoursePayload();
    this.creatingCourse = true;

    this.submitCreateCourse(payload);
  }

  hasError(field: keyof CreateCourseErrors): boolean {
    return this.errors[field];
  }

  private validateRequiredFields(): boolean {
    const nextErrors: CreateCourseErrors = {
      title: !this.courseTitle.trim(),
      description: !this.courseDescription.trim(),
      category: !this.selectedCategory,
      cuisineType: !this.selectedCuisineType,
      difficulty: !this.selectedDifficulty,
      coverImage: !this.coverImageDataUrl
    };

    this.errors = nextErrors;
    return !Object.values(nextErrors).some((value) => value);
  }

  private resetForm(): void {
    this.courseTitle = '';
    this.courseDescription = '';
    this.selectedCategory = '';
    this.selectedCuisineType = '';
    this.selectedDifficulty = '';
    this.coverImageDataUrl = '';
    this.coverImageName = '';
    this.revokeCoverImageObjectUrl();
    this.errors = this.buildEmptyErrors();
  }

  private buildEmptyErrors(): CreateCourseErrors {
    return {
      title: false,
      description: false,
      category: false,
      cuisineType: false,
      difficulty: false,
      coverImage: false
    };
  }

  private buildCreateCoursePayload(): CreateCourseRequest {
    return {
      title: this.courseTitle.trim(),
      description: this.courseDescription.trim(),
      difficultyLevel: DIFFICULTY_TO_API_MAP[this.selectedDifficulty as CreatorCourseDifficulty],
      category: this.selectedCategory,
      cuisineType: this.selectedCuisineType
    };
  }

  private submitCreateCourse(payload: CreateCourseRequest): void {
    console.info('Submitting create course payload', {
      endpoint: '/api/courses/create',
      payload,
    });

    this.courseService.createCourseFromApi(payload).subscribe({
      next: async (response) => {
        const metadataSync = await this.syncExtendedCourseMetadata(response, payload);
        this.creatingCourse = false;
        this.finishCreateCourseFlow(response, metadataSync.warningMessage);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Create course request failed', {
          endpoint: '/api/courses/create',
          status: error.status,
          message: error.message,
          details: error.error,
          payload,
        });

        this.creatingCourse = false;
        this.showAlert('danger', this.resolveCreateCourseErrorMessage(error));
      }
    });
  }

  private async syncExtendedCourseMetadata(
    response: CreateCourseResponse,
    createPayload: CreateCourseRequest
  ): Promise<{ warningMessage: string | null }> {
    const backendCourseId = this.extractBackendCourseId(response);
    if (!backendCourseId) {
      return {
        warningMessage:
          'Curso creado sin backendCourseId de respuesta. No se pudo confirmar sincronizacion de categoria, tipo de cocina, dificultad y portada.',
      };
    }

    const updatePayload = this.buildUpdateCoursePayload(createPayload);
    console.info('Submitting update course payload', {
      endpoint: `/api/courses/${backendCourseId}`,
      payload: updatePayload,
    });

    try {
      await firstValueFrom(this.courseService.updateCourseFromApi(backendCourseId, updatePayload));
      return { warningMessage: null };
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        console.error('Update course request failed', {
          endpoint: `/api/courses/${backendCourseId}`,
          status: error.status,
          message: error.message,
          details: error.error,
          payload: updatePayload,
        });

        return {
          warningMessage:
            `Curso creado, pero no se pudo sincronizar metadata extendida: ${this.resolveUpdateCourseErrorMessage(error)}`,
        };
      }

      return {
        warningMessage: 'Curso creado, pero ocurrio un error inesperado al sincronizar metadata extendida.',
      };
    }
  }

  private buildUpdateCoursePayload(createPayload: CreateCourseRequest): UpdateCourseRequest {
    return {
      title: createPayload.title,
      description: createPayload.description,
      difficultyLevel: createPayload.difficultyLevel,
      category: createPayload.category,
      cuisineType: createPayload.cuisineType,
      coverImageUrl: this.resolveCoverImageUrlForBackend(),
    };
  }

  private resolveCoverImageUrlForBackend(): string {
    if (this.coverImageObjectUrl.trim().length > 0 && this.coverImageObjectUrl.length <= 500) {
      return this.coverImageObjectUrl;
    }

    if (this.coverImageDataUrl.trim().length > 0 && this.coverImageDataUrl.length <= 500) {
      return this.coverImageDataUrl;
    }

    return this.coverImageName.trim();
  }

  private revokeCoverImageObjectUrl(): void {
    if (this.coverImageObjectUrl) {
      URL.revokeObjectURL(this.coverImageObjectUrl);
      this.coverImageObjectUrl = '';
    }
  }

  private finishCreateCourseFlow(response: CreateCourseResponse, warningMessage: string | null = null): void {
    const draft = this.draftService.createDraft({
      backendCourseId: this.extractBackendCourseId(response),
      title: this.courseTitle.trim(),
      description: this.courseDescription.trim(),
      category: this.mapCategoryToDisplayLabel(this.selectedCategory),
      cuisineType: this.selectedCuisineType,
      difficulty: this.selectedDifficulty as CreatorCourseDifficulty,
      coverImageDataUrl: this.coverImageDataUrl
    });

    if (warningMessage) {
      this.showAlert('warning', warningMessage);
    } else {
      this.showAlert('success', 'Curso creado en backend y guardado en borrador para continuar la edicion.');
    }
    this.resetForm();
    this.draftCreated.emit(draft);
  }

  private mapCategoryToDisplayLabel(apiValue: string): string {
    const found = this.categoryOptions.find((item) => item.apiValue === apiValue);
    return found?.label || apiValue;
  }

  private extractBackendCourseId(response: CreateCourseResponse): number | null {
    if (typeof response.id === 'number') {
      return response.id;
    }

    if (typeof response.courseId === 'number') {
      return response.courseId;
    }

    return null;
  }

  private resolveCreateCourseErrorMessage(error: HttpErrorResponse): string {
    const details = error.error;

    if (typeof details === 'string' && details.trim().length > 0) {
      return `No se pudo crear el curso: ${details}`;
    }

    if (details && typeof details === 'object') {
      const record = details as Record<string, unknown>;
      const arrayMessage = this.extractValidationArrayMessage(record);
      if (arrayMessage) {
        return `No se pudo crear el curso: ${arrayMessage}`;
      }

      const objectMessage = this.extractValidationObjectMessage(record);
      if (objectMessage) {
        return `No se pudo crear el curso: ${objectMessage}`;
      }

      const message = record['message'] || record['error'] || record['detail'];
      if (typeof message === 'string' && message.trim().length > 0) {
        return `No se pudo crear el curso: ${message.trim()}`;
      }

      const serializedDetails = this.serializeErrorDetails(details);
      if (serializedDetails) {
        return `No se pudo crear el curso (${error.status || 0}): ${serializedDetails}`;
      }
    }

    return `No se pudo crear el curso en backend (status ${error.status || 0}).`;
  }

  private resolveUpdateCourseErrorMessage(error: HttpErrorResponse): string {
    const details = error.error;

    if (typeof details === 'string' && details.trim().length > 0) {
      return details.trim();
    }

    if (details && typeof details === 'object') {
      const record = details as Record<string, unknown>;
      const arrayMessage = this.extractValidationArrayMessage(record);
      if (arrayMessage) {
        return arrayMessage;
      }

      const objectMessage = this.extractValidationObjectMessage(record);
      if (objectMessage) {
        return objectMessage;
      }

      const message = record['message'] || record['error'] || record['detail'];
      if (typeof message === 'string' && message.trim().length > 0) {
        return message.trim();
      }

      const serializedDetails = this.serializeErrorDetails(details);
      if (serializedDetails) {
        return serializedDetails;
      }
    }

    return `status ${error.status || 0}`;
  }

  private showAlert(type: AlertType, message: string): void {
    this.alertType = type;
    this.alertMessage = message;
  }

  private extractValidationArrayMessage(record: Record<string, unknown>): string | null {
    const candidates = ['errors', 'violations', 'fieldErrors'];

    for (const candidateKey of candidates) {
      const candidateValue = record[candidateKey];
      if (!Array.isArray(candidateValue)) {
        continue;
      }

      const messages: string[] = [];
      for (const item of candidateValue) {
        if (typeof item === 'string' && item.trim().length > 0) {
          messages.push(item.trim());
          continue;
        }

        if (item && typeof item === 'object') {
          const itemRecord = item as Record<string, unknown>;
          const rawMessage = itemRecord['message'] || itemRecord['defaultMessage'] || itemRecord['error'];
          if (typeof rawMessage === 'string' && rawMessage.trim().length > 0) {
            messages.push(rawMessage.trim());
          }
        }
      }

      if (messages.length > 0) {
        return messages.join(' | ');
      }
    }

    return null;
  }

  private extractValidationObjectMessage(record: Record<string, unknown>): string | null {
    const rawErrors = record['errors'];
    if (!rawErrors || typeof rawErrors !== 'object' || Array.isArray(rawErrors)) {
      return null;
    }

    const messages: string[] = [];
    for (const [field, value] of Object.entries(rawErrors as Record<string, unknown>)) {
      if (typeof value === 'string' && value.trim().length > 0) {
        messages.push(`${field}: ${value.trim()}`);
        continue;
      }

      if (Array.isArray(value)) {
        for (const item of value) {
          if (typeof item === 'string' && item.trim().length > 0) {
            messages.push(`${field}: ${item.trim()}`);
            continue;
          }

          if (item && typeof item === 'object') {
            const itemRecord = item as Record<string, unknown>;
            const message = itemRecord['message'] || itemRecord['defaultMessage'] || itemRecord['error'];
            if (typeof message === 'string' && message.trim().length > 0) {
              messages.push(`${field}: ${message.trim()}`);
            }
          }
        }
        continue;
      }

      if (value && typeof value === 'object') {
        const valueRecord = value as Record<string, unknown>;
        const message = valueRecord['message'] || valueRecord['defaultMessage'] || valueRecord['error'];
        if (typeof message === 'string' && message.trim().length > 0) {
          messages.push(`${field}: ${message.trim()}`);
        }
      }
    }

    return messages.length > 0 ? messages.join(' | ') : null;
  }

  private serializeErrorDetails(details: unknown): string | null {
    try {
      const serialized = JSON.stringify(details);
      if (!serialized || serialized === '{}') {
        return null;
      }

      return serialized.length > 260
        ? `${serialized.slice(0, 260)}...`
        : serialized;
    } catch {
      return null;
    }
  }
}
