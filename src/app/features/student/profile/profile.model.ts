export type PublicProfileRole = 'student' | 'creator';

export interface ProfileStats {
  completedCourses: number;
  inProgressCourses: number;
  followers: number;
  following: number;
}

export interface PublicProfile {
  id: number;
  role: PublicProfileRole;
  displayName: string;
  username: string;
  headline: string;
  bio: string;
  avatarUrl: string | null;
  specialties: string[];
  stats: ProfileStats;
}

export interface MyProfile extends PublicProfile {
  email: string;
  city: string;
  joinedAtLabel: string;
}

export interface ProfileHubData {
  me: MyProfile;
  creators: PublicProfile[];
  students: PublicProfile[];
}

export interface UpdateMyProfileRequest {
  displayName: string;
  headline: string;
  bio: string;
  city: string;
}
