import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { addCircleOutline, personCircleOutline, statsChartOutline, menuOutline } from 'ionicons/icons';
import { AuthService } from 'src/app/core/services/auth.service';
import { CreateCourseComponent } from '../create-course/create-course.component';
import { ProfileComponent } from '../profile/profile.component';
import { StatisticsComponent } from '../statistics/statistics.component';
import { ConfigComponent } from '../config/config.component';
import { ProfileService } from '../profile/profile.service';

type CreatorTab = 'create' | 'statistics' | 'profile' | 'config';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  standalone: true,
  imports: [CommonModule, CreateCourseComponent, StatisticsComponent, ProfileComponent, ConfigComponent],
  providers: [ProfileService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LayoutComponent {
  activeTab: CreatorTab = 'create';
  readonly defaultAvatarUrl = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80';
  readonly loggedUserAvatarUrl = signal<string | null>(null);
  readonly loggedUserDisplayName = signal('Mi perfil');

  constructor(
    private authService: AuthService,
    private router: Router,
    private profileService: ProfileService
  ) {
    addIcons({
      addCircleOutline,
      statsChartOutline,
      personCircleOutline,
      menuOutline
    });

    this.loadLoggedUserProfile();
  }

  setActiveTab(tab: CreatorTab): void {
    this.activeTab = tab;
  }

  logout() {
    this.authService.logoutWithBackend().subscribe(() => {
      this.router.navigate(['/']);
    });
  }

  private loadLoggedUserProfile(): void {
    this.profileService.getCreatorProfile().subscribe((data) => {
      this.loggedUserDisplayName.set(data.displayName || 'Mi perfil');
      this.loggedUserAvatarUrl.set(data.avatarUrl);
    });
  }

}
