import { Component, CUSTOM_ELEMENTS_SCHEMA, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import {
  addCircleOutline,
  chatbubbleEllipsesOutline,
  homeOutline,
  menuOutline,
  notificationsOutline,
  personCircleOutline,
  searchOutline,
  schoolOutline
} from 'ionicons/icons';

// Importamos las vistas
import { HomeComponent } from '../home/home.component';
import { HomeCourseItem } from '../models/home.model';
import { CoursesComponent } from '../courses/courses.component';
import { StudentCourseItem } from '../models/courses.model';
import { SearchComponent } from '../search/search.component';
import { SearchResultItem } from '../models/search.model';
import { ProfileComponent } from '../profile/profile.component';
import { ProfileService } from '../profile/profile.service';
import { CourseDetailComponent } from '../course-detail/course-detail.component';
import { CourseDetailStateService } from '../course-detail/course-detail-state.service';
import { StudentCourseDetail } from '../models/course-detail.model';
import { ConfigComponent } from '../config/config.component';

@Component({
  selector: 'app-student-layout',
  standalone: true,
  imports: [
    CommonModule,
    HomeComponent,
    CoursesComponent,
    SearchComponent,
    ProfileComponent,

      ConfigComponent
    ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
  private previousTab: 'home' | 'courses' | 'search' | 'profile' = 'home';
  readonly courseDetailComponent = CourseDetailComponent;
  readonly defaultAvatarUrl = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80';
  readonly loggedUserAvatarUrl = signal<string | null>(null);
  readonly loggedUserDisplayName = signal('Mi perfil');

  constructor(
    private readonly courseDetailState: CourseDetailStateService,
    private readonly profileService: ProfileService
  ) {
    addIcons({
      addCircleOutline,
      searchOutline,
      chatbubbleEllipsesOutline,
      homeOutline,
      schoolOutline,
      personCircleOutline,
      notificationsOutline,
      menuOutline
    });

    effect(() => {
      if (this.currentTab() === 'course-detail' && !this.courseDetailState.selectedCourse()) {
        this.currentTab.set(this.previousTab);
      }
    });

    this.loadLoggedUserProfile();
  }

  // 🔥 CONTROL DE TABS
  currentTab = signal<'home' | 'courses' | 'search' | 'profile' | 'course-detail' | 'config'>('home');

  changeTab(tab: 'home' | 'courses' | 'search' | 'profile' | 'config') {
    this.currentTab.set(tab);
    if (tab !== 'config') {
      this.previousTab = tab;
    }
  }

  loggedUserInitials(): string {
    const words = this.loggedUserDisplayName()
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (!words.length) {
      return 'JP';
    }

    const first = words[0][0] ?? '';
    const second = words[1]?.[0] ?? words[0][1] ?? '';

    return `${first}${second}`.toUpperCase();
  }

  openHomeCourseDetail(course: HomeCourseItem): void {
    const detail: StudentCourseDetail = {
      id: course.id,
      title: course.title,
      category: course.category,
      instructor: course.author,
      thumbnailUrl: course.thumbnailUrl,
      description: 'Curso destacado para mejorar tus tecnicas y resultados en cocina paso a paso.',
      durationMinutes: course.durationMinutes,
      rating: course.rating,
      totalRatings: 800 + course.id,
      lessonsCompleted: Math.round(((course.progressPercentage ?? 0) / 100) * 12),
      lessonsTotal: 12,
      progressPercentage: course.progressPercentage ?? 0,
      levelLabel: 'Intermedio',
      contentTypeLabel: 'Curso',
      priceLabel: 'Incluido en tu plan',
      hasCertificate: true,
      updatedAtLabel: 'Actualizado recientemente',
      tags: ['chef tips', 'practico', 'destacado'],
      whatYouWillLearn: [
        'Dominar tecnicas clave para ejecutar recetas de forma consistente.',
        'Organizar mise en place y tiempos para cocinar con confianza.',
        'Evitar errores frecuentes y mejorar sabor, textura y presentacion.'
      ],
      modules: this.buildModules(12, Math.round(((course.progressPercentage ?? 0) / 100) * 12))
    };

    this.openCourseDetail(detail);
  }

  openCoursesDetail(course: StudentCourseItem): void {
    const detail: StudentCourseDetail = {
      id: course.id,
      title: course.title,
      category: course.category,
      instructor: course.instructor,
      thumbnailUrl: course.thumbnailUrl,
      description: 'Ruta de aprendizaje enfocada en resultados reales y aplicables en cocina y negocio.',
      durationMinutes: course.durationMinutes,
      rating: 4.7,
      totalRatings: 650 + course.id,
      lessonsCompleted: course.lessonsCompleted,
      lessonsTotal: course.lessonsTotal,
      progressPercentage: course.progressPercentage,
      levelLabel: course.status === 'pending' ? 'Principiante' : 'Intermedio',
      contentTypeLabel: 'Curso',
      priceLabel: 'Incluido en tu plan',
      hasCertificate: course.status !== 'pending',
      updatedAtLabel: course.updatedAtLabel,
      tags: course.isFavorite ? ['favorito', 'recomendado'] : ['practico', 'actualizado'],
      whatYouWillLearn: [
        'Aplicar buenas practicas para mejorar calidad y velocidad.',
        'Tomar decisiones de ingredientes y tecnicas con criterio.',
        'Construir un flujo de trabajo repetible y eficiente.'
      ],
      modules: this.buildModules(course.lessonsTotal, course.lessonsCompleted)
    };

    this.openCourseDetail(detail);
  }

  openSearchDetail(item: SearchResultItem): void {
    const detail: StudentCourseDetail = {
      id: item.id,
      title: item.title,
      category: item.category,
      instructor: item.instructor,
      thumbnailUrl: item.thumbnailUrl,
      description: item.description,
      durationMinutes: item.durationMinutes,
      rating: item.rating,
      totalRatings: item.totalRatings,
      lessonsCompleted: item.contentType === 'tip' ? 0 : 2,
      lessonsTotal: item.contentType === 'tip' ? 1 : 10,
      progressPercentage: item.contentType === 'tip' ? 0 : 20,
      levelLabel: this.mapLevel(item.level),
      contentTypeLabel: this.mapContentType(item.contentType),
      priceLabel: item.isFree ? 'Gratis' : 'Pago',
      hasCertificate: item.hasCertificate,
      updatedAtLabel: item.updatedAtLabel,
      tags: item.tags,
      whatYouWillLearn: [
        'Comprender conceptos clave explicados por expertos.',
        'Llevar la teoria a practica en escenarios reales.',
        'Aumentar consistencia y calidad en cada preparacion.'
      ],
      modules: this.buildModules(item.contentType === 'tip' ? 1 : 10, item.contentType === 'tip' ? 0 : 2)
    };

    this.openCourseDetail(detail);
  }

  private openCourseDetail(detail: StudentCourseDetail): void {
    this.courseDetailState.setSelectedCourse(detail);
    this.currentTab.set('course-detail');
  }

  private buildModules(total: number, completed: number): Array<{ id: number; title: string; durationMinutes: number; isCompleted: boolean }> {
    return Array.from({ length: total }, (_, index) => ({
      id: index + 1,
      title: `Modulo ${index + 1}`,
      durationMinutes: 8 + (index % 4) * 4,
      isCompleted: index < completed
    }));
  }

  private mapLevel(level: 'beginner' | 'intermediate' | 'advanced'): string {
    if (level === 'beginner') {
      return 'Principiante';
    }

    if (level === 'intermediate') {
      return 'Intermedio';
    }

    return 'Avanzado';
  }

  private mapContentType(type: 'course' | 'tip' | 'masterclass' | 'recipe'): string {
    if (type === 'course') {
      return 'Curso';
    }

    if (type === 'tip') {
      return 'Tip';
    }

    if (type === 'masterclass') {
      return 'Masterclass';
    }

    return 'Receta';
  }

  private loadLoggedUserProfile(): void {
    this.profileService.getProfileHubData().subscribe((data) => {
      this.loggedUserDisplayName.set(data.me.displayName || 'Mi perfil');
      this.loggedUserAvatarUrl.set(data.me.avatarUrl);
    });
  }
}
