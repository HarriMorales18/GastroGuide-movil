import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { of } from 'rxjs';
import { AuthService } from '@core/services/auth.service';
import { CourseService } from '@core/services/course.service';
import { CreatorCourseDraftService } from '@app/core/services/creator-course-draft.service';

import { LessonsComponent } from './lessons.component';

describe('LessonsComponent', () => {
  let component: LessonsComponent;
  let fixture: ComponentFixture<LessonsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), LessonsComponent],
      providers: [
        {
          provide: AuthService,
          useValue: {
            getRole: () => 'creator',
          },
        },
        {
          provide: CreatorCourseDraftService,
          useValue: {
            getDraftById: () => null,
            updateDraftLessons: () => null,
            updateCourseResources: () => null,
            updateDraftModules: () => null,
          },
        },
        {
          provide: CourseService,
          useValue: {
            createModuleFromApi: () => of({ id: 1 }),
            createLessonFromApi: () => of({ id: 1 }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LessonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
