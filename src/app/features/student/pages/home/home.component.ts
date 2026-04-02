import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';
import { StudentFacadeService } from '@core/services/student/student-facade.service';
import { HomeCourseItem, HomeSectionKey } from '@student-models/home.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  @Output() openCourseDetail = new EventEmitter<HomeCourseItem>();

  private readonly visibleCards = 2;
  private readonly initialIndexBySection: Record<HomeSectionKey, number> = {
    continueLearning: 0,
    recommended: 0,
    popular: 0
  };

  readonly homeData$ = this.studentFacade.getHomeData();
  readonly activeIndexBySection = signal<Record<HomeSectionKey, number>>(this.initialIndexBySection);

  constructor(private readonly studentFacade: StudentFacadeService) {
    addIcons({ chevronBackOutline, chevronForwardOutline });
  }

  getGreetingByTime(): string {
    const currentHour = new Date().getHours();

    if (currentHour < 12) {
      return 'Buenos dias';
    }

    if (currentHour < 19) {
      return 'Buenas tardes';
    }

    return 'Buenas noches';
  }

  trackByCourseId(_index: number, course: HomeCourseItem): number {
    return course.id;
  }

  canGoPrev(sectionKey: HomeSectionKey): boolean {
    return this.activeIndexBySection()[sectionKey] > 0;
  }

  canGoNext(sectionKey: HomeSectionKey, totalCourses: number): boolean {
    const maxStart = Math.max(totalCourses - this.visibleCards, 0);
    return this.activeIndexBySection()[sectionKey] < maxStart;
  }

  prev(sectionKey: HomeSectionKey): void {
    const currentIndex = this.activeIndexBySection()[sectionKey];
    const nextIndex = Math.max(currentIndex - 1, 0);
    this.updateSectionIndex(sectionKey, nextIndex);
  }

  next(sectionKey: HomeSectionKey, totalCourses: number): void {
    const currentIndex = this.activeIndexBySection()[sectionKey];
    const maxStart = Math.max(totalCourses - this.visibleCards, 0);
    const nextIndex = Math.min(currentIndex + 1, maxStart);
    this.updateSectionIndex(sectionKey, nextIndex);
  }

  getVisibleCourses(courses: HomeCourseItem[], sectionKey: HomeSectionKey): HomeCourseItem[] {
    const start = this.activeIndexBySection()[sectionKey];
    return courses.slice(start, start + this.visibleCards);
  }

  selectCourse(course: HomeCourseItem): void {
    this.openCourseDetail.emit(course);
  }

  private updateSectionIndex(sectionKey: HomeSectionKey, index: number): void {
    this.activeIndexBySection.update((state) => ({
      ...state,
      [sectionKey]: index
    }));
  }
}
