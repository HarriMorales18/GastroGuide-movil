import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CourseStatus, StudentCourseItem } from '../../models/courses.model';
import { CoursesService } from './courses.service';

type CoursesFilter = 'all' | CourseStatus | 'favorites';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.scss'
})
export class CoursesComponent {
  @Output() openCourseDetail = new EventEmitter<StudentCourseItem>();

  readonly coursesData$ = this.coursesService.getStudentCourses();

  readonly activeFilter = signal<CoursesFilter>('all');
  readonly searchTerm = signal('');

  constructor(private readonly coursesService: CoursesService) {}

  setFilter(filter: CoursesFilter): void {
    this.activeFilter.set(filter);
  }

  updateSearchTerm(value: string): void {
    this.searchTerm.set(value.trim().toLowerCase());
  }

  trackByCourseId(_index: number, course: StudentCourseItem): number {
    return course.id;
  }

  getFilteredCourses(courses: StudentCourseItem[]): StudentCourseItem[] {
    const activeFilter = this.activeFilter();
    const searchTerm = this.searchTerm();

    return courses.filter((course) => {
      const matchesSearch = !searchTerm
        || course.title.toLowerCase().includes(searchTerm)
        || course.category.toLowerCase().includes(searchTerm)
        || course.instructor.toLowerCase().includes(searchTerm);

      if (!matchesSearch) {
        return false;
      }

      if (activeFilter === 'all') {
        return true;
      }

      if (activeFilter === 'favorites') {
        return course.isFavorite;
      }

      return course.status === activeFilter;
    });
  }

  getStatusLabel(status: CourseStatus): string {
    if (status === 'in-progress') {
      return 'En progreso';
    }

    if (status === 'completed') {
      return 'Completado';
    }

    return 'Pendiente';
  }

  openDetail(course: StudentCourseItem): void {
    this.openCourseDetail.emit(course);
  }
}
