import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MyProfile, ProfileHubData, PublicProfile, PublicProfileRole } from '@student-models/profile.model';
import { StudentFacadeService } from '@core/services/student/student-facade.service';

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
  readonly followedProfileIds = signal<number[]>([]);
  readonly isEditMode = signal(false);
  readonly isSaving = signal(false);

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

  readonly allPublicProfiles = computed(() => {
    const data = this.hubData();
    if (!data) {
      return [] as PublicProfile[];
    }

    return [...data.creators, ...data.students];
  });

  readonly selectedProfile = computed(() => {
    const profileId = this.selectedProfileId();
    if (profileId === null) {
      return null;
    }

    return this.allPublicProfiles().find((profile) => profile.id === profileId) ?? null;
  });

  readonly displayedProfile = computed<PublicProfile | MyProfile | null>(() => {
    const selected = this.selectedProfile();
    if (selected) {
      return selected;
    }

    return this.hubData()?.me ?? null;
  });

  readonly isViewingPublicProfile = computed(() => this.selectedProfile() !== null);

  readonly isFollowingCurrentProfile = computed(() => {
    const profile = this.selectedProfile();
    if (!profile) {
      return false;
    }

    return this.followedProfileIds().includes(profile.id);
  });

  constructor(
    private readonly studentFacade: StudentFacadeService
  ) {
    this.loadHubData();
  }

  setAudience(role: PublicProfileRole): void {
    this.activeAudience.set(role);
    this.isEditMode.set(false);
  }

  selectPublicProfile(profile: PublicProfile): void {
    this.selectedProfileId.set(profile.id);
    this.isEditMode.set(false);
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
    this.studentFacade.updateMyProfile({
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

  toggleFollow(): void {
    const profile = this.selectedProfile();
    if (!profile) {
      return;
    }

    this.followedProfileIds.update((ids) => {
      if (ids.includes(profile.id)) {
        return ids.filter((id) => id !== profile.id);
      }

      return [...ids, profile.id];
    });
  }

  goBackToMyProfile(): void {
    this.selectedProfileId.set(null);
    this.isEditMode.set(false);
  }

  getInitials(name: string): string {
    const words = name
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (!words.length) {
      return 'US';
    }

    if (words.length === 1) {
      return words[0].slice(0, 2).toUpperCase();
    }

    return `${words[0][0] ?? ''}${words[1][0] ?? ''}`.toUpperCase();
  }

  private loadHubData(): void {
    this.studentFacade.getProfileHubData().subscribe((data) => {
      this.hubData.set(data);
    });
  }
}
