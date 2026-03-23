import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface CourseModule {
  title: string;
  description: string;
}

interface LessonItem {
  title: string;
  moduleTitle: string;
}

type AlertType = 'success' | 'danger' | 'warning' | 'info';

@Component({
  selector: 'app-modules',
  templateUrl: './modules.component.html',
  styleUrls: ['./modules.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class ModulesComponent {
  @Input() modules: CourseModule[] = [];
  @Input() courseTitle = '';

  lessonTitle = '';
  selectedModule = '';
  lessons: LessonItem[] = [];

  selectedLesson = '';
  selectedVideoName = '';
  previewUrl: string | null = null;

  alertType: AlertType = 'info';
  alertMessage = '';

  addLesson(): void {
    const title = this.lessonTitle.trim();

    if (!title || !this.selectedModule) {
      this.showAlert('warning', 'Completa titulo de leccion y modulo.');
      return;
    }

    this.lessons = [...this.lessons, { title, moduleTitle: this.selectedModule }];
    this.lessonTitle = '';
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

    this.showAlert('success', 'Curso guardado como borrador (simulado).');
  }

  publishCourse(): void {
    if (!this.hasValidLessons()) {
      this.showAlert('danger', 'No puedes publicar sin lecciones.');
      return;
    }

    this.showAlert('success', 'Curso publicado en simulacion. Luego lo conectamos al backend.');
  }

  private hasValidLessons(): boolean {
    return this.lessons.length > 0;
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
