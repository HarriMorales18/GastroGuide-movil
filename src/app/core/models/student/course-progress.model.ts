export interface CompleteLessonRequest {
  completedAt: string;
}

export interface CompleteLessonResponse {
  success: boolean;
  courseId: number;
  lessonId: number;
  nextLessonId?: number;
  completedLessons?: number;
  progressPercentage?: number;
}
