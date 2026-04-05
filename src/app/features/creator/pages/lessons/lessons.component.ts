import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  CreatorCourseDraft,
  CreatorCourseLessonDraft,
  CreatorCourseResourceType,
  CreatorCourseLessonResource,
  CreatorCourseModuleDraft
} from '@app/core/models/creator-course-draft.model';
import {
  CreateLessonRequest,
  CreateLessonResponse,
  CreateModuleRequest,
  CreateModuleResponse,
} from '@core/models/course-api.model';
import { CreatorCourseDraftService } from '@app/core/services/creator-course-draft.service';
import { AuthService } from '@core/services/auth.service';
import { CourseService } from '@core/services/course.service';
import { firstValueFrom } from 'rxjs';

type AlertType = 'success' | 'danger' | 'warning' | 'info';
type UploadState = 'idle' | 'uploading' | 'paused' | 'uploaded' | 'processing' | 'processed' | 'failed';

type LessonFormModel = {
  title: string;
  description: string;
  order: number;
  isFreePreview: boolean;
};

type ResourceFormModel = {
  targetScope: 'lesson' | 'course';
  lessonId: string;
  type: CreatorCourseResourceType;
  title: string;
  externalUrl: string;
};

type LessonResourceOption = {
  moduleId: string;
  moduleTitle: string;
  lessonId: string;
  lessonTitle: string;
};

type SelectedResourceLesson = {
  moduleId: string;
  module: CreatorCourseModuleDraft;
  lesson: CreatorCourseLessonDraft;
};

const ACCEPTED_VIDEO_MIME_TYPES = new Set<string>(['video/mp4', 'video/quicktime', 'video/x-msvideo']);
const ACCEPTED_VIDEO_EXTENSIONS = new Set<string>(['mp4', 'mov', 'avi']);
const MAX_VIDEO_SIZE_MB = 250;
const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;

const ACCEPTED_RESOURCE_PDF_MIME_TYPES = new Set<string>(['application/pdf']);
const ACCEPTED_RESOURCE_PDF_EXTENSIONS = new Set<string>(['pdf']);

const ACCEPTED_RESOURCE_IMAGE_MIME_TYPES = new Set<string>([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp'
]);
const ACCEPTED_RESOURCE_IMAGE_EXTENSIONS = new Set<string>(['png', 'jpg', 'jpeg', 'webp']);

const MAX_RESOURCE_SIZE_MB = 20;
const MAX_RESOURCE_SIZE_BYTES = MAX_RESOURCE_SIZE_MB * 1024 * 1024;
const MODULE_TITLE_MAX_LENGTH = 100;
const MODULE_DESCRIPTION_MIN_LENGTH = 10;
const MODULE_DESCRIPTION_MAX_LENGTH = 500;

@Component({
  selector: 'app-lessons',
  templateUrl: './lessons.component.html',
  styleUrls: ['./lessons.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class LessonsComponent implements OnChanges, OnDestroy {
  @Input() courseId = '';
  @Input() initialModuleId = '';
  @Output() readonly backToModules = new EventEmitter<void>();
  readonly standaloneNgModelOptions = { standalone: true };

  course: CreatorCourseDraft | null = null;
  modules: CreatorCourseModuleDraft[] = [];
  selectedModuleId = '';

  hasEditPermission = false;
  isCreatorAuthenticated = false;

  showLessonForm = false;
  lessonForm: LessonFormModel = this.buildEmptyLessonForm();

  showResourceForm = false;
  resourceForm: ResourceFormModel = this.buildEmptyResourceForm();

  selectedResourceFile: File | null = null;
  selectedResourceFileName = '';
  selectedResourceFileMimeType = '';
  selectedResourceFileSizeBytes = 0;

  selectedVideoFile: File | null = null;
  selectedVideoName = '';
  selectedVideoMimeType = '';
  selectedVideoSizeBytes = 0;

  uploadState: UploadState = 'idle';
  uploadProgress = 0;
  processingErrorMessage = '';
  processedVideoStorageUrl = '';

  draggedLessonIndex: number | null = null;
  draggedResourceIndex: number | null = null;

  alertType: AlertType = 'info';
  alertMessage = '';
  savingLesson = false;

  private uploadIntervalId: ReturnType<typeof setInterval> | null = null;
  private processingTimeoutId: number | null = null;
  private readonly onlineListener = (): void => this.handleOnline();
  private readonly offlineListener = (): void => this.handleOffline();

  constructor(
    private readonly draftService: CreatorCourseDraftService,
    private readonly authService: AuthService,
    private readonly courseService: CourseService
  ) {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.onlineListener);
      window.addEventListener('offline', this.offlineListener);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['courseId'] || changes['initialModuleId']) {
      this.loadContext();
    }
  }

  ngOnDestroy(): void {
    this.clearUploadInterval();
    this.clearProcessingTimeout();
    this.revokeProcessedVideoUrl();

    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.onlineListener);
      window.removeEventListener('offline', this.offlineListener);
    }
  }

  get selectedModule(): CreatorCourseModuleDraft | null {
    return this.modules.find((module) => module.id === this.selectedModuleId) ?? null;
  }

  get selectedModuleLessons(): CreatorCourseLessonDraft[] {
    const module = this.selectedModule;
    if (!module) {
      return [];
    }

    return [...module.lessons].sort((a, b) => a.order - b.order);
  }

  get acceptedVideoFormatsText(): string {
    return 'MP4, MOV y AVI';
  }

  get maxVideoSizeMb(): number {
    return MAX_VIDEO_SIZE_MB;
  }

  get canResumeUpload(): boolean {
    return this.uploadState === 'paused' && !!this.selectedVideoFile;
  }

  get hasModules(): boolean {
    return this.modules.length > 0;
  }

  get hasAtLeastOneLesson(): boolean {
    return this.modules.some((module) => module.lessons.length > 0);
  }

  get lessonOptionsForResources(): LessonResourceOption[] {
    const options: LessonResourceOption[] = [];

    for (const module of this.modules) {
      const orderedLessons = [...module.lessons].sort((a, b) => a.order - b.order);
      for (const lesson of orderedLessons) {
        options.push({
          moduleId: module.id,
          moduleTitle: module.title,
          lessonId: lesson.id,
          lessonTitle: lesson.title,
        });
      }
    }

    return options;
  }

  get selectedLessonForResources(): SelectedResourceLesson | null {
    if (this.resourceForm.targetScope !== 'lesson' || !this.resourceForm.lessonId) {
      return null;
    }

    for (const module of this.modules) {
      const lesson = module.lessons.find((item) => item.id === this.resourceForm.lessonId);
      if (lesson) {
        return {
          moduleId: module.id,
          module,
          lesson,
        };
      }
    }

    return null;
  }

  get currentResourceList(): CreatorCourseLessonResource[] {
    if (this.resourceForm.targetScope === 'course') {
      return [...(this.course?.courseResources ?? [])].sort((a, b) => a.order - b.order);
    }

    const selected = this.selectedLessonForResources;
    if (!selected) {
      return [];
    }

    return [...selected.lesson.resources].sort((a, b) => a.order - b.order);
  }

  get isVideoReady(): boolean {
    return this.uploadState === 'processed' && !!this.processedVideoStorageUrl;
  }

  get resourceFileAccept(): string {
    if (this.resourceForm.type === 'pdf') {
      return '.pdf,application/pdf';
    }

    if (this.resourceForm.type === 'image') {
      return '.png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp';
    }

    return '';
  }

  get acceptedResourceFormatsText(): string {
    if (this.resourceForm.type === 'pdf') {
      return 'PDF (.pdf)';
    }

    if (this.resourceForm.type === 'image') {
      return 'PNG, JPG, JPEG y WEBP';
    }

    return 'URL http/https';
  }

  get maxResourceSizeMb(): number {
    return MAX_RESOURCE_SIZE_MB;
  }

  onSelectModule(moduleId: string): void {
    this.selectedModuleId = moduleId;
    this.showLessonForm = false;
    this.resetLessonComposer();
    this.syncResourceLessonSelection();
  }

  openLessonForm(): void {
    if (!this.ensureEditableSession()) {
      return;
    }

    if (!this.selectedModule) {
      this.showAlert('warning', 'Selecciona un modulo existente para agregar una leccion.');
      return;
    }

    this.showLessonForm = true;
    this.lessonForm.order = this.selectedModuleLessons.length + 1;
  }

  cancelLessonForm(): void {
    this.showLessonForm = false;
    this.resetLessonComposer();
  }

  openResourceForm(): void {
    if (!this.ensureEditableSession()) {
      return;
    }

    if (!this.hasAtLeastOneLesson) {
      this.showAlert('warning', 'Debes crear al menos una leccion (UC-CC03) antes de agregar recursos.');
      return;
    }

    this.showResourceForm = true;
    this.syncResourceLessonSelection();
  }

  cancelResourceForm(): void {
    this.showResourceForm = false;
    this.resetResourceComposer();
  }

  onResourceScopeChange(scope: 'lesson' | 'course'): void {
    this.resourceForm.targetScope = scope;
    this.syncResourceLessonSelection();
  }

  onResourceTypeChange(type: CreatorCourseResourceType): void {
    this.resourceForm.type = type;
    this.resourceForm.externalUrl = '';
    this.clearSelectedResourceFile();
  }

  onResourceFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selectedFile = input.files?.item(0) ?? null;

    if (!selectedFile) {
      this.clearSelectedResourceFile();
      return;
    }

    if (selectedFile.size > MAX_RESOURCE_SIZE_BYTES) {
      this.clearSelectedResourceFile();
      input.value = '';
      this.showAlert(
        'danger',
        `El recurso supera el tamano maximo permitido (${this.maxResourceSizeMb} MB).`
      );
      return;
    }

    if (!this.isSupportedResourceFile(selectedFile, this.resourceForm.type)) {
      this.clearSelectedResourceFile();
      input.value = '';
      this.showAlert(
        'danger',
        `Formato de recurso no soportado. Formatos validos: ${this.acceptedResourceFormatsText}.`
      );
      return;
    }

    this.selectedResourceFile = selectedFile;
    this.selectedResourceFileName = selectedFile.name;
    this.selectedResourceFileMimeType = selectedFile.type;
    this.selectedResourceFileSizeBytes = selectedFile.size;
  }

  onVideoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selectedFile = input.files?.item(0) ?? null;

    if (!selectedFile) {
      this.resetUploadState();
      return;
    }

    if (!this.isSupportedVideoFormat(selectedFile)) {
      this.resetUploadState();
      input.value = '';
      this.showAlert('danger', `Formato no compatible. Formatos aceptados: ${this.acceptedVideoFormatsText}.`);
      return;
    }

    if (selectedFile.size > MAX_VIDEO_SIZE_BYTES) {
      this.resetUploadState();
      input.value = '';
      this.showAlert(
        'danger',
        `El archivo supera el tamano maximo permitido (${this.maxVideoSizeMb} MB).`
      );
      return;
    }

    this.resetUploadState();
    this.selectedVideoFile = selectedFile;
    this.selectedVideoName = selectedFile.name;
    this.selectedVideoMimeType = selectedFile.type;
    this.selectedVideoSizeBytes = selectedFile.size;

    this.startUpload();
  }

  resumeUpload(): void {
    if (!this.canResumeUpload) {
      return;
    }

    this.startUpload();
  }

  retryProcessing(): void {
    if (!this.selectedVideoFile) {
      this.showAlert('warning', 'Selecciona un video antes de reintentar el procesamiento.');
      return;
    }

    this.startProcessing();
  }

  async saveComplementaryResource(): Promise<void> {
    if (!this.ensureEditableSession()) {
      return;
    }

    if (!this.hasAtLeastOneLesson) {
      this.showAlert('warning', 'Debes crear al menos una leccion antes de agregar recursos.');
      return;
    }

    const title = this.resourceForm.title.trim();
    if (!title) {
      this.showAlert('warning', 'Ingresa un nombre descriptivo para el recurso.');
      return;
    }

    let resourceUrl = '';
    let fileName = '';
    let mimeType = '';
    let sizeBytes = 0;
    let isExternalAccessible = true;
    let warningMessage = '';

    if (this.resourceForm.type === 'external-link') {
      const externalUrl = this.resourceForm.externalUrl.trim();
      if (!externalUrl || !this.isValidUrl(externalUrl)) {
        this.showAlert('danger', 'Ingresa un enlace externo valido (http/https).');
        return;
      }

      resourceUrl = externalUrl;
      isExternalAccessible = await this.checkExternalLinkAccessible(externalUrl);
      if (!isExternalAccessible) {
        warningMessage =
          'El enlace no pudo verificarse en este momento, pero se guardo como recurso externo.';
      }
    } else {
      if (!this.selectedResourceFile) {
        this.showAlert('warning', 'Debes seleccionar un archivo para el recurso.');
        return;
      }

      if (this.selectedResourceFile.size > MAX_RESOURCE_SIZE_BYTES) {
        this.showAlert(
          'danger',
          `El recurso supera el tamano maximo permitido (${this.maxResourceSizeMb} MB).`
        );
        return;
      }

      if (!this.isSupportedResourceFile(this.selectedResourceFile, this.resourceForm.type)) {
        this.showAlert(
          'danger',
          `Formato de recurso no soportado. Formatos validos: ${this.acceptedResourceFormatsText}.`
        );
        return;
      }

      resourceUrl = URL.createObjectURL(this.selectedResourceFile);
      fileName = this.selectedResourceFile.name;
      mimeType = this.selectedResourceFile.type;
      sizeBytes = this.selectedResourceFile.size;
    }

    const timestamp = new Date().toISOString();
    const newResource: CreatorCourseLessonResource = {
      id: this.generateId(),
      title,
      type: this.resourceForm.type,
      url: resourceUrl,
      fileName,
      mimeType,
      sizeBytes,
      order: this.currentResourceList.length + 1,
      isExternalAccessible,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const successMessage = 'Recurso complementario agregado exitosamente.';
    let wasPersisted = false;

    if (this.resourceForm.targetScope === 'course') {
      const nextResources = [...this.currentResourceList, newResource];
      wasPersisted = this.persistCourseResources(nextResources, successMessage);
    } else {
      const selectedLesson = this.selectedLessonForResources;
      if (!selectedLesson) {
        this.showAlert('warning', 'Selecciona una leccion valida para asociar el recurso.');
        return;
      }

      const nextResources = [...selectedLesson.lesson.resources, newResource];
      wasPersisted = this.persistLessonResources(
        selectedLesson.moduleId,
        selectedLesson.lesson.id,
        nextResources,
        successMessage
      );
    }

    if (!wasPersisted) {
      return;
    }

    if (warningMessage) {
      this.showAlert('warning', `${successMessage} ${warningMessage}`);
    }

    this.resourceForm.title = '';
    this.resourceForm.externalUrl = '';
    this.clearSelectedResourceFile();
  }

  removeResource(resourceId: string): void {
    if (!this.ensureEditableSession()) {
      return;
    }

    if (this.resourceForm.targetScope === 'course') {
      const nextResources = this.currentResourceList.filter((resource) => resource.id !== resourceId);
      if (nextResources.length === this.currentResourceList.length) {
        return;
      }

      this.persistCourseResources(nextResources, 'Recurso eliminado correctamente.');
      return;
    }

    const selectedLesson = this.selectedLessonForResources;
    if (!selectedLesson) {
      this.showAlert('warning', 'No se encontro la leccion seleccionada para eliminar el recurso.');
      return;
    }

    const nextResources = selectedLesson.lesson.resources.filter((resource) => resource.id !== resourceId);
    if (nextResources.length === selectedLesson.lesson.resources.length) {
      return;
    }

    this.persistLessonResources(
      selectedLesson.moduleId,
      selectedLesson.lesson.id,
      nextResources,
      'Recurso eliminado correctamente.'
    );
  }

  onDragStartResource(index: number): void {
    if (!this.hasEditPermission) {
      return;
    }

    this.draggedResourceIndex = index;
  }

  onDragOverResource(event: DragEvent): void {
    event.preventDefault();
  }

  onDropResource(event: DragEvent, targetIndex: number): void {
    event.preventDefault();

    if (!this.hasEditPermission || this.draggedResourceIndex === null) {
      return;
    }

    const sourceIndex = this.draggedResourceIndex;
    this.draggedResourceIndex = null;

    if (sourceIndex === targetIndex) {
      return;
    }

    const nextResources = [...this.currentResourceList];
    const [draggedResource] = nextResources.splice(sourceIndex, 1);

    if (!draggedResource) {
      return;
    }

    nextResources.splice(targetIndex, 0, draggedResource);

    if (this.resourceForm.targetScope === 'course') {
      this.persistCourseResources(nextResources, 'Orden de recursos actualizado.');
      return;
    }

    const selectedLesson = this.selectedLessonForResources;
    if (!selectedLesson) {
      this.showAlert('warning', 'Selecciona una leccion para reordenar recursos.');
      return;
    }

    this.persistLessonResources(
      selectedLesson.moduleId,
      selectedLesson.lesson.id,
      nextResources,
      'Orden de recursos actualizado.'
    );
  }

  onDragEndResource(): void {
    this.draggedResourceIndex = null;
  }

  async saveLesson(): Promise<void> {
    if (!this.ensureEditableSession()) {
      return;
    }

    if (this.savingLesson) {
      return;
    }

    const module = this.selectedModule;
    if (!module) {
      this.showAlert('warning', 'Selecciona un modulo para asociar la leccion.');
      return;
    }

    const title = this.lessonForm.title.trim();
    const description = this.lessonForm.description.trim();

    if (!title) {
      this.showAlert('danger', 'El titulo de la leccion es obligatorio.');
      return;
    }

    if (!description) {
      this.showAlert('danger', 'La descripcion de la leccion es obligatoria.');
      return;
    }

    if (!this.isVideoReady) {
      this.showAlert('warning', 'Debes completar la carga y procesamiento del video antes de guardar.');
      return;
    }

    if (!this.selectedVideoFile) {
      this.showAlert('warning', 'No hay archivo de video seleccionado para la leccion.');
      return;
    }

    const selectedVideoFile = this.selectedVideoFile;

    if (!this.hasConnection()) {
      this.showAlert('danger', 'Error de conexion. No se pudo guardar la leccion.');
      return;
    }

    this.savingLesson = true;

    try {
      const backendModuleId = await this.resolveBackendModuleId(module);
      if (!backendModuleId) {
        return;
      }

      const payload = this.buildCreateLessonPayload(backendModuleId, title, description);
      const response = await firstValueFrom(this.courseService.createLessonFromApi(payload));

      const lessonOrder = this.clampOrder(this.lessonForm.order, module.lessons.length + 1);
      const timestamp = new Date().toISOString();
      const backendLessonId = this.extractBackendLessonId(response);

      const newLesson: CreatorCourseLessonDraft = {
        id: this.generateId(),
        backendLessonId,
        title,
        description,
        order: lessonOrder,
        isFreePreview: this.lessonForm.isFreePreview,
        resources: [],
        video: {
          fileName: selectedVideoFile.name,
          mimeType: selectedVideoFile.type,
          sizeBytes: selectedVideoFile.size,
          storageUrl: this.processedVideoStorageUrl,
          optimizedAt: timestamp
        },
        visibility: 'draft-only',
        createdAt: timestamp,
        updatedAt: timestamp
      };

      const nextLessons = [...module.lessons];
      nextLessons.splice(lessonOrder - 1, 0, newLesson);

      const wasPersisted = this.persistLessons(
        module.id,
        nextLessons,
        'Leccion creada en backend y asociada al modulo correctamente.'
      );

      if (!wasPersisted) {
        return;
      }

      this.showLessonForm = false;
      this.resetLessonComposer();
      this.syncResourceLessonSelection();
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        this.showAlert('danger', this.resolveCreateLessonErrorMessage(error));
        return;
      }

      this.showAlert('danger', 'No se pudo crear la leccion en backend. Ocurrio un error inesperado.');
    } finally {
      this.savingLesson = false;
    }
  }

  onDragStartLesson(index: number): void {
    if (!this.hasEditPermission) {
      return;
    }

    this.draggedLessonIndex = index;
  }

  onDragOverLesson(event: DragEvent): void {
    event.preventDefault();
  }

  onDropLesson(event: DragEvent, targetIndex: number): void {
    event.preventDefault();

    if (!this.hasEditPermission || this.draggedLessonIndex === null) {
      return;
    }

    const module = this.selectedModule;
    if (!module) {
      this.draggedLessonIndex = null;
      return;
    }

    const sourceIndex = this.draggedLessonIndex;
    this.draggedLessonIndex = null;

    if (sourceIndex === targetIndex) {
      return;
    }

    const nextLessons = [...this.selectedModuleLessons];
    const [draggedLesson] = nextLessons.splice(sourceIndex, 1);

    if (!draggedLesson) {
      return;
    }

    nextLessons.splice(targetIndex, 0, draggedLesson);
    this.persistLessons(module.id, nextLessons, 'Orden de lecciones actualizado correctamente.');
    this.syncResourceLessonSelection();
  }

  onDragEndLesson(): void {
    this.draggedLessonIndex = null;
  }

  goBackToModules(): void {
    this.backToModules.emit();
  }

  trackByModuleId(_index: number, module: CreatorCourseModuleDraft): string {
    return module.id;
  }

  trackByLessonId(_index: number, lesson: CreatorCourseLessonDraft): string {
    return lesson.id;
  }

  trackByResourceId(_index: number, resource: CreatorCourseLessonResource): string {
    return resource.id;
  }

  formatResourceType(type: CreatorCourseLessonResource['type']): string {
    if (type === 'pdf') {
      return 'PDF';
    }

    if (type === 'image') {
      return 'Imagen';
    }

    return 'Enlace externo';
  }

  formatBytes(bytes: number): string {
    if (!bytes || bytes <= 0) {
      return '0 MB';
    }

    const valueInMb = bytes / (1024 * 1024);
    return `${valueInMb.toFixed(2)} MB`;
  }

  private loadContext(): void {
    this.alertMessage = '';
    this.showLessonForm = false;
    this.showResourceForm = false;
    this.resetLessonComposer();
    this.resetResourceComposer();
    this.course = null;
    this.modules = [];
    this.selectedModuleId = '';

    this.isCreatorAuthenticated = this.authService.getRole() === 'creator';
    if (!this.isCreatorAuthenticated) {
      this.hasEditPermission = false;
      this.showAlert('danger', 'Debes estar autenticado como creador para gestionar lecciones.');
      return;
    }

    if (!this.courseId) {
      this.hasEditPermission = false;
      return;
    }

    const draft = this.draftService.getDraftById(this.courseId);
    if (!draft) {
      this.hasEditPermission = false;
      this.showAlert('danger', 'No se encontro el curso para crear lecciones.');
      return;
    }

    this.course = draft;
    this.modules = this.normalizeModules(draft.modules);
    this.hasEditPermission = draft.status === 'draft';

    if (!this.modules.length) {
      this.selectedModuleId = '';
      this.showAlert('warning', 'Debes crear al menos un modulo (UC-CC02) antes de agregar lecciones.');
      return;
    }

    const requestedModule = this.modules.find((module) => module.id === this.initialModuleId);
    this.selectedModuleId = requestedModule?.id || this.modules[0].id;
    this.syncResourceLessonSelection();
  }

  private ensureEditableSession(): boolean {
    if (!this.isCreatorAuthenticated) {
      this.showAlert('danger', 'Debes iniciar sesion como creador para continuar.');
      return false;
    }

    if (!this.hasEditPermission) {
      this.showAlert('warning', 'El curso no esta habilitado para edicion de lecciones.');
      return false;
    }

    if (!this.hasModules) {
      this.showAlert('warning', 'Debes crear al menos un modulo antes de agregar lecciones.');
      return false;
    }

    return true;
  }

  private persistLessons(moduleId: string, lessons: CreatorCourseLessonDraft[], successMessage: string): boolean {
    const normalizedLessons = lessons
      .map((lesson, index) => ({
        ...lesson,
        order: index + 1,
        updatedAt: new Date().toISOString()
      }))
      .sort((a, b) => a.order - b.order);

    const updatedDraft = this.draftService.updateDraftLessons(this.courseId, moduleId, normalizedLessons);

    if (!updatedDraft) {
      this.showAlert('danger', 'No se pudo guardar la leccion en el curso.');
      return false;
    }

    this.course = updatedDraft;
    this.modules = this.normalizeModules(updatedDraft.modules);
    this.selectedModuleId = this.modules.find((module) => module.id === moduleId)?.id || this.selectedModuleId;
    this.showAlert('success', successMessage);
    return true;
  }

  private persistCourseResources(
    resources: CreatorCourseLessonResource[],
    successMessage: string
  ): boolean {
    const updatedDraft = this.draftService.updateCourseResources(
      this.courseId,
      this.normalizeResourceOrder(resources)
    );

    if (!updatedDraft) {
      this.showAlert('danger', 'No se pudieron guardar los recursos del curso.');
      return false;
    }

    this.course = updatedDraft;
    this.modules = this.normalizeModules(updatedDraft.modules);
    this.syncResourceLessonSelection();
    this.showAlert('success', successMessage);
    return true;
  }

  private persistLessonResources(
    moduleId: string,
    lessonId: string,
    resources: CreatorCourseLessonResource[],
    successMessage: string
  ): boolean {
    const module = this.modules.find((item) => item.id === moduleId);
    if (!module) {
      this.showAlert('danger', 'No se encontro el modulo para guardar recursos.');
      return false;
    }

    const normalizedResources = this.normalizeResourceOrder(resources);
    const nextLessons = module.lessons.map((lesson) =>
      lesson.id === lessonId
        ? {
            ...lesson,
            resources: normalizedResources,
            updatedAt: new Date().toISOString(),
          }
        : lesson
    );

    const wasPersisted = this.persistLessons(moduleId, nextLessons, successMessage);
    if (wasPersisted) {
      this.syncResourceLessonSelection();
    }

    return wasPersisted;
  }

  private async resolveBackendModuleId(module: CreatorCourseModuleDraft): Promise<number | null> {
    if (typeof module.backendModuleId === 'number' && module.backendModuleId > 0) {
      return module.backendModuleId;
    }

    const backendCourseId = this.course?.backendCourseId;
    if (typeof backendCourseId !== 'number' || backendCourseId <= 0) {
      this.showAlert(
        'danger',
        'Este curso no tiene ID de backend. Crea o sincroniza el curso antes de agregar lecciones.'
      );
      return null;
    }

    try {
      const payload = this.buildCreateModulePayload(backendCourseId, module);
      const response = await firstValueFrom(this.courseService.createModuleFromApi(payload));
      const backendModuleId = this.extractBackendModuleId(response);

      if (!backendModuleId) {
        this.showAlert('danger', 'Backend no devolvio el ID del modulo creado.');
        return null;
      }

      const wasPersisted = this.persistModuleBackendId(module.id, backendModuleId);
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

  private buildCreateModulePayload(
    backendCourseId: number,
    module: CreatorCourseModuleDraft
  ): CreateModuleRequest {
    const fallbackTitle = `Modulo ${module.order}`;
    const normalizedTitleCandidate = this.trimToMaxLength(module.title.trim() || fallbackTitle, MODULE_TITLE_MAX_LENGTH);
    const normalizedTitle = normalizedTitleCandidate.length >= 2 ? normalizedTitleCandidate : fallbackTitle;
    const normalizedDescription = this.normalizeModuleDescriptionForApi(module.description, normalizedTitle);

    return {
      courseId: backendCourseId,
      title: normalizedTitle,
      description: normalizedDescription,
    };
  }

  private buildCreateLessonPayload(
    backendModuleId: number,
    title: string,
    description: string
  ): CreateLessonRequest {
    return {
      moduleId: backendModuleId,
      title: this.trimToMaxLength(title, 255),
      description,
      isFreePreview: this.lessonForm.isFreePreview,
      lessonType: 'VIDEO',
      videoUrl: this.processedVideoStorageUrl,
    };
  }

  private persistModuleBackendId(moduleId: string, backendModuleId: number): boolean {
    const nextModules = this.modules.map((module) =>
      module.id === moduleId
        ? {
            ...module,
            backendModuleId,
          }
        : module
    );

    const updatedDraft = this.draftService.updateDraftModules(this.courseId, nextModules);
    if (!updatedDraft) {
      this.showAlert('danger', 'No se pudo guardar el enlace del modulo con backend.');
      return false;
    }

    this.course = updatedDraft;
    this.modules = this.normalizeModules(updatedDraft.modules);
    this.selectedModuleId = this.modules.find((item) => item.id === moduleId)?.id || this.selectedModuleId;

    return true;
  }

  private normalizeModuleDescriptionForApi(description: string, moduleTitle: string): string {
    const trimmed = description.trim();
    let normalized = trimmed || `Contenido base del ${moduleTitle}.`;

    if (normalized.length < MODULE_DESCRIPTION_MIN_LENGTH) {
      normalized = `${normalized} Material introductorio.`;
    }

    if (normalized.length < MODULE_DESCRIPTION_MIN_LENGTH) {
      normalized = `Contenido base del modulo ${moduleTitle}.`;
    }

    return this.trimToMaxLength(normalized, MODULE_DESCRIPTION_MAX_LENGTH);
  }

  private trimToMaxLength(value: string, maxLength: number): string {
    if (value.length <= maxLength) {
      return value;
    }

    return value.slice(0, maxLength);
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

  private extractBackendLessonId(response: CreateLessonResponse): number | null {
    if (typeof response.id === 'number') {
      return response.id;
    }

    if (typeof response.lessonId === 'number') {
      return response.lessonId;
    }

    return null;
  }

  private resolveCreateModuleErrorMessage(error: HttpErrorResponse): string {
    const detailsMessage = this.resolveBackendErrorMessage(error);
    if (detailsMessage) {
      return `No se pudo sincronizar el modulo en backend: ${detailsMessage}`;
    }

    return `No se pudo sincronizar el modulo en backend (status ${error.status || 0}).`;
  }

  private resolveCreateLessonErrorMessage(error: HttpErrorResponse): string {
    const detailsMessage = this.resolveBackendErrorMessage(error);
    if (detailsMessage) {
      return `No se pudo crear la leccion en backend: ${detailsMessage}`;
    }

    return `No se pudo crear la leccion en backend (status ${error.status || 0}).`;
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

  private normalizeModules(modules: CreatorCourseModuleDraft[]): CreatorCourseModuleDraft[] {
    return [...modules]
      .sort((a, b) => a.order - b.order)
      .map((module, moduleIndex) => ({
        ...module,
        order: moduleIndex + 1,
        lessons: [...module.lessons]
          .sort((a, b) => a.order - b.order)
          .map((lesson, lessonIndex) => ({
            ...lesson,
            order: lessonIndex + 1
          }))
      }));
  }

  private startUpload(): void {
    if (!this.selectedVideoFile) {
      return;
    }

    if (!this.hasConnection()) {
      this.uploadState = 'paused';
      this.showAlert('warning', 'Conexion interrumpida. Puedes retomar la carga cuando vuelva la red.');
      return;
    }

    this.uploadState = 'uploading';
    this.processingErrorMessage = '';

    this.clearUploadInterval();
    this.uploadIntervalId = setInterval(() => {
      if (!this.hasConnection()) {
        this.pauseUploadByConnectionLoss();
        return;
      }

      const increment = Math.floor(Math.random() * 12) + 8;
      this.uploadProgress = Math.min(100, this.uploadProgress + increment);

      if (this.uploadProgress >= 100) {
        this.clearUploadInterval();
        this.uploadState = 'uploaded';
        this.startProcessing();
      }
    }, 240);
  }

  private startProcessing(): void {
    if (!this.selectedVideoFile) {
      this.uploadState = 'failed';
      this.processingErrorMessage = 'No hay archivo para procesar.';
      return;
    }

    const fileToProcess = this.selectedVideoFile;

    this.uploadState = 'processing';
    this.processingErrorMessage = '';

    this.clearProcessingTimeout();

    this.processingTimeoutId = window.setTimeout(() => {
      if (!this.hasConnection()) {
        this.uploadState = 'failed';
        this.processingErrorMessage =
          'Se interrumpio la conexion durante el procesamiento. Reintenta nuevamente.';
        this.showAlert('danger', this.processingErrorMessage);
        return;
      }

      if (this.shouldFailProcessing(fileToProcess)) {
        this.uploadState = 'failed';
        this.processingErrorMessage =
          'Fallo el procesamiento del video. Intentalo nuevamente con Reintentar procesamiento.';
        this.showAlert('danger', this.processingErrorMessage);
        return;
      }

      this.revokeProcessedVideoUrl();
      this.processedVideoStorageUrl = URL.createObjectURL(fileToProcess);
      this.uploadState = 'processed';
      this.showAlert('success', 'Video procesado y comprimido correctamente.');
    }, 1200);
  }

  private pauseUploadByConnectionLoss(): void {
    this.clearUploadInterval();
    this.uploadState = 'paused';
    this.showAlert(
      'warning',
      'La conexion se interrumpio durante la carga. Puedes retomar desde el avance actual.'
    );
  }

  private handleOffline(): void {
    if (this.uploadState === 'uploading') {
      this.pauseUploadByConnectionLoss();
    }
  }

  private handleOnline(): void {
    if (this.uploadState === 'paused') {
      this.showAlert('info', 'Conexion restablecida. Puedes retomar la carga del video.');
    }
  }

  private resetLessonComposer(): void {
    this.lessonForm = this.buildEmptyLessonForm();
    this.resetUploadState();
  }

  private resetResourceComposer(): void {
    this.resourceForm = this.buildEmptyResourceForm();
    this.clearSelectedResourceFile();
    this.draggedResourceIndex = null;
  }

  private resetUploadState(): void {
    this.clearUploadInterval();
    this.clearProcessingTimeout();
    this.revokeProcessedVideoUrl();
    this.selectedVideoFile = null;
    this.selectedVideoName = '';
    this.selectedVideoMimeType = '';
    this.selectedVideoSizeBytes = 0;
    this.uploadState = 'idle';
    this.uploadProgress = 0;
    this.processingErrorMessage = '';
  }

  private clearUploadInterval(): void {
    if (this.uploadIntervalId) {
      clearInterval(this.uploadIntervalId);
      this.uploadIntervalId = null;
    }
  }

  private clearProcessingTimeout(): void {
    if (this.processingTimeoutId) {
      clearTimeout(this.processingTimeoutId);
      this.processingTimeoutId = null;
    }
  }

  private revokeProcessedVideoUrl(): void {
    if (this.processedVideoStorageUrl) {
      URL.revokeObjectURL(this.processedVideoStorageUrl);
      this.processedVideoStorageUrl = '';
    }
  }

  private buildEmptyLessonForm(): LessonFormModel {
    return {
      title: '',
      description: '',
      order: 1,
      isFreePreview: false
    };
  }

  private buildEmptyResourceForm(): ResourceFormModel {
    return {
      targetScope: 'lesson',
      lessonId: '',
      type: 'pdf',
      title: '',
      externalUrl: '',
    };
  }

  private normalizeResourceOrder(resources: CreatorCourseLessonResource[]): CreatorCourseLessonResource[] {
    return resources
      .map((resource, index) => ({
        ...resource,
        order: index + 1,
        updatedAt: new Date().toISOString(),
      }))
      .sort((a, b) => a.order - b.order);
  }

  private clampOrder(order: number, max: number): number {
    if (!Number.isFinite(order)) {
      return max;
    }

    const normalized = Math.floor(order);
    if (normalized < 1) {
      return 1;
    }

    return normalized > max ? max : normalized;
  }

  private shouldFailProcessing(file: File): boolean {
    return /fail|error/i.test(file.name);
  }

  private isSupportedVideoFormat(file: File): boolean {
    const extension = this.extractExtension(file.name);
    const extensionSupported = extension ? ACCEPTED_VIDEO_EXTENSIONS.has(extension) : false;
    const mimeSupported = ACCEPTED_VIDEO_MIME_TYPES.has(file.type);
    return extensionSupported || mimeSupported;
  }

  private isSupportedResourceFile(file: File, type: CreatorCourseResourceType): boolean {
    const extension = this.extractExtension(file.name);

    if (type === 'pdf') {
      const extensionSupported = extension ? ACCEPTED_RESOURCE_PDF_EXTENSIONS.has(extension) : false;
      const mimeSupported = ACCEPTED_RESOURCE_PDF_MIME_TYPES.has(file.type);
      return extensionSupported || mimeSupported;
    }

    if (type === 'image') {
      const extensionSupported = extension ? ACCEPTED_RESOURCE_IMAGE_EXTENSIONS.has(extension) : false;
      const mimeSupported = ACCEPTED_RESOURCE_IMAGE_MIME_TYPES.has(file.type);
      return extensionSupported || mimeSupported;
    }

    return false;
  }

  private extractExtension(fileName: string): string | null {
    const fragments = fileName.toLowerCase().split('.');
    if (fragments.length < 2) {
      return null;
    }

    const extension = fragments[fragments.length - 1]?.trim();
    return extension || null;
  }

  private isValidUrl(value: string): boolean {
    try {
      const parsed = new URL(value);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }

  private async checkExternalLinkAccessible(value: string): Promise<boolean> {
    if (
      typeof window === 'undefined' ||
      typeof fetch === 'undefined' ||
      typeof AbortController === 'undefined'
    ) {
      return true;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 3000);

    try {
      const response = await fetch(value, {
        method: 'HEAD',
        mode: 'cors',
        signal: controller.signal,
      });

      window.clearTimeout(timeoutId);
      return response.ok;
    } catch {
      window.clearTimeout(timeoutId);
      return false;
    }
  }

  private syncResourceLessonSelection(): void {
    if (this.resourceForm.targetScope !== 'lesson') {
      return;
    }

    const lessonOptions = this.lessonOptionsForResources;
    if (!lessonOptions.length) {
      this.resourceForm.lessonId = '';
      return;
    }

    const selectedExists = lessonOptions.some((option) => option.lessonId === this.resourceForm.lessonId);
    if (selectedExists) {
      return;
    }

    const preferredOption =
      lessonOptions.find((option) => option.moduleId === this.selectedModuleId) || lessonOptions[0];

    this.resourceForm.lessonId = preferredOption.lessonId;
  }

  private clearSelectedResourceFile(): void {
    this.selectedResourceFile = null;
    this.selectedResourceFileName = '';
    this.selectedResourceFileMimeType = '';
    this.selectedResourceFileSizeBytes = 0;
  }

  private hasConnection(): boolean {
    return typeof navigator === 'undefined' || navigator.onLine;
  }

  private generateId(): string {
    return `${Date.now()}-${Math.floor(Math.random() * 100_000)}`;
  }

  private showAlert(type: AlertType, message: string): void {
    this.alertType = type;
    this.alertMessage = message;
  }

}
