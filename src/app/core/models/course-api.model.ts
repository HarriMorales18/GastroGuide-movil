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
