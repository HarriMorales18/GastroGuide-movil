export interface CourseModuleItem {
  id: number;
  title: string;
  durationMinutes: number;
  isCompleted: boolean;
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
  hasCertificate: boolean;
  updatedAtLabel: string;
  tags: string[];
  whatYouWillLearn: string[];
  modules: CourseModuleItem[];
}
