import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ContentType,
  CourseLevel,
  PriceType,
  SearchFilters,
  SearchResultItem,
  SearchSort,
  StudentSearchData
} from '@student-models/search.model';
import { SearchService } from '@core/services/student/search.service';

type ArrayFilterMap = {
  categories: string;
  levels: CourseLevel;
  contentTypes: ContentType;
  tags: string;
};

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent {
  @Output() openCourseDetail = new EventEmitter<SearchResultItem>();

  readonly searchData$ = this.searchService.getSearchData();
  readonly showFilters = signal(true);

  readonly filters = signal<SearchFilters>({
    query: '',
    categories: [],
    levels: [],
    contentTypes: [],
    maxDuration: 180,
    ratingMin: 0,
    priceType: 'all',
    certificateOnly: false,
    tags: [],
    sortBy: 'relevance'
  });

  readonly levelOptions: Array<{ value: CourseLevel; label: string }> = [
    { value: 'beginner', label: 'Principiante' },
    { value: 'intermediate', label: 'Intermedio' },
    { value: 'advanced', label: 'Avanzado' }
  ];

  readonly contentTypeOptions: Array<{ value: ContentType; label: string }> = [
    { value: 'course', label: 'Curso' },
    { value: 'tip', label: 'Tip' },
    { value: 'masterclass', label: 'Masterclass' },
    { value: 'recipe', label: 'Receta' }
  ];

  readonly sortOptions: Array<{ value: SearchSort; label: string }> = [
    { value: 'relevance', label: 'Mas relevantes' },
    { value: 'rating', label: 'Mejor valorados' },
    { value: 'newest', label: 'Recientes' },
    { value: 'shortest', label: 'Menor duracion' }
  ];

  constructor(private readonly searchService: SearchService) {}

  toggleFilters(): void {
    this.showFilters.update((value) => !value);
  }

  updateQuery(value: string): void {
    this.filters.update((state) => ({
      ...state,
      query: value.trim().toLowerCase()
    }));
  }

  updateMaxDuration(value: number): void {
    this.filters.update((state) => ({
      ...state,
      maxDuration: Number(value)
    }));
  }

  updateRatingMin(value: number): void {
    this.filters.update((state) => ({
      ...state,
      ratingMin: Number(value)
    }));
  }

  updateSortBy(value: SearchSort): void {
    this.filters.update((state) => ({
      ...state,
      sortBy: value
    }));
  }

  updatePriceType(value: PriceType): void {
    this.filters.update((state) => ({
      ...state,
      priceType: value
    }));
  }

  toggleCertificateOnly(): void {
    this.filters.update((state) => ({
      ...state,
      certificateOnly: !state.certificateOnly
    }));
  }

  toggleCategory(category: string): void {
    this.toggleArrayFilter('categories', category);
  }

  toggleLevel(level: CourseLevel): void {
    this.toggleArrayFilter('levels', level);
  }

  toggleContentType(type: ContentType): void {
    this.toggleArrayFilter('contentTypes', type);
  }

  toggleTag(tag: string): void {
    this.toggleArrayFilter('tags', tag);
  }

  clearFilters(): void {
    this.filters.set({
      query: '',
      categories: [],
      levels: [],
      contentTypes: [],
      maxDuration: 180,
      ratingMin: 0,
      priceType: 'all',
      certificateOnly: false,
      tags: [],
      sortBy: 'relevance'
    });
  }

  trackByResultId(_index: number, item: SearchResultItem): number {
    return item.id;
  }

  isCategorySelected(category: string): boolean {
    return this.filters().categories.includes(category);
  }

  isLevelSelected(level: CourseLevel): boolean {
    return this.filters().levels.includes(level);
  }

  isContentTypeSelected(type: ContentType): boolean {
    return this.filters().contentTypes.includes(type);
  }

  isTagSelected(tag: string): boolean {
    return this.filters().tags.includes(tag);
  }

  getFilteredResults(data: StudentSearchData): SearchResultItem[] {
    const filters = this.filters();

    const filtered = data.results.filter((item) => {
      const matchesQuery = !filters.query
        || item.title.toLowerCase().includes(filters.query)
        || item.description.toLowerCase().includes(filters.query)
        || item.category.toLowerCase().includes(filters.query)
        || item.tags.some((tag) => tag.includes(filters.query));

      if (!matchesQuery) {
        return false;
      }

      if (filters.categories.length > 0 && !filters.categories.includes(item.category)) {
        return false;
      }

      if (filters.levels.length > 0 && !filters.levels.includes(item.level)) {
        return false;
      }

      if (filters.contentTypes.length > 0 && !filters.contentTypes.includes(item.contentType)) {
        return false;
      }

      if (item.durationMinutes > filters.maxDuration) {
        return false;
      }

      if (item.rating < filters.ratingMin) {
        return false;
      }

      if (filters.priceType === 'free' && !item.isFree) {
        return false;
      }

      if (filters.priceType === 'paid' && item.isFree) {
        return false;
      }

      if (filters.certificateOnly && !item.hasCertificate) {
        return false;
      }

      if (filters.tags.length > 0) {
        const hasTag = filters.tags.some((tag) => item.tags.includes(tag));
        if (!hasTag) {
          return false;
        }
      }

      return true;
    });

    return this.sortResults(filtered, filters.sortBy);
  }

  getPriceLabel(isFree: boolean): string {
    return isFree ? 'Gratis' : 'Pago';
  }

  getLevelLabel(level: CourseLevel): string {
    if (level === 'beginner') {
      return 'Principiante';
    }

    if (level === 'intermediate') {
      return 'Intermedio';
    }

    return 'Avanzado';
  }

  getContentTypeLabel(type: ContentType): string {
    if (type === 'course') {
      return 'Curso';
    }

    if (type === 'tip') {
      return 'Tip';
    }

    if (type === 'masterclass') {
      return 'Masterclass';
    }

    return 'Receta';
  }

  openDetail(item: SearchResultItem): void {
    this.openCourseDetail.emit(item);
  }

  private toggleArrayFilter<Key extends keyof ArrayFilterMap>(
    key: Key,
    value: ArrayFilterMap[Key]
  ): void {
    this.filters.update((state) => {
      const values = state[key] as Array<ArrayFilterMap[Key]>;
      const updatedValues = values.includes(value)
        ? values.filter((currentValue) => currentValue !== value)
        : [...values, value];

      return {
        ...state,
        [key]: updatedValues
      } as SearchFilters;
    });
  }

  private sortResults(results: SearchResultItem[], sortBy: SearchSort): SearchResultItem[] {
    const sorted = [...results];

    if (sortBy === 'rating') {
      sorted.sort((a, b) => b.rating - a.rating);
      return sorted;
    }

    if (sortBy === 'newest') {
      sorted.sort((a, b) => b.id - a.id);
      return sorted;
    }

    if (sortBy === 'shortest') {
      sorted.sort((a, b) => a.durationMinutes - b.durationMinutes);
      return sorted;
    }

    return sorted;
  }
}
