import { Injectable, signal } from '@angular/core';
import {
  CreatorCourseDraft,
  CreatorCourseModuleDraft,
  CreatorCourseLessonDraft,
  CreatorCourseLessonResource,
  CreatorCourseDraftCreatePayload,
  CreatorCourseDraftUpdatePayload
} from '@app/core/models/creator-course-draft.model';

@Injectable({
  providedIn: 'root'
})
export class CreatorCourseDraftService {
  private readonly storageKey = 'creator-course-drafts';
  private readonly draftsSignal = signal<CreatorCourseDraft[]>(this.loadDrafts());

  getDrafts(): CreatorCourseDraft[] {
    return this.draftsSignal();
  }

  getDraftById(draftId: string): CreatorCourseDraft | null {
    const draft = this.draftsSignal().find((item) => item.id === draftId);
    return draft ? this.cloneDraft(draft) : null;
  }

  createDraft(payload: CreatorCourseDraftCreatePayload): CreatorCourseDraft {
    const timestamp = new Date().toISOString();

    const draft: CreatorCourseDraft = {
      id: this.generateId(),
      backendCourseId:
        typeof payload.backendCourseId === 'number' ? payload.backendCourseId : null,
      title: payload.title,
      description: payload.description,
      category: payload.category,
      cuisineType: payload.cuisineType,
      difficulty: payload.difficulty,
      coverImageDataUrl: payload.coverImageDataUrl,
      status: 'draft',
      modules: [],
      courseResources: [],
      createdAt: timestamp,
      updatedAt: timestamp
    };

    this.draftsSignal.update((drafts) => [draft, ...drafts]);
    this.persistDrafts();

    return draft;
  }

  updateDraft(draftId: string, payload: CreatorCourseDraftUpdatePayload): CreatorCourseDraft | null {
    let updatedDraft: CreatorCourseDraft | null = null;

    this.draftsSignal.update((drafts) =>
      drafts.map((draft) => {
        if (draft.id !== draftId) {
          return draft;
        }

        updatedDraft = {
          ...draft,
          title: payload.title,
          description: payload.description,
          category: payload.category,
          cuisineType: payload.cuisineType,
          difficulty: payload.difficulty,
          coverImageDataUrl: payload.coverImageDataUrl,
          updatedAt: new Date().toISOString()
        };

        return updatedDraft;
      })
    );

    this.persistDrafts();
    return updatedDraft;
  }

  updateDraftModules(draftId: string, modules: CreatorCourseModuleDraft[]): CreatorCourseDraft | null {
    let updatedDraft: CreatorCourseDraft | null = null;

    this.draftsSignal.update((drafts) =>
      drafts.map((draft) => {
        if (draft.id !== draftId) {
          return draft;
        }

        updatedDraft = {
          ...draft,
          modules: this.normalizeModules(modules),
          updatedAt: new Date().toISOString()
        };

        return updatedDraft;
      })
    );

    if (!updatedDraft) {
      return null;
    }

    this.persistDrafts();
    return this.cloneDraft(updatedDraft);
  }

  updateDraftLessons(
    draftId: string,
    moduleId: string,
    lessons: CreatorCourseLessonDraft[]
  ): CreatorCourseDraft | null {
    let updatedDraft: CreatorCourseDraft | null = null;

    this.draftsSignal.update((drafts) =>
      drafts.map((draft) => {
        if (draft.id !== draftId) {
          return draft;
        }

        const nextModules = draft.modules.map((module) =>
          module.id === moduleId
            ? {
                ...module,
                lessons: this.normalizeLessons(lessons)
              }
            : module
        );

        updatedDraft = {
          ...draft,
          modules: this.normalizeModules(nextModules),
          updatedAt: new Date().toISOString()
        };

        return updatedDraft;
      })
    );

    if (!updatedDraft) {
      return null;
    }

    this.persistDrafts();
    return this.cloneDraft(updatedDraft);
  }

  updateCourseResources(
    draftId: string,
    resources: CreatorCourseLessonResource[]
  ): CreatorCourseDraft | null {
    let updatedDraft: CreatorCourseDraft | null = null;

    this.draftsSignal.update((drafts) =>
      drafts.map((draft) => {
        if (draft.id !== draftId) {
          return draft;
        }

        updatedDraft = {
          ...draft,
          courseResources: this.normalizeResources(resources),
          updatedAt: new Date().toISOString()
        };

        return updatedDraft;
      })
    );

    if (!updatedDraft) {
      return null;
    }

    this.persistDrafts();
    return this.cloneDraft(updatedDraft);
  }

  deleteDraft(draftId: string): boolean {
    const previousLength = this.draftsSignal().length;
    this.draftsSignal.update((drafts) => drafts.filter((draft) => draft.id !== draftId));

    const wasDeleted = this.draftsSignal().length < previousLength;
    if (wasDeleted) {
      this.persistDrafts();
    }

    return wasDeleted;
  }

  private loadDrafts(): CreatorCourseDraft[] {
    if (!this.canUseStorage()) {
      return [];
    }

    const rawValue = window.localStorage.getItem(this.storageKey);
    if (!rawValue) {
      return [];
    }

    try {
      const parsed = JSON.parse(rawValue) as CreatorCourseDraft[];
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.map((draft) => this.normalizeDraft(draft));
    } catch {
      return [];
    }
  }

  private persistDrafts(): void {
    if (!this.canUseStorage()) {
      return;
    }

    window.localStorage.setItem(this.storageKey, JSON.stringify(this.draftsSignal()));
  }

  private canUseStorage(): boolean {
    return typeof window !== 'undefined' && !!window.localStorage;
  }

  private normalizeDraft(draft: CreatorCourseDraft): CreatorCourseDraft {
    return {
      ...draft,
      backendCourseId:
        typeof draft.backendCourseId === 'number' ? draft.backendCourseId : null,
      cuisineType: typeof draft.cuisineType === 'string' ? draft.cuisineType : '',
      status: 'draft',
      courseResources: this.normalizeResources((draft as CreatorCourseDraft & { courseResources?: CreatorCourseLessonResource[] }).courseResources),
      modules: this.normalizeModules((draft as CreatorCourseDraft & { modules?: CreatorCourseModuleDraft[] }).modules)
    };
  }

  private normalizeModules(modules?: CreatorCourseModuleDraft[]): CreatorCourseModuleDraft[] {
    if (!Array.isArray(modules)) {
      return [];
    }

    return [...modules]
      .map((module, index) => ({
        ...module,
        id: module.id || this.generateId(),
        backendModuleId:
          typeof (module as CreatorCourseModuleDraft & { backendModuleId?: unknown }).backendModuleId === 'number'
            ? (module as CreatorCourseModuleDraft & { backendModuleId?: number }).backendModuleId ?? null
            : null,
        title: module.title || '',
        description: module.description || '',
        order: typeof module.order === 'number' ? module.order : index + 1,
        lessons: this.normalizeLessons((module as CreatorCourseModuleDraft & { lessons?: CreatorCourseLessonDraft[] }).lessons)
      }))
      .sort((a, b) => a.order - b.order)
      .map((module, index) => ({
        ...module,
        order: index + 1
      }));
  }

  private normalizeLessons(lessons?: CreatorCourseLessonDraft[]): CreatorCourseLessonDraft[] {
    if (!Array.isArray(lessons)) {
      return [];
    }

    return lessons
      .map((lesson, index) => {
        const legacyLesson = lesson as Partial<CreatorCourseLessonDraft>;
        const createdAt =
          typeof legacyLesson.createdAt === 'string' && legacyLesson.createdAt
            ? legacyLesson.createdAt
            : new Date().toISOString();
        const updatedAt =
          typeof legacyLesson.updatedAt === 'string' && legacyLesson.updatedAt
            ? legacyLesson.updatedAt
            : createdAt;

        const rawVideo =
          legacyLesson.video && typeof legacyLesson.video === 'object'
            ? legacyLesson.video
            : undefined;

        const normalizedResources = this.normalizeResources(legacyLesson.resources);

        const normalizedVisibility: CreatorCourseLessonDraft['visibility'] =
          legacyLesson.visibility === 'published' ? 'published' : 'draft-only';

        return {
          id: typeof legacyLesson.id === 'string' && legacyLesson.id ? legacyLesson.id : this.generateId(),
          backendLessonId:
            typeof (legacyLesson as Partial<CreatorCourseLessonDraft> & { backendLessonId?: unknown }).backendLessonId === 'number'
              ? ((legacyLesson as Partial<CreatorCourseLessonDraft> & { backendLessonId?: number }).backendLessonId ?? null)
              : null,
          title: typeof legacyLesson.title === 'string' ? legacyLesson.title : '',
          description: typeof legacyLesson.description === 'string' ? legacyLesson.description : '',
          order: typeof legacyLesson.order === 'number' ? legacyLesson.order : index + 1,
          isFreePreview: Boolean(legacyLesson.isFreePreview),
          resources: normalizedResources,
          video: {
            fileName: typeof rawVideo?.fileName === 'string' ? rawVideo.fileName : '',
            mimeType: typeof rawVideo?.mimeType === 'string' ? rawVideo.mimeType : '',
            sizeBytes: typeof rawVideo?.sizeBytes === 'number' ? rawVideo.sizeBytes : 0,
            storageUrl: typeof rawVideo?.storageUrl === 'string' ? rawVideo.storageUrl : '',
            optimizedAt:
              typeof rawVideo?.optimizedAt === 'string' && rawVideo.optimizedAt
                ? rawVideo.optimizedAt
                : updatedAt
          },
          visibility: normalizedVisibility,
          createdAt,
          updatedAt
        };
      })
      .sort((a, b) => a.order - b.order)
      .map((lesson, index) => ({
        ...lesson,
        order: index + 1
      }));
  }

  private normalizeResources(resources?: CreatorCourseLessonResource[]): CreatorCourseLessonResource[] {
    if (!Array.isArray(resources)) {
      return [];
    }

    return resources
      .map((resource, index) => {
        const createdAt =
          typeof resource.createdAt === 'string' && resource.createdAt
            ? resource.createdAt
            : new Date().toISOString();
        const updatedAt =
          typeof resource.updatedAt === 'string' && resource.updatedAt
            ? resource.updatedAt
            : createdAt;

        const normalizedType: CreatorCourseLessonResource['type'] =
          resource.type === 'pdf' || resource.type === 'image'
            ? resource.type
            : 'external-link';

        return {
          id: typeof resource.id === 'string' && resource.id ? resource.id : this.generateId(),
          title:
            typeof resource.title === 'string' && resource.title.trim()
              ? resource.title.trim()
              : `Recurso ${index + 1}`,
          type: normalizedType,
          url: typeof resource.url === 'string' ? resource.url.trim() : '',
          fileName: typeof resource.fileName === 'string' ? resource.fileName : '',
          mimeType: typeof resource.mimeType === 'string' ? resource.mimeType : '',
          sizeBytes: typeof resource.sizeBytes === 'number' ? resource.sizeBytes : 0,
          order: typeof resource.order === 'number' ? resource.order : index + 1,
          isExternalAccessible:
            typeof resource.isExternalAccessible === 'boolean'
              ? resource.isExternalAccessible
              : true,
          createdAt,
          updatedAt,
        };
      })
      .sort((a, b) => a.order - b.order)
      .map((resource, index) => ({
        ...resource,
        order: index + 1,
      }));
  }

  private cloneDraft(draft: CreatorCourseDraft): CreatorCourseDraft {
    return {
      ...draft,
      courseResources: draft.courseResources.map((resource) => ({ ...resource })),
      modules: draft.modules.map((module) => ({
        ...module,
        lessons: module.lessons.map((lesson) => ({
          ...lesson,
          resources: lesson.resources.map((resource) => ({ ...resource })),
          video: { ...lesson.video }
        }))
      }))
    };
  }

  private generateId(): string {
    return `${Date.now()}-${Math.floor(Math.random() * 100_000)}`;
  }
}