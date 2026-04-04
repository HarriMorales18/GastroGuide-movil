import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { catchError, finalize, from, map, Observable, of, shareReplay, switchMap, take } from 'rxjs';
import { User, UserRole } from '@core/models/user.model';
import { BackendApiService } from '@core/services/backend-api.service';
import { environment } from 'src/environments/environment';

interface LoginResponse {
  token?: string;
  accessToken?: string;
  jwt?: string;
  refreshToken?: string;
}

interface RefreshResponse {
  token?: string;
  accessToken?: string;
  jwt?: string;
}

interface StudentRegisterRequest {
  username: string;
  email: string;
  password: string;
}

interface CreatorRegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  identificationNumber: string;
  identificationType: string;
  nationality: string;
  avatarUrl: string;
  phoneNumber: string;
  birthDate: string;
  specialization: string;
}

export interface AuthApiError {
  endpoint: string;
  status: number;
  message: string;
  details: unknown;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private currentUser = signal<User | null>(null);
  private readonly tokenStorageKey = 'auth_token';
  private readonly refreshTokenStorageKey = 'refresh_token';
  private readonly userStorageKey = 'auth_user';
  private readonly lastApiError = signal<AuthApiError | null>(null);

  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private refreshRequest$: Observable<string | null> | null = null;
  private refreshTimerId: number | null = null;
  private readonly refreshAheadMs = 60_000;
  private readonly refreshRetryMs = 30_000;
  private readonly refreshFallbackMs = 4 * 60_000;

  // usuarios simulados
  private users: User[] = [
    { id: 1, email: 'student@test.com', password: '1234', role: 'student' },
    { id: 2, email: 'creator@test.com', password: '1234', role: 'creator' },
    { id: 3, email: 'admin@test.com', password: '1234', role: 'admin' },
  ];

  constructor(
    private backendApi: BackendApiService,
    private storage: Storage
  ) {
    this.initStorage();
  }

  private async initStorage() {
    await this.storage.create();
    await this.hydrateSessionFromStorage();
  }

  private async hydrateSessionFromStorage() {
    this.accessToken = await this.storage.get(this.tokenStorageKey);
    this.refreshToken = await this.storage.get(this.refreshTokenStorageKey);

    const storedUser = await this.storage.get(this.userStorageKey);
    if (storedUser) {
      this.currentUser.set(storedUser as User);
      this.scheduleAccessTokenRefresh(this.accessToken);
      return;
    }

    if (this.accessToken) {
      const role = this.getRoleFromJwt(this.accessToken);
      if (role) {
        this.currentUser.set({
          id: 0,
          email: '',
          password: '',
          role,
        });
      }
    }

    this.scheduleAccessTokenRefresh(this.accessToken);
  }

  private isUserRole(value: unknown): value is UserRole {
    return value === 'student' || value === 'creator' || value === 'admin';
  }

  private normalizeRole(value: unknown): UserRole | null {
    if (typeof value !== 'string') {
      return null;
    }

    const normalized = value.toLowerCase().replace(/^role_/, '');
    return this.isUserRole(normalized) ? normalized : null;
  }

  getJwtPayload(token: string): Record<string, unknown> | null {
    try {
      const parts = token.split('.');

      if (parts.length < 2) {
        return null;
      }

      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padding = '='.repeat((4 - (base64.length % 4)) % 4);
      const payload = atob(base64 + padding);

      return JSON.parse(payload) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  getRoleFromJwt(token: string): UserRole | null {
    const payload = this.getJwtPayload(token);

    if (!payload) {
      return null;
    }

    const roleFromClaim = this.normalizeRole(payload['role']);
    if (roleFromClaim) {
      return roleFromClaim;
    }

    const authorities = payload['authorities'];
    if (Array.isArray(authorities)) {
      for (const authority of authorities) {
        const role = this.normalizeRole(authority);
        if (role) {
          return role;
        }
      }
    }

    return null;
  }

  private extractToken(response: LoginResponse): string | null {
    return response.token || response.accessToken || response.jwt || null;
  }

  private extractRefreshToken(response: LoginResponse): string | null {
    return response.refreshToken || null;
  }

  private setSessionFromRole(role: UserRole, email: string) {
    const user = {
      id: 0,
      email,
      password: '',
      role,
    };

    this.currentUser.set(user);
    void this.storage.set(this.userStorageKey, user);
  }

  private persistAccessToken(token: string) {
    this.accessToken = token;
    this.scheduleAccessTokenRefresh(token);
    return this.storage.set(this.tokenStorageKey, token);
  }

  private persistRefreshToken(refreshToken: string) {
    this.refreshToken = refreshToken;
    this.scheduleAccessTokenRefresh(this.accessToken);
    return this.storage.set(this.refreshTokenStorageKey, refreshToken);
  }

  private clearLastApiError(): void {
    this.lastApiError.set(null);
  }

  private registerApiError(endpoint: string, error: HttpErrorResponse): void {
    const apiError: AuthApiError = {
      endpoint,
      status: error.status,
      message: error.message,
      details: error.error,
    };

    this.lastApiError.set(apiError);

    console.error('Request failed', {
      endpoint: apiError.endpoint,
      status: apiError.status,
      message: apiError.message,
      details: apiError.details,
    });
  }

  getLastApiError(): AuthApiError | null {
    return this.lastApiError();
  }

  loginWithBackend(email: string, password: string): Observable<UserRole | null> {
    if (!environment.apiUrl) {
      const user = this.login(email, password);
      return of(user?.role || null);
    }

    // Clear any stale local session before requesting a fresh token pair.
    this.logout();

    const loginUrl = '/api/auth/login';

    return this.backendApi.post<LoginResponse>(loginUrl, { email, password }).pipe(
      map((response) => {
        const token = this.extractToken(response);
        const refreshToken = this.extractRefreshToken(response);

        if (!token) {
          return null;
        }

        void this.persistAccessToken(token);
        if (refreshToken) {
          void this.persistRefreshToken(refreshToken);
        } else {
          this.refreshToken = null;
          void this.storage.remove(this.refreshTokenStorageKey);
        }

        const role = this.getRoleFromJwt(token);

        if (!role) {
          return null;
        }

        this.setSessionFromRole(role, email);
        return role;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Login request failed', {
          status: error.status,
          message: error.message,
          details: error.error,
        });
        return of(null);
      })
    );
  }

  refreshAccessToken(): Observable<string | null> {
    if (!environment.apiUrl) {
      return of(null);
    }

    if (this.refreshRequest$) {
      return this.refreshRequest$;
    }

    const refreshUrl = '/api/auth/refresh';

    const request$ = from(this.storage.get(this.refreshTokenStorageKey)).pipe(
      switchMap((storedRefreshToken: string | null) => {
        const refreshToken = storedRefreshToken || this.refreshToken;
        if (!refreshToken) {
          this.clearRefreshTimer();
          return of(null);
        }

        return this.backendApi.post<RefreshResponse>(refreshUrl, { refreshToken }).pipe(
          map((response) => {
            const token = response.token || response.accessToken || response.jwt || null;
            if (token) {
              void this.persistAccessToken(token);
            }
            return token;
          }),
          catchError((error: HttpErrorResponse) => {
            console.error('Refresh token request failed', {
              status: error.status,
              message: error.message,
              details: error.error,
            });
            return of(null);
          })
        );
      }),
      finalize(() => {
        this.refreshRequest$ = null;
      }),
      shareReplay(1)
    );

    this.refreshRequest$ = request$;
    return request$;
  }

  logoutWithBackend(): Observable<boolean> {
    if (!environment.apiUrl) {
      this.logout();
      return of(true);
    }

    const logoutUrl = '/api/auth/logout';

    return from(this.storage.get(this.refreshTokenStorageKey)).pipe(
      switchMap((storedRefreshToken: string | null) => {
        const refreshToken = storedRefreshToken || this.refreshToken;

        if (!refreshToken) {
          this.logout();
          return of(true);
        }

        return from(this.storage.get(this.tokenStorageKey)).pipe(
          switchMap((storedAccessToken: string | null) => {
            const accessToken = storedAccessToken || this.accessToken;

            if (!accessToken) {
              this.logout();
              return of(true);
            }

            return this.backendApi
              .post(
                logoutUrl,
                { refreshToken },
                { headers: { Authorization: `Bearer ${accessToken}` } }
              )
              .pipe(
                map(() => {
                  this.logout();
                  return true;
                }),
                catchError((error: HttpErrorResponse) => {
                  this.logout();
                  if (error.status === 400 || error.status === 401 || error.status === 404) {
                    return of(true);
                  }
                  return of(false);
                })
              );
          })
        );
      }),
      catchError(() => {
        this.logout();
        return of(false);
      })
    );
  }

  registerStudent(payload: StudentRegisterRequest): Observable<boolean> {
    if (!environment.apiUrl) {
      return of(false);
    }

    const registerUrl = '/api/student/create';
    this.clearLastApiError();

    return this.backendApi.post(registerUrl, payload).pipe(
      map(() => {
        this.clearLastApiError();
        return true;
      }),
      catchError((error: HttpErrorResponse) => {
        this.registerApiError(registerUrl, error);
        return of(false);
      })
    );
  }

  registerCreator(payload: CreatorRegisterRequest): Observable<boolean> {
    if (!environment.apiUrl) {
      return of(false);
    }

    const registerUrl = '/api/creator/create';
    this.clearLastApiError();

    return this.backendApi.post(registerUrl, payload).pipe(
      map(() => {
        this.clearLastApiError();
        return true;
      }),
      catchError((error: HttpErrorResponse) => {
        this.registerApiError(registerUrl, error);
        return of(false);
      })
    );
  }

  login(email: string, password: string): User | null {
    const user = this.users.find(
      u => u.email === email && u.password === password
    );

    if (user) {
      this.currentUser.set(user);
      return user;
    }

    return null;
  }

  getUser() {
    return this.currentUser();
  }

  getRole(): UserRole | null {
    const role = this.currentUser()?.role;
    if (role) {
      return role;
    }

    const storedToken = this.accessToken;
    return storedToken ? this.getRoleFromJwt(storedToken) : null;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  logout() {
    this.currentUser.set(null);
    this.accessToken = null;
    this.refreshToken = null;
    this.refreshRequest$ = null;
    this.clearRefreshTimer();
    void this.storage.remove(this.tokenStorageKey);
    void this.storage.remove(this.refreshTokenStorageKey);
    void this.storage.remove(this.userStorageKey);
  }

  private scheduleAccessTokenRefresh(token: string | null): void {
    this.clearRefreshTimer();

    if (!environment.apiUrl || !token || !this.refreshToken) {
      return;
    }

    const expiresAt = this.getAccessTokenExpirationMs(token);
    let delayMs = this.refreshFallbackMs;

    if (expiresAt) {
      const candidateDelay = expiresAt - Date.now() - this.refreshAheadMs;
      delayMs = Math.max(10_000, candidateDelay);
    }

    if (typeof window === 'undefined') {
      return;
    }

    this.refreshTimerId = window.setTimeout(() => {
      this.runScheduledRefresh();
    }, delayMs);
  }

  private runScheduledRefresh(): void {
    this.refreshAccessToken().pipe(take(1)).subscribe((token) => {
      if (token) {
        this.scheduleAccessTokenRefresh(token);
        return;
      }

      this.scheduleRefreshRetry();
    });
  }

  private scheduleRefreshRetry(): void {
    this.clearRefreshTimer();

    if (!environment.apiUrl || !this.refreshToken || typeof window === 'undefined') {
      return;
    }

    this.refreshTimerId = window.setTimeout(() => {
      this.runScheduledRefresh();
    }, this.refreshRetryMs);
  }

  private clearRefreshTimer(): void {
    if (this.refreshTimerId === null || typeof window === 'undefined') {
      return;
    }

    window.clearTimeout(this.refreshTimerId);
    this.refreshTimerId = null;
  }

  private getAccessTokenExpirationMs(token: string): number | null {
    const payload = this.getJwtPayload(token);
    if (!payload) {
      return null;
    }

    const exp = payload['exp'];
    if (typeof exp !== 'number') {
      return null;
    }

    return exp * 1000;
  }
}
