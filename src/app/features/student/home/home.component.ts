import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Home</h2>
    <p>Cursos destacados</p>
  `
})
export class HomeComponent {}