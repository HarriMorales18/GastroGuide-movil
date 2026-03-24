import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth.service';
import { ProfileHubData, PublicProfile, PublicProfileRole } from './profile.model';
import { ProfileService } from './profile.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  readonly hubData = signal<ProfileHubData | null>(null);
  readonly activeAudience = signal<PublicProfileRole>('creator');
  readonly selectedProfileId = signal<number | null>(null);
  readonly isEditMode = signal(false);
  readonly isSaving = signal(false);
  readonly showSettingsEntry = signal(false);

  readonly editForm = signal({
    displayName: '',
    headline: '',
    bio: '',
    city: ''
  });

  readonly audienceProfiles = computed(() => {
    const data = this.hubData();
    if (!data) {
      return [] as PublicProfile[];
    }

    return this.activeAudience() === 'creator' ? data.creators : data.students;
  });

  readonly selectedProfile = computed(() => {
    const profileId = this.selectedProfileId();
    if (profileId === null) {
      return null;
    }

    return this.audienceProfiles().find((profile) => profile.id === profileId) ?? null;
  });

  constructor(
    private authService: AuthService,
    private profileService: ProfileService
  ) {
    this.loadHubData();
  }

  setAudience(role: PublicProfileRole): void {
    this.activeAudience.set(role);
    this.selectedProfileId.set(null);
  }

  selectPublicProfile(profile: PublicProfile): void {
    this.selectedProfileId.set(profile.id);
  }

  openEditProfile(): void {
    const data = this.hubData();
    if (!data) {
      return;
    }

    this.editForm.set({
      displayName: data.me.displayName,
      headline: data.me.headline,
      bio: data.me.bio,
      city: data.me.city
    });

    this.isEditMode.set(true);
  }

  closeEditProfile(): void {
    this.isEditMode.set(false);
  }

  saveProfileChanges(): void {
    const data = this.hubData();
    if (!data) {
      return;
    }

    const form = this.editForm();

    this.isSaving.set(true);
    this.profileService.updateMyProfile({
      displayName: form.displayName,
      headline: form.headline,
      bio: form.bio,
      city: form.city
    }).subscribe((updatedProfile) => {
      this.hubData.set({
        ...data,
        me: updatedProfile
      });
      this.isSaving.set(false);
      this.isEditMode.set(false);
    });
  }

  updateField(field: 'displayName' | 'headline' | 'bio' | 'city', value: string): void {
    this.editForm.update((state) => ({
      ...state,
      [field]: value
    }));
  }

  openSettingsEntryPoint(): void {
    this.showSettingsEntry.set(true);
  }

  closeSettingsEntryPoint(): void {
    this.showSettingsEntry.set(false);
  }

  logout(): void {
    this.authService.logoutWithBackend().subscribe(() => {
      window.location.reload();
    });
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((chunk) => (chunk ? chunk[0] : ''))
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  private loadHubData(): void {
    this.profileService.getProfileHubData().subscribe((data) => {
      this.hubData.set(data);
    });
  }
}
