import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CreatorCourseDraft, CreatorCourseModuleDraft } from '@app/core/models/creator-course-draft.model';
import { CreatorCourseDraftService } from '@app/core/services/creator-course-draft.service';
import {
  CreateModuleRequest,
  CreateModuleResponse,
  UpdateModuleRequest,
} from '@core/models/course-api.model';
import { CourseService } from '@core/services/course.service';
import { firstValueFrom } from 'rxjs';

type AlertType = 'success' | 'danger' | 'warning' | 'info';

type ModuleFormModel = {
  title: string;
  description: string;
  order: number;
};

type ModuleEditModel = {
  title: string;
  description: string;
};

const MODULE_TITLE_MIN_LENGTH = 2;
const MODULE_TITLE_MAX_LENGTH = 100;
const MODULE_DESCRIPTION_MIN_LENGTH = 10;
const MODULE_DESCRIPTION_MAX_LENGTH = 500;

@Component({
  selector: 'app-creator-modules',
  templateUrl: './modules.component.html',
  styleUrls: ['./modules.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class ModulesComponent implements OnChanges {
  @Input() courseId = '';
  @Output() readonly backToContent = new EventEmitter<void>();
  @Output() readonly openLessons = new EventEmitter<{ courseId: string; moduleId: string }>();
  readonly standaloneNgModelOptions = { standalone: true };

  course: CreatorCourseDraft | null = null;
  modules: CreatorCourseModuleDraft[] = [];
  hasEditPermission = false;

  showModuleForm = false;
  moduleForm: ModuleFormModel = {
    title: '',
    description: '',
    order: 1
  };

  draggedModuleIndex: number | null = null;

  editingModuleId: string | null = null;
  moduleEdit: ModuleEditModel = {
    title: '',
    description: ''
  };

  alertType: AlertType = 'info';
  alertMessage = '';
  savingModule = false;

  constructor(
    private readonly draftService: CreatorCourseDraftService,
    private readonly courseService: CourseService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['courseId']) {
      this.loadCourse();
    }
  }

  get modulesCount(): number {
    return this.modules.length;
  }

  openAddModuleForm(): void {
    if (!this.hasEditPermission) {
      this.showAlert('warning', 'No tienes permisos para editar este curso.');
      return;
    }

    this.showModuleForm = true;
    this.moduleForm.order = this.modules.length + 1;
  }

  cancelAddModuleForm(): void {
    this.showModuleForm = false;
    this.resetForm();
  }

  async addModule(): Promise<void> {
    if (!this.hasEditPermission) {
      this.showAlert('warning', 'No tienes permisos para editar este curso.');
      return;
    }

    if (this.savingModule) {
      return;
    }

    const title = this.moduleForm.title.trim();
    const description = this.moduleForm.description.trim();

    if (!title) {
      this.showAlert('danger', 'El titulo del modulo es obligatorio.');
      return;
    }

    if (title.length < MODULE_TITLE_MIN_LENGTH) {
      this.showAlert('warning', 'El titulo del modulo debe tener al menos 2 caracteres.');
      return;
    }

    if (description.length < MODULE_DESCRIPTION_MIN_LENGTH) {
      this.showAlert('warning', 'La descripcion del modulo debe tener al menos 10 caracteres.');
      return;
    }

    const backendCourseId = this.course?.backendCourseId;
    if (typeof backendCourseId !== 'number' || backendCourseId <= 0) {
      this.showAlert('danger', 'No existe courseId de backend para este curso.');
      return;
    }

    if (!this.hasConnection()) {
      this.showAlert('danger', 'Error de conexion. No se pudo registrar el modulo.');
      return;
    }

    this.savingModule = true;

    try {
      const payload = this.buildCreateModulePayload(backendCourseId, title, description);
      const response = await firstValueFrom(this.courseService.createModuleFromApi(payload));
      const backendModuleId = this.extractBackendModuleId(response);

      if (!backendModuleId) {
        this.showAlert('danger', 'Backend no devolvio el id del modulo creado.');
        return;
      }

      const boundedOrder = this.clampOrder(this.moduleForm.order, this.modules.length + 1);
      const newModule: CreatorCourseModuleDraft = {
        id: this.generateId(),
        backendModuleId,
        title: payload.title,
        description: payload.description,
        order: boundedOrder,
        lessons: []
      };

      const nextModules = [...this.modules];
      nextModules.splice(boundedOrder - 1, 0, newModule);

      this.persistModules(nextModules, 'Modulo creado en backend y asociado al curso.');
      this.resetForm();
      this.showModuleForm = true;
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        this.showAlert('danger', this.resolveCreateModuleErrorMessage(error));
        return;
      }

      this.showAlert('danger', 'No se pudo crear el modulo en backend. Ocurrio un error inesperado.');
    } finally {
      this.savingModule = false;
    }
  }

  startEditModule(module: CreatorCourseModuleDraft): void {
    if (!this.hasEditPermission) {
      this.showAlert('warning', 'No tienes permisos para editar este curso.');
      return;
    }

    this.editingModuleId = module.id;
    this.moduleEdit = {
      title: module.title,
      description: module.description
    };
  }

  cancelEditModule(): void {
    this.editingModuleId = null;
    this.moduleEdit = {
      title: '',
      description: ''
    };
  }

  async saveModuleEdition(module: CreatorCourseModuleDraft): Promise<void> {
    if (!this.hasEditPermission) {
      this.showAlert('warning', 'No tienes permisos para editar este curso.');
      return;
    }

    if (this.savingModule) {
      return;
    }

    const title = this.moduleEdit.title.trim();
    const description = this.moduleEdit.description.trim();

    if (!title) {
      this.showAlert('danger', 'El titulo del modulo es obligatorio.');
      return;
    }

    if (title.length < MODULE_TITLE_MIN_LENGTH) {
      this.showAlert('warning', 'El titulo del modulo debe tener al menos 2 caracteres.');
      return;
    }

    if (!this.hasConnection()) {
      this.showAlert('danger', 'Error de conexion. No se pudieron guardar los cambios del modulo.');
      return;
    }

    this.savingModule = true;

    try {
      const backendModuleId = await this.resolveBackendModuleIdForEdition(module, title, description);
      if (!backendModuleId) {
        return;
      }

      const payload = this.buildUpdateModulePayload(backendModuleId, title, description);
      await firstValueFrom(this.courseService.updateModuleFromApi(payload));

      const nextModules = this.modules.map((item) =>
        item.id === module.id
          ? {
              ...item,
              backendModuleId,
              title: payload.title,
              description: payload.description ?? '',
            }
          : item
      );

      this.persistModules(nextModules, 'Modulo actualizado en backend correctamente.');
      this.cancelEditModule();
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        this.showAlert('danger', this.resolveUpdateModuleErrorMessage(error));
        return;
      }

      this.showAlert('danger', 'No se pudo actualizar el modulo en backend. Ocurrio un error inesperado.');
    } finally {
      this.savingModule = false;
    }
  }

  duplicateModule(module: CreatorCourseModuleDraft): void {
    if (!this.hasEditPermission) {
      this.showAlert('warning', 'No tienes permisos para editar este curso.');
      return;
    }

    if (!this.hasConnection()) {
      this.showAlert('danger', 'Error de conexion. No se pudo duplicar el modulo.');
      return;
    }

    const moduleIndex = this.modules.findIndex((item) => item.id === module.id);
    if (moduleIndex === -1) {
      return;
    }

    const duplicatedModule: CreatorCourseModuleDraft = {
      ...module,
      id: this.generateId(),
      backendModuleId: null,
      title: `${module.title} (copia)`,
      lessons: module.lessons.map((lesson) => ({
        ...lesson,
        backendLessonId: null,
      }))
    };

    const nextModules = [...this.modules];
    nextModules.splice(moduleIndex + 1, 0, duplicatedModule);

    this.persistModules(nextModules, 'Modulo duplicado para reutilizar su estructura.');
  }

  deleteModule(module: CreatorCourseModuleDraft): void {
    if (!this.hasEditPermission) {
      this.showAlert('warning', 'No tienes permisos para editar este curso.');
      return;
    }

    if (module.lessons.length > 0 && typeof window !== 'undefined') {
      const shouldDelete = window.confirm(
        `Este modulo contiene ${module.lessons.length} lecciones. Deseas eliminarlo?`
      );
      if (!shouldDelete) {
        return;
      }
    }

    const nextModules = this.modules.filter((item) => item.id !== module.id);
    this.persistModules(nextModules, 'Modulo eliminado correctamente.');
  }

  onDragStart(index: number): void {
    if (!this.hasEditPermission) {
      return;
    }

    this.draggedModuleIndex = index;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent, targetIndex: number): void {
    event.preventDefault();

    if (!this.hasEditPermission || this.draggedModuleIndex === null) {
      return;
    }

    const sourceIndex = this.draggedModuleIndex;
    this.draggedModuleIndex = null;

    if (sourceIndex === targetIndex) {
      return;
    }

    const nextModules = [...this.modules];
    const [draggedModule] = nextModules.splice(sourceIndex, 1);

    if (!draggedModule) {
      return;
    }

    nextModules.splice(targetIndex, 0, draggedModule);
    this.persistModules(nextModules, 'Orden de modulos actualizado.');
  }

  onDragEnd(): void {
    this.draggedModuleIndex = null;
  }

  canEditModule(moduleId: string): boolean {
    return this.editingModuleId === moduleId;
  }

  getDisplayOrder(index: number): number {
    return index + 1;
  }

  trackByModuleId(_index: number, module: CreatorCourseModuleDraft): string {
    return module.id;
  }

  goBackToContent(): void {
    this.backToContent.emit();
  }

  continueToLessons(): void {
    if (!this.courseId || !this.modules.length) {
      this.showAlert('warning', 'Debes tener al menos un modulo para crear lecciones.');
      return;
    }

    this.openLessons.emit({
      courseId: this.courseId,
      moduleId: this.modules[0].id
    });
  }

  openLessonsForModule(moduleId: string): void {
    if (!this.courseId) {
      this.showAlert('warning', 'No se encontro el curso para crear lecciones.');
      return;
    }

    this.openLessons.emit({
      courseId: this.courseId,
      moduleId
    });
  }

  private loadCourse(): void {
    this.alertMessage = '';
    this.editingModuleId = null;
    this.showModuleForm = false;

    if (!this.courseId) {
      this.course = null;
      this.modules = [];
      this.hasEditPermission = false;
      return;
    }

    const draft = this.draftService.getDraftById(this.courseId);
    if (!draft) {
      this.course = null;
      this.modules = [];
      this.hasEditPermission = false;
      this.showAlert('danger', 'No se encontro el curso en borrador para editar modulos.');
      return;
    }

    this.course = draft;
    this.modules = this.normalizeOrder(draft.modules);
    // Legacy drafts without explicit status are still editable as draft.
    this.hasEditPermission = !draft.status || draft.status === 'draft';
    this.resetForm();
    this.showModuleForm = this.hasEditPermission;

    if (!this.hasEditPermission) {
      this.showAlert('warning', 'Este curso no tiene permisos de edicion.');
    }
  }

  private persistModules(nextModules: CreatorCourseModuleDraft[], successMessage: string): void {
    const updatedDraft = this.draftService.updateDraftModules(this.courseId, this.normalizeOrder(nextModules));

    if (!updatedDraft) {
      this.showAlert('danger', 'No se pudo guardar la estructura del curso.');
      return;
    }

    this.course = updatedDraft;
    this.modules = this.normalizeOrder(updatedDraft.modules);
    this.moduleForm.order = this.modules.length + 1;
    this.showAlert('success', successMessage);
  }

  private normalizeOrder(modules: CreatorCourseModuleDraft[]): CreatorCourseModuleDraft[] {
    return [...modules]
      .sort((a, b) => a.order - b.order)
      .map((module, index) => ({
        ...module,
        order: index + 1,
        lessons: [...module.lessons]
      }));
  }

  private buildCreateModulePayload(
    backendCourseId: number,
    title: string,
    description: string
  ): CreateModuleRequest {
    return {
      courseId: backendCourseId,
      title: this.trimToMaxLength(title, MODULE_TITLE_MAX_LENGTH),
      description: this.trimToMaxLength(description, MODULE_DESCRIPTION_MAX_LENGTH),
    };
  }

  private buildUpdateModulePayload(
    backendModuleId: number,
    title: string,
    description: string
  ): UpdateModuleRequest {
    return {
      id: backendModuleId,
      title: this.trimToMaxLength(title, MODULE_TITLE_MAX_LENGTH),
      description: this.trimToMaxLength(description, MODULE_DESCRIPTION_MAX_LENGTH),
    };
  }

  private async resolveBackendModuleIdForEdition(
    module: CreatorCourseModuleDraft,
    title: string,
    description: string
  ): Promise<number | null> {
    if (typeof module.backendModuleId === 'number' && module.backendModuleId > 0) {
      return module.backendModuleId;
    }

    const backendCourseId = this.course?.backendCourseId;
    if (typeof backendCourseId !== 'number' || backendCourseId <= 0) {
      this.showAlert('danger', 'No existe courseId de backend para este curso.');
      return null;
    }

    if (description.length < MODULE_DESCRIPTION_MIN_LENGTH) {
      this.showAlert(
        'warning',
        'Este modulo no estaba sincronizado con backend. Ingresa una descripcion de al menos 10 caracteres para sincronizarlo.'
      );
      return null;
    }

    try {
      const createPayload = this.buildCreateModulePayload(backendCourseId, title, description);
      const createResponse = await firstValueFrom(this.courseService.createModuleFromApi(createPayload));
      const backendModuleId = this.extractBackendModuleId(createResponse);

      if (!backendModuleId) {
        this.showAlert('danger', 'No se pudo sincronizar el modulo para su actualizacion.');
        return null;
      }

      const wasPersisted = this.persistModuleBackendIdWithoutAlert(module.id, backendModuleId);
      return wasPersisted ? backendModuleId : null;
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        this.showAlert('danger', this.resolveCreateModuleErrorMessage(error));
        return null;
      }

      this.showAlert('danger', 'No se pudo sincronizar el modulo en backend. Ocurrio un error inesperado.');
      return null;
    }
  }

  private persistModuleBackendIdWithoutAlert(moduleId: string, backendModuleId: number): boolean {
    const nextModules = this.modules.map((module) =>
      module.id === moduleId
        ? {
            ...module,
            backendModuleId,
          }
        : module
    );

    const updatedDraft = this.draftService.updateDraftModules(this.courseId, this.normalizeOrder(nextModules));
    if (!updatedDraft) {
      this.showAlert('danger', 'No se pudo guardar el enlace del modulo con backend.');
      return false;
    }

    this.course = updatedDraft;
    this.modules = this.normalizeOrder(updatedDraft.modules);
    return true;
  }

  private extractBackendModuleId(response: CreateModuleResponse): number | null {
    if (typeof response.id === 'number') {
      return response.id;
    }

    if (typeof response.moduleId === 'number') {
      return response.moduleId;
    }

    return null;
  }

  private resolveCreateModuleErrorMessage(error: HttpErrorResponse): string {
    const backendMessage = this.resolveBackendErrorMessage(error);
    if (backendMessage) {
      return `No se pudo crear el modulo: ${backendMessage}`;
    }

    return `No se pudo crear el modulo en backend (status ${error.status || 0}).`;
  }

  private resolveUpdateModuleErrorMessage(error: HttpErrorResponse): string {
    const backendMessage = this.resolveBackendErrorMessage(error);
    if (backendMessage) {
      return `No se pudo actualizar el modulo: ${backendMessage}`;
    }

    return `No se pudo actualizar el modulo en backend (status ${error.status || 0}).`;
  }

  private resolveBackendErrorMessage(error: HttpErrorResponse): string | null {
    const details = error.error;

    if (typeof details === 'string' && details.trim().length > 0) {
      return details.trim();
    }

    if (!details || typeof details !== 'object') {
      return null;
    }

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

    return this.serializeErrorDetails(details);
  }

  private extractValidationArrayMessage(record: Record<string, unknown>): string | null {
    const candidates = ['errors', 'violations', 'fieldErrors'];

    for (const key of candidates) {
      const candidate = record[key];
      if (!Array.isArray(candidate)) {
        continue;
      }

      const messages: string[] = [];
      for (const item of candidate) {
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

      return serialized.length > 260 ? `${serialized.slice(0, 260)}...` : serialized;
    } catch {
      return null;
    }
  }

  private trimToMaxLength(value: string, maxLength: number): string {
    if (value.length <= maxLength) {
      return value;
    }

    return value.slice(0, maxLength);
  }

  private hasConnection(): boolean {
    return typeof navigator === 'undefined' || navigator.onLine;
  }

  private clampOrder(orderValue: number, max: number): number {
    if (!Number.isFinite(orderValue)) {
      return max;
    }

    const normalized = Math.floor(orderValue);
    if (normalized < 1) {
      return 1;
    }

    return normalized > max ? max : normalized;
  }

  private resetForm(): void {
    this.moduleForm = {
      title: '',
      description: '',
      order: this.modules.length + 1
    };
  }

  private generateId(): string {
    return `${Date.now()}-${Math.floor(Math.random() * 100_000)}`;
  }

  private showAlert(type: AlertType, message: string): void {
    this.alertType = type;
    this.alertMessage = message;
  }
}
