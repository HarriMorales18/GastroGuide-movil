import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CourseModuleDraft } from '@student-models/course-structure.model';

type AlertType = 'success' | 'danger' | 'warning' | 'info';

@Component({
  selector: 'app-modules',
  templateUrl: './modules.component.html',
  styleUrls: ['./modules.component.scss', './modules.component2.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class ModulesComponent {
  @Input() modules: CourseModuleDraft[] = [];
  @Input() courseTitle = '';

  lessonTitle = '';
  lessonSummary = '';
  selectedModule = '';
  selectedVideoName = '';
  previewUrl: string | null = null;

  alertType: AlertType = 'info';
  alertMessage = '';

  getTotalLessons(): number {
    return this.modules.reduce((total, module) => total + module.lessons.length, 0);
  }

  addLesson(): void {
    const title = this.lessonTitle.trim();
    const summary = this.lessonSummary.trim();

    if (!title || !summary || !this.selectedModule) {
      this.showAlert('warning', 'Completa titulo, descripcion y modulo de la leccion.');
      return;
    }

    const targetModule = this.modules.find((module) => module.title === this.selectedModule);

    if (!targetModule) {
      this.showAlert('warning', 'Selecciona un modulo valido.');
      return;
    }

    targetModule.lessons = [...targetModule.lessons, {
      title,
      summary,
      videoName: this.selectedVideoName || 'Sin video cargado'
    }];
    this.lessonTitle = '';
    this.lessonSummary = '';
    this.selectedVideoName = '';
    this.revokePreviewUrl();
    this.showAlert('success', 'Leccion guardada correctamente.');
  }

  onVideoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      this.showAlert('warning', 'Selecciona un archivo de video.');
      return;
    }

    this.revokePreviewUrl();
    this.previewUrl = URL.createObjectURL(file);
    this.selectedVideoName = file.name;
    this.showAlert('info', 'Video cargado con preview local.');
  }

  saveDraftCourse(): void {
    if (!this.hasValidLessons()) {
      this.showAlert('danger', 'Agrega al menos una leccion antes de guardar.');
      return;
    }

    this.showAlert('success', 'Curso guardado como borrador.');
  }

  publishCourse(): void {
    if (!this.hasValidLessons()) {
      this.showAlert('danger', 'No puedes publicar sin lecciones.');
      return;
    }

    this.showAlert('success', 'Curso publicado. Luego lo conectamos al backend.');
  }

  private hasValidLessons(): boolean {
    return this.modules.some((module) => module.lessons.length > 0);
  }

  private showAlert(type: AlertType, message: string): void {
    this.alertType = type;
    this.alertMessage = message;
  }

  ngOnDestroy(): void {
    this.revokePreviewUrl();
  }

  private revokePreviewUrl(): void {
    if (!this.previewUrl) {
      return;
    }

    URL.revokeObjectURL(this.previewUrl);
    this.previewUrl = null;
  }

}
