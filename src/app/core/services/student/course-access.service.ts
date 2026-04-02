import { Injectable, signal } from '@angular/core';

@Injectable()
export class CourseAccessService {
  readonly canAccessCourse = signal(false);
  readonly openCourseRequest = signal(0);
  readonly openPurchaseRequest = signal(0);
  readonly openCourseDetailRequest = signal(0);

  grantAccessAndOpen(): void {
    this.canAccessCourse.set(true);
    this.openCourseRequest.update((value) => value + 1);
  }

  requestPurchaseAndOpen(): void {
    this.canAccessCourse.set(false);
    this.openPurchaseRequest.update((value) => value + 1);
  }

  requestCourseDetailAndOpen(): void {
    this.canAccessCourse.set(false);
    this.openCourseDetailRequest.update((value) => value + 1);
  }

  revokeAccess(): void {
    this.canAccessCourse.set(false);
  }
}
