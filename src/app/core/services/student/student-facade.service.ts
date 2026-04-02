import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HomeService } from '@core/services/student/home.service';
import { CoursesService } from '@core/services/student/courses.service';
import { SearchService } from '@core/services/student/search.service';
import { ProfileService } from '@core/services/student/profile.service';
import { CoursePurchaseService } from '@core/services/student/course-purchase.service';
import { StudentCourseDetailMapperService } from '@core/services/student/student-course-detail-mapper.service';
import { HomeCourseItem, StudentHomeData } from '@student-models/home.model';
import { StudentCourseDetail } from '@student-models/course-detail.model';
import { StudentCourseItem, StudentCoursesData } from '@student-models/courses.model';
import { SearchResultItem, StudentSearchData } from '@student-models/search.model';
import { MyProfile, ProfileHubData, UpdateMyProfileRequest } from '@student-models/profile.model';

@Injectable()
export class StudentFacadeService {
  constructor(
    private readonly homeService: HomeService,
    private readonly coursesService: CoursesService,
    private readonly searchService: SearchService,
    private readonly profileService: ProfileService,
    private readonly coursePurchaseService: CoursePurchaseService,
    private readonly detailMapper: StudentCourseDetailMapperService
  ) {}

  getHomeData(): Observable<StudentHomeData> {
    return this.homeService.getHomeData();
  }

  getCoursesData(): Observable<StudentCoursesData> {
    return this.coursesService.getStudentCourses();
  }

  getSearchData(): Observable<StudentSearchData> {
    return this.searchService.getSearchData();
  }

  getProfileHubData(): Observable<ProfileHubData> {
    return this.profileService.getProfileHubData();
  }

  updateMyProfile(payload: UpdateMyProfileRequest): Observable<MyProfile> {
    return this.profileService.updateMyProfile(payload);
  }

  buildDetailFromHome(course: HomeCourseItem): StudentCourseDetail {
    return this.withPurchaseState(this.detailMapper.fromHomeCourse(course));
  }

  buildDetailFromCourses(course: StudentCourseItem): StudentCourseDetail {
    return this.withPurchaseState(this.detailMapper.fromStudentCourse(course));
  }

  buildDetailFromSearch(item: SearchResultItem): StudentCourseDetail {
    return this.withPurchaseState(this.detailMapper.fromSearchResult(item));
  }

  private withPurchaseState(detail: StudentCourseDetail): StudentCourseDetail {
    const isPurchased = detail.isPurchased || this.coursePurchaseService.isCoursePurchased(detail);
    return {
      ...detail,
      isPurchased
    };
  }
}
