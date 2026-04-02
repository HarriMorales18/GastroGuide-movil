import { Injectable } from '@angular/core';
import { HomeCourseItem } from '@student-models/home.model';
import { StudentCourseItem } from '@student-models/courses.model';
import { SearchResultItem } from '@student-models/search.model';
import { StudentCourseDetail } from '@student-models/course-detail.model';

@Injectable({
  providedIn: 'root'
})
export class StudentCourseDetailMapperService {
  fromHomeCourse(course: HomeCourseItem): StudentCourseDetail {
    const lessonsCompleted = Math.round(((course.progressPercentage ?? 0) / 100) * 12);

    return {
      id: course.id,
      title: course.title,
      category: course.category,
      instructor: course.author,
      thumbnailUrl: course.thumbnailUrl,
      description: 'Curso destacado para mejorar tus tecnicas y resultados en cocina paso a paso.',
      durationMinutes: course.durationMinutes,
      rating: course.rating,
      totalRatings: 800 + course.id,
      lessonsCompleted,
      lessonsTotal: 12,
      progressPercentage: course.progressPercentage ?? 0,
      levelLabel: 'Intermedio',
      contentTypeLabel: 'Curso',
      priceLabel: 'Incluido en tu plan',
      priceCop: 0,
      isPurchased: true,
      hasCertificate: true,
      updatedAtLabel: 'Actualizado recientemente',
      tags: ['chef tips', 'practico', 'destacado'],
      whatYouWillLearn: [
        'Dominar tecnicas clave para ejecutar recetas de forma consistente.',
        'Organizar mise en place y tiempos para cocinar con confianza.',
        'Evitar errores frecuentes y mejorar sabor, textura y presentacion.'
      ],
      modules: this.buildModules(12, lessonsCompleted)
    };
  }

  fromStudentCourse(course: StudentCourseItem): StudentCourseDetail {
    return {
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
      priceCop: course.status === 'pending' ? 99000 : 0,
      isPurchased: course.status !== 'pending',
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
  }

  fromSearchResult(item: SearchResultItem): StudentCourseDetail {
    const lessonsTotal = item.contentType === 'tip' ? 1 : 10;
    const lessonsCompleted = item.contentType === 'tip' ? 0 : 2;

    return {
      id: item.id,
      title: item.title,
      category: item.category,
      instructor: item.instructor,
      thumbnailUrl: item.thumbnailUrl,
      description: item.description,
      durationMinutes: item.durationMinutes,
      rating: item.rating,
      totalRatings: item.totalRatings,
      lessonsCompleted,
      lessonsTotal,
      progressPercentage: item.contentType === 'tip' ? 0 : 20,
      levelLabel: this.mapLevel(item.level),
      contentTypeLabel: this.mapContentType(item.contentType),
      priceLabel: item.isFree ? 'Gratis' : 'Pago',
      priceCop: item.isFree ? 0 : 89000,
      isPurchased: item.isFree,
      hasCertificate: item.hasCertificate,
      updatedAtLabel: item.updatedAtLabel,
      tags: item.tags,
      whatYouWillLearn: [
        'Comprender conceptos clave explicados por expertos.',
        'Llevar la teoria a practica en escenarios reales.',
        'Aumentar consistencia y calidad en cada preparacion.'
      ],
      modules: this.buildModules(lessonsTotal, lessonsCompleted)
    };
  }

  private buildModules(total: number, completed: number): Array<{
    id: number;
    title: string;
    description: string;
    durationMinutes: number;
    isCompleted: boolean;
    lessons: Array<{
      id: number;
      title: string;
      durationMinutes: number;
      isCompleted: boolean;
      videoUrl: string;
      summary: string;
    }>;
  }> {
    const moduleCount = Math.max(1, Math.min(4, Math.ceil(total / 3)));
    const lessonDistribution = this.distributeLessons(total, moduleCount);
    let lessonCounter = 0;
    let completedCounter = 0;

    return lessonDistribution.map((lessonsInModule, index) => {
      const moduleLessons = Array.from({ length: lessonsInModule }, (_, lessonIndex) => {
        lessonCounter += 1;
        const isCompleted = completedCounter < completed;

        if (isCompleted) {
          completedCounter += 1;
        }

        return {
          id: index * 100 + lessonIndex + 1,
          title: `Leccion ${lessonCounter}`,
          durationMinutes: 6 + ((index + lessonIndex) % 4) * 3,
          isCompleted,
          videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
          summary: `Contenido practico para reforzar el modulo ${index + 1}.`
        };
      });

      const completedLessons = moduleLessons.filter((lesson) => lesson.isCompleted).length;

      return {
        id: index + 1,
        title: `Modulo ${index + 1}`,
        description: `Bloque formativo con ${lessonsInModule} lecciones enfocadas en progresion practica.`,
        durationMinutes: moduleLessons.reduce((accumulator, lesson) => accumulator + lesson.durationMinutes, 0),
        isCompleted: completedLessons === moduleLessons.length,
        lessons: moduleLessons
      };
    });
  }

  private distributeLessons(totalLessons: number, moduleCount: number): number[] {
    const base = Math.floor(totalLessons / moduleCount);
    let remainder = totalLessons % moduleCount;

    return Array.from({ length: moduleCount }, () => {
      const count = base + (remainder > 0 ? 1 : 0);
      remainder -= remainder > 0 ? 1 : 0;
      return Math.max(1, count);
    });
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
}
