import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Cursos</h2>
    <p>Listado de cursos</p>
  `
})
export class CoursesComponent {}