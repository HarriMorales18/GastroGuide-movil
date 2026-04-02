export interface UserProfileResponse {
  id: number;
  email: string;
  displayName: string;
  role: string;
  city?: string;
}

export interface UpdateUserProfileRequest {
  displayName?: string;
  city?: string;
}
