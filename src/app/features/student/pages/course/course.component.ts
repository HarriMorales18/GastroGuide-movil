import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CourseDetailStateService } from '@core/services/student/course-detail-state.service';
import { CourseProgressService } from '@core/services/student/course-progress.service';
import { AppAlertService } from '@core/services/app-alert.service';
import { StudentCourseDetail } from '@student-models/course-detail.model';

interface LessonView {
  id: number;
  title: string;
  moduleTitle: string;
  moduleDescription: string;
  durationMinutes: number;
  isCompleted: boolean;
  videoUrl: string;
  summary: string;
}

interface CourseComment {
  id: number;
  author: string;
  text: string;
  createdAt: string;
}

@Component({
  selector: 'app-student-course',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './course.component.html',
  styleUrl: './course.component.scss'
})
export class CourseComponent {
  readonly course = this.courseDetailState.selectedCourse;
  readonly currentLessonId = signal<number | null>(null);
  readonly currentModuleFilter = signal<string>('all');
  readonly isCompletingLesson = signal(false);
  newComment = '';

  readonly lessons = computed<LessonView[]>(() => {
    const selectedCourse = this.course();

    if (!selectedCourse) {
      return [];
    }

    return selectedCourse.modules.reduce<LessonView[]>((accumulator, module) => {
      const lessonViews = module.lessons.map<LessonView>((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        moduleTitle: module.title,
        moduleDescription: module.description,
        durationMinutes: lesson.durationMinutes,
        isCompleted: lesson.isCompleted,
        videoUrl: lesson.videoUrl ?? 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
        summary: lesson.summary ?? `En esta leccion aprenderas tecnicas practicas para ${selectedCourse.title.toLowerCase()} con enfoque en resultados reales.`
      }));

      return accumulator.concat(lessonViews);
    }, []);
  });

  readonly moduleOptions = computed<string[]>(() => {
    const options = new Set<string>(['all']);

    for (const lesson of this.lessons()) {
      options.add(lesson.moduleTitle);
    }

    return Array.from(options);
  });

  readonly filteredLessons = computed<LessonView[]>(() => {
    const selectedFilter = this.currentModuleFilter();

    if (selectedFilter === 'all') {
      return this.lessons();
    }

    return this.lessons().filter((lesson) => lesson.moduleTitle === selectedFilter);
  });

  readonly activeLesson = computed<LessonView | null>(() => {
    const availableLessons = this.lessons();

    if (!availableLessons.length) {
      return null;
    }

    const selectedLessonId = this.currentLessonId();

    if (!selectedLessonId) {
      return availableLessons[0];
    }

    return availableLessons.find((lesson) => lesson.id === selectedLessonId) ?? availableLessons[0];
  });

  readonly comments = signal<CourseComment[]>([
    {
      id: 1,
      author: 'Marta R.',
      text: 'Excelente explicacion. El tip de temperatura me ayudo muchisimo.',
      createdAt: 'Hace 2 horas'
    },
    {
      id: 2,
      author: 'Leo V.',
      text: 'Me gustaria un ejemplo adicional para servicio en volumen alto.',
      createdAt: 'Hace 1 dia'
    }
  ]);

  constructor(
    private readonly courseDetailState: CourseDetailStateService,
    private readonly courseProgressService: CourseProgressService,
    private readonly appAlert: AppAlertService
  ) {}

  trackByLessonId(index: number, lesson: LessonView): number {
    return lesson.id;
  }

  setModuleFilter(filter: string): void {
    this.currentModuleFilter.set(filter);
  }

  selectLesson(lessonId: number): void {
    this.currentLessonId.set(lessonId);
  }

  completeActiveLesson(): void {
    const selectedCourse = this.course();
    const lesson = this.activeLesson();

    if (!selectedCourse || !lesson) {
      return;
    }

    if (lesson.isCompleted) {
      this.appAlert.info('La leccion ya estaba completada. Te llevamos a la siguiente.');
      this.navigateToNextLesson(lesson.id);
      return;
    }

    this.isCompletingLesson.set(true);

    this.courseProgressService.completeLesson(selectedCourse.id, lesson.id).subscribe((response) => {
      this.isCompletingLesson.set(false);

      if (!response.success) {
        this.appAlert.error('No se pudo registrar el progreso. Intenta de nuevo.');
        return;
      }

      this.markLessonCompletedInState(selectedCourse, lesson.id);
      this.appAlert.success('Leccion marcada como completada.');
      this.navigateToNextLesson(lesson.id);
    });
  }

  addComment(): void {
    const value = this.newComment.trim();

    if (!value) {
      return;
    }

    const latestId = this.comments().length ? Math.max(...this.comments().map((item) => item.id)) : 0;

    this.comments.update((items) => [
      {
        id: latestId + 1,
        author: 'Tu',
        text: value,
        createdAt: 'Ahora'
      },
      ...items
    ]);

    this.newComment = '';
  }

  private markLessonCompletedInState(course: StudentCourseDetail, lessonId: number): void {
    const updatedModules = course.modules.map((module) => {
      const updatedLessons = module.lessons.map((lesson) =>
        lesson.id === lessonId ? { ...lesson, isCompleted: true } : lesson
      );

      const completedInModule = updatedLessons.filter((lesson) => lesson.isCompleted).length;

      return {
        ...module,
        lessons: updatedLessons,
        isCompleted: completedInModule === updatedLessons.length
      };
    });

    const lessonsTotal = updatedModules.reduce((accumulator, module) => accumulator + module.lessons.length, 0);
    const lessonsCompleted = updatedModules.reduce(
      (accumulator, module) => accumulator + module.lessons.filter((lesson) => lesson.isCompleted).length,
      0
    );

    const progressPercentage = lessonsTotal > 0
      ? Math.round((lessonsCompleted / lessonsTotal) * 100)
      : 0;

    this.courseDetailState.setSelectedCourse({
      ...course,
      modules: updatedModules,
      lessonsCompleted,
      lessonsTotal,
      progressPercentage
    });
  }

  private navigateToNextLesson(currentLessonId: number): void {
    const allLessons = this.lessons();
    const currentIndex = allLessons.findIndex((lesson) => lesson.id === currentLessonId);

    if (currentIndex < 0) {
      return;
    }

    const nextLesson = allLessons[currentIndex + 1];

    if (!nextLesson) {
      this.appAlert.success('Has completado la ultima leccion del curso.');
      return;
    }

    this.currentLessonId.set(nextLesson.id);
  }
}
