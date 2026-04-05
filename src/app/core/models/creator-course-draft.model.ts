export type CreatorCourseDifficulty = 'principiante' | 'intermedio' | 'avanzado';

export const CREATOR_COURSE_CATEGORIES: string[] = [
  'Cocina internacional',
  'Cocina regional',
  'Panaderia',
  'Pasteleria',
  'Cocteleria',
  'Reposteria',
  'Tecnicas culinarias',
  'Emplatado y presentacion'
];

export const CREATOR_COURSE_DIFFICULTIES: CreatorCourseDifficulty[] = ['principiante', 'intermedio', 'avanzado'];

export type CreatorCourseResourceType = 'pdf' | 'image' | 'external-link';

export interface CreatorCourseLessonResource {
  id: string;
  title: string;
  type: CreatorCourseResourceType;
  url: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  order: number;
  isExternalAccessible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatorCourseLessonVideo {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storageUrl: string;
  optimizedAt: string;
}

export type CreatorCourseLessonVisibility = 'draft-only' | 'published';

export interface CreatorCourseLessonDraft {
  id: string;
  backendLessonId?: number | null;
  title: string;
  description: string;
  order: number;
  isFreePreview: boolean;
  resources: CreatorCourseLessonResource[];
  video: CreatorCourseLessonVideo;
  visibility: CreatorCourseLessonVisibility;
  createdAt: string;
  updatedAt: string;
}

export interface CreatorCourseModuleDraft {
  id: string;
  backendModuleId?: number | null;
  title: string;
  description: string;
  order: number;
  lessons: CreatorCourseLessonDraft[];
}

export interface CreatorCourseDraft {
  id: string;
  backendCourseId?: number | null;
  title: string;
  description: string;
  category: string;
  cuisineType: string;
  difficulty: CreatorCourseDifficulty;
  coverImageDataUrl: string;
  status: 'draft';
  modules: CreatorCourseModuleDraft[];
  courseResources: CreatorCourseLessonResource[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatorCourseDraftCreatePayload {
  backendCourseId?: number | null;
  title: string;
  description: string;
  category: string;
  cuisineType: string;
  difficulty: CreatorCourseDifficulty;
  coverImageDataUrl: string;
}

export interface CreatorCourseDraftUpdatePayload {
  title: string;
  description: string;
  category: string;
  cuisineType: string;
  difficulty: CreatorCourseDifficulty;
  coverImageDataUrl: string;
}