import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { CreateCourseComponent } from '../create-course/create-course.component';
import { ProfileComponent } from '../profile/profile.component';
import { StatisticsComponent } from '../statistics/statistics.component';

type CreatorTab = 'create' | 'statistics' | 'profile';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  standalone: true,
  imports: [CommonModule, CreateCourseComponent, StatisticsComponent, ProfileComponent],
})
export class LayoutComponent {
  activeTab: CreatorTab = 'create';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  setActiveTab(tab: CreatorTab): void {
    this.activeTab = tab;
  }

  logout() {
    this.authService.logoutWithBackend().subscribe(() => {
      this.router.navigate(['/']);
    });
  }

}
