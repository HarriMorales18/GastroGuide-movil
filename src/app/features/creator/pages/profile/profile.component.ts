import { Component, CUSTOM_ELEMENTS_SCHEMA, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { createOutline, saveOutline, closeOutline, warningOutline } from 'ionicons/icons';
import { ProfileService, CreatorProfile } from './profile.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  readonly profile = signal<CreatorProfile | null>(null);
  readonly isEditMode = signal(false);
  readonly isSaving = signal(false);

  readonly editForm = signal({
    displayName: '',
    headline: '',
    bio: '',
    specialties: ''
  });

  readonly displayEmail = computed(() => {
    const profile = this.profile();
    return profile?.id ? `creator${profile.id}@gastroguide.com` : '';
  });

  constructor(private profileService: ProfileService) {
    addIcons({
      createOutline,
      saveOutline,
      closeOutline,
      warningOutline
    });

    this.loadProfile();
  }

  openEditProfile(): void {
    const profile = this.profile();
    if (!profile) return;

    this.editForm.set({
      displayName: profile.displayName,
      headline: profile.headline,
      bio: profile.bio,
      specialties: profile.specialties.join(', ')
    });

    this.isEditMode.set(true);
  }

  closeEditProfile(): void {
    this.isEditMode.set(false);
  }

  saveProfileChanges(): void {
    const profile = this.profile();
    const form = this.editForm();

    if (!profile || !form.displayName.trim()) {
      return;
    }

    this.isSaving.set(true);

    const updatedProfile: Partial<CreatorProfile> = {
      displayName: form.displayName,
      headline: form.headline,
      bio: form.bio,
      specialties: form.specialties
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    };

    this.profileService.updateCreatorProfile(updatedProfile).subscribe((updated) => {
      this.profile.set(updated);
      this.isSaving.set(false);
      this.isEditMode.set(false);
    });
  }

  updateField(field: 'displayName' | 'headline' | 'bio' | 'specialties', value: string): void {
    this.editForm.update((state) => ({
      ...state,
      [field]: value
    }));
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

  private loadProfile(): void {
    this.profileService.getCreatorProfile().subscribe((profile) => {
      this.profile.set(profile);
    });
  }
}
