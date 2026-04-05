import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModulesComponent } from '../modules/modules.component';
import { CourseModuleDraft } from '@student-models/course-structure.model';

type AlertType = 'success' | 'danger' | 'warning' | 'info';

@Component({
  selector: 'app-create-course',
  templateUrl: './create-course.component.html',
  styleUrls: ['./create-course.component.scss', './create-course.component2.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ModulesComponent],
})
export class CreateCourseComponent {
  currentStep: 'course' | 'lessons' = 'course';

  categories: string[] = ['Cocina', 'Postres', 'Panaderia', 'Bebidas'];
  courseTitle = '';
  courseDescription = '';
  selectedCategory = '';

  moduleTitle = '';
  moduleDescription = '';
  modules: CourseModuleDraft[] = [];

  alertType: AlertType = 'info';
  alertMessage = '';

  addModule(): void {
    const title = this.moduleTitle.trim();
    const description = this.moduleDescription.trim();

    if (!title || !description) {
      this.showAlert('warning', 'Completa titulo y descripcion del modulo.');
      return;
    }

    this.modules = [...this.modules, { title, description, lessons: [] }];
    this.moduleTitle = '';
    this.moduleDescription = '';
    this.showAlert('success', 'Modulo guardado correctamente.');
  }

  removeModule(index: number): void {
    this.modules = this.modules.filter((_, idx) => idx !== index);
    this.showAlert('info', 'Modulo eliminado de la lista.');
  }

  nextStep(): void {
    if (!this.courseTitle.trim() || !this.courseDescription.trim() || !this.selectedCategory) {
      this.showAlert('danger', 'Completa los datos generales del curso antes de continuar.');
      return;
    }

    if (this.modules.length === 0) {
      this.showAlert('warning', 'Agrega al menos un modulo para continuar.');
      return;
    }

    if (!this.modules.every((module) => module.lessons.length > 0)) {
      this.showAlert('warning', 'Cada modulo necesita al menos una leccion.');
      return;
    }

    this.currentStep = 'lessons';
    this.showAlert('info', 'Ahora completa las lecciones por modulo.');
  }

  private showAlert(type: AlertType, message: string): void {
    this.alertType = type;
    this.alertMessage = message;
  }

}
