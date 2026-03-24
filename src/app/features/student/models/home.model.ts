export type HomeSectionKey = 'continueLearning' | 'recommended' | 'popular';

export interface StudentHomeProfile {
  id: number;
  firstName: string;
  lastName: string;
  activeCourses: number;
}

export interface HomeCourseItem {
  id: number;
  title: string;
  category: string;
  durationMinutes: number;
  author: string;
  rating: number;
  progressPercentage?: number;
  thumbnailUrl: string;
}

export interface HomeCourseSection {
  key: HomeSectionKey;
  title: string;
  subtitle: string;
  courses: HomeCourseItem[];
}

export interface StudentHomeData {
  student: StudentHomeProfile;
  sections: HomeCourseSection[];
}
