export interface StudentCourseLesson {
  id: number;
  title: string;
  durationMinutes: number;
  isCompleted: boolean;
  videoUrl?: string;
  summary?: string;
}

export interface CourseModuleItem {
  id: number;
  title: string;
  description: string;
  durationMinutes: number;
  isCompleted: boolean;
  lessons: StudentCourseLesson[];
}

export interface StudentCourseDetail {
  id: number;
  title: string;
  category: string;
  instructor: string;
  thumbnailUrl: string;
  description: string;
  durationMinutes: number;
  rating: number;
  totalRatings: number;
  lessonsCompleted: number;
  lessonsTotal: number;
  progressPercentage: number;
  levelLabel: string;
  contentTypeLabel: string;
  priceLabel: string;
  priceCop: number;
  isPurchased: boolean;
  hasCertificate: boolean;
  updatedAtLabel: string;
  tags: string[];
  whatYouWillLearn: string[];
  modules: CourseModuleItem[];
}
