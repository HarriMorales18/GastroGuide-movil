import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

// Importamos las vistas
import { HomeComponent } from '../home/home.component';
import { CoursesComponent } from '../courses/courses.component';
import { SearchComponent } from '../search/search.component';
import { ProfileComponent } from '../profile/profile.component';

@Component({
  selector: 'app-student-layout',
  standalone: true,
  imports: [
    CommonModule,
    HomeComponent,
    CoursesComponent,
    SearchComponent,
    ProfileComponent
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {

  // 🔥 CONTROL DE TABS
  currentTab = signal<'home' | 'courses' | 'search' | 'profile'>('home');

  changeTab(tab: 'home' | 'courses' | 'search' | 'profile') {
    this.currentTab.set(tab);
  }
}