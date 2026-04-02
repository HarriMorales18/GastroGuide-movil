import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BackendApiService } from '@core/services/backend-api.service';
import { UpdateUserProfileRequest, UserProfileResponse } from '@core/models/user-api.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly baseApiUrl = '/api/users';

  constructor(private readonly backendApi: BackendApiService) {}

  getCurrentUserFromApi(): Observable<UserProfileResponse> {
    return this.backendApi.get<UserProfileResponse>(`${this.baseApiUrl}/me`);
  }

  updateCurrentUserFromApi(payload: UpdateUserProfileRequest): Observable<UserProfileResponse> {
    return this.backendApi.put<UserProfileResponse>(`${this.baseApiUrl}/me`, payload);
  }

}
