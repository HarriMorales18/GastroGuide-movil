export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
export type ContentType = 'course' | 'tip' | 'masterclass' | 'recipe';
export type PriceType = 'all' | 'free' | 'paid';
export type SearchSort = 'relevance' | 'rating' | 'newest' | 'shortest';

export interface SearchResultItem {
  id: number;
  title: string;
  description: string;
  category: string;
  level: CourseLevel;
  contentType: ContentType;
  instructor: string;
  durationMinutes: number;
  rating: number;
  totalRatings: number;
  isFree: boolean;
  hasCertificate: boolean;
  tags: string[];
  thumbnailUrl: string;
  updatedAtLabel: string;
}

export interface SearchOptions {
  categories: string[];
  tags: string[];
}

export interface SearchFilters {
  query: string;
  categories: string[];
  levels: CourseLevel[];
  contentTypes: ContentType[];
  maxDuration: number;
  ratingMin: number;
  priceType: PriceType;
  certificateOnly: boolean;
  tags: string[];
  sortBy: SearchSort;
}

export interface StudentSearchData {
  options: SearchOptions;
  results: SearchResultItem[];
}
