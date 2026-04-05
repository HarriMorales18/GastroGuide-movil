export interface CourseLessonResponse {
  id: number;
  title: string;
  durationMinutes: number;
}

export interface CourseModuleResponse {
  id: number;
  title: string;
  lessons: CourseLessonResponse[];
}

export interface CourseDetailResponse {
  id: number;
  title: string;
  description: string;
  category: string;
  modules: CourseModuleResponse[];
}

export interface PublishCourseRequest {
  title: string;
  description: string;
  category: string;
  modules: Array<{
    title: string;
    lessons: Array<{
      title: string;
      summary?: string;
    }>;
  }>;
}

export interface CreateCourseRequest {
  title: string;
  description: string;
  difficultyLevel: string;
  category: string;
  cuisineType: string;
}

export interface CreateCourseResponse {
  id?: number;
  courseId?: number;
  title?: string;
  description?: string;
  difficultyLevel?: string;
  category?: string;
  cuisineType?: string;
}

export interface UpdateCourseRequest {
  title?: string;
  description?: string;
  difficultyLevel?: string;
  category?: string;
  cuisineType?: string;
  coverImageUrl?: string;
  tags?: string;
  language?: string;
}

export type UpdateCourseResponse = string;

export interface CreateModuleRequest {
  courseId: number;
  title: string;
  description: string;
}

export interface CreateModuleResponse {
  id?: number;
  moduleId?: number;
}

export interface UpdateModuleRequest {
  id: number;
  title: string;
  description?: string;
}

export interface UpdateModuleResponse {
  module?: {
    id?: number;
    title?: string;
    description?: string;
  };
}

export type LessonType = 'VIDEO' | 'TEXT' | 'QUIZ' | 'PRACTICE' | 'DOWNLOADABLE';

export type LessonResourceType =
  | 'PDF_RECIPE'
  | 'INGREDIENT_LIST'
  | 'IMAGE'
  | 'EXTERNAL_LINK'
  | 'CHEF_NOTES';

export interface CreateLessonRequest {
  moduleId: number;
  title: string;
  description: string;
  isFreePreview: boolean;
  lessonType: LessonType;
  videoUrl?: string;
  resourceType?: LessonResourceType;
  fileUrl?: string;
}

export interface CreateLessonResponse {
  id?: number;
  lessonId?: number;
}
