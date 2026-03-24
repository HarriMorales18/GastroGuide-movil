export type CourseStatus = 'in-progress' | 'completed' | 'pending';

export interface StudentCourseItem {
  id: number;
  title: string;
  category: string;
  instructor: string;
  durationMinutes: number;
  progressPercentage: number;
  lessonsCompleted: number;
  lessonsTotal: number;
  status: CourseStatus;
  isFavorite: boolean;
  thumbnailUrl: string;
  updatedAtLabel: string;
}

export interface StudentCoursesSummary {
  totalCourses: number;
  inProgress: number;
  completed: number;
}

export interface StudentCoursesData {
  studentName: string;
  summary: StudentCoursesSummary;
  courses: StudentCourseItem[];
}
