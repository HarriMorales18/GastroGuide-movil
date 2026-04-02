export interface CourseLessonDraft {
  title: string;
  summary: string;
  videoName: string;
}

export interface CourseModuleDraft {
  title: string;
  description: string;
  lessons: CourseLessonDraft[];
}
