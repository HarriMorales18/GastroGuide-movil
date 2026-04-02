import { Component, CUSTOM_ELEMENTS_SCHEMA, effect, ElementRef, signal, ViewChild } from '@angular/core';
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
import { HomeService } from '@core/services/student/home.service';
import { HomeCourseItem } from '@student-models/home.model';
import { CoursesComponent } from '../courses/courses.component';
import { CoursesService } from '@core/services/student/courses.service';
import { StudentCourseItem } from '@student-models/courses.model';
import { SearchComponent } from '../search/search.component';
import { SearchService } from '@core/services/student/search.service';
import { SearchResultItem } from '@student-models/search.model';
import { ProfileComponent } from '../profile/profile.component';
import { ProfileService } from '@core/services/student/profile.service';
import { CourseDetailComponent } from '../course-detail/course-detail.component';
import { CourseDetailStateService } from '@core/services/student/course-detail-state.service';
import { StudentCourseDetail } from '@student-models/course-detail.model';
import { ConfigComponent } from '../config/config.component';
import { CourseComponent } from '../course/course.component';
import { CourseAccessService } from '@core/services/student/course-access.service';
import { CoursePurchaseService } from '@core/services/student/course-purchase.service';
import { CoursePurchaseComponent } from '../course-purchase/course-purchase.component';
import { StudentFacadeService } from '@core/services/student/student-facade.service';

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
  providers: [
    HomeService,
    CoursesService,
    SearchService,
    ProfileService,
    StudentFacadeService,
    CourseDetailStateService,
    CourseAccessService,
    CoursePurchaseService
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
  @ViewChild('contentContainer') private contentContainer?: ElementRef<HTMLElement>;
  private previousTab: 'home' | 'courses' | 'search' | 'profile' = 'home';
  private handledOpenRequest = 0;
  private handledPurchaseRequest = 0;
  private handledDetailRequest = 0;
  readonly courseDetailComponent = CourseDetailComponent;
  readonly studentCourseComponent = CourseComponent;
  readonly purchaseCourseComponent = CoursePurchaseComponent;
  readonly loggedUserDisplayName = signal('Mi perfil');

  constructor(
    private readonly courseDetailState: CourseDetailStateService,
    private readonly courseAccess: CourseAccessService,
    private readonly studentFacade: StudentFacadeService
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

    effect(() => {
      if (this.currentTab() === 'course' && !this.courseAccess.canAccessCourse()) {
        this.currentTab.set('course-detail');
      }
    });

    effect(() => {
      const currentRequest = this.courseAccess.openCourseRequest();

      if (currentRequest > this.handledOpenRequest) {
        this.handledOpenRequest = currentRequest;

        if (this.courseDetailState.selectedCourse()) {
          this.currentTab.set('course');
        }
      }
    });

    effect(() => {
      const currentPurchaseRequest = this.courseAccess.openPurchaseRequest();

      if (currentPurchaseRequest > this.handledPurchaseRequest) {
        this.handledPurchaseRequest = currentPurchaseRequest;

        if (this.courseDetailState.selectedCourse()) {
          this.currentTab.set('course-purchase');
        }
      }
    });

    effect(() => {
      const currentDetailRequest = this.courseAccess.openCourseDetailRequest();

      if (currentDetailRequest > this.handledDetailRequest) {
        this.handledDetailRequest = currentDetailRequest;

        if (this.courseDetailState.selectedCourse()) {
          this.currentTab.set('course-detail');
        }
      }
    });

    effect(() => {
      this.currentTab();
      this.resetContentScroll();
    });

    this.loadLoggedUserProfile();
  }

  // 🔥 CONTROL DE TABS
  currentTab = signal<'home' | 'courses' | 'search' | 'profile' | 'course-detail' | 'course' | 'course-purchase' | 'config'>('home');

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
      return 'US';
    }

    if (words.length === 1) {
      return words[0].slice(0, 2).toUpperCase();
    }

    const first = words[0][0] ?? '';
    const second = words[1]?.[0] ?? '';

    return `${first}${second}`.toUpperCase();
  }

  openHomeCourseDetail(course: HomeCourseItem): void {
    this.openCourseDetail(this.studentFacade.buildDetailFromHome(course));
  }

  openCoursesDetail(course: StudentCourseItem): void {
    this.openCourseDetail(this.studentFacade.buildDetailFromCourses(course));
  }

  openSearchDetail(item: SearchResultItem): void {
    this.openCourseDetail(this.studentFacade.buildDetailFromSearch(item));
  }

  private openCourseDetail(detail: StudentCourseDetail): void {
    this.courseDetailState.setSelectedCourse(detail);
    this.courseAccess.revokeAccess();
    this.currentTab.set('course-detail');
  }

  private loadLoggedUserProfile(): void {
    this.studentFacade.getProfileHubData().subscribe((data) => {
      this.loggedUserDisplayName.set(data.me.displayName || 'Mi perfil');
    });
  }

  private resetContentScroll(): void {
    requestAnimationFrame(() => {
      this.contentContainer?.nativeElement.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    });
  }
}
