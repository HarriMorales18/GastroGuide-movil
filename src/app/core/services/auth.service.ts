import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { catchError, from, map, Observable, of, switchMap } from 'rxjs';
import { User, UserRole } from '@core/models/user.model';
import { LoginResponse } from '@core/models/auth/login-response.model';
import { RefreshResponse } from '@core/models/auth/refresh-response.model';
import { StudentRegisterRequest } from '@core/models/auth/student-register-request.model';
import { CreatorRegisterRequest } from '@core/models/auth/creator-register-request.model';
import { PasswordRecoveryRequest } from '@core/models/auth/password-recovery-request.model';
import { BackendApiService } from '@core/services/backend-api.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private currentUser = signal<User | null>(null);
  private readonly tokenStorageKey = 'auth_token';
  private readonly refreshTokenStorageKey = 'refresh_token';
  private readonly userStorageKey = 'auth_user';

  private accessToken: string | null = null;
  private refreshToken: string | null = null;

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
    return this.storage.set(this.tokenStorageKey, token);
  }

  private persistRefreshToken(refreshToken: string) {
    this.refreshToken = refreshToken;
    return this.storage.set(this.refreshTokenStorageKey, refreshToken);
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

    const refreshUrl = '/api/auth/refresh';

    return from(this.storage.get(this.refreshTokenStorageKey)).pipe(
      switchMap((storedRefreshToken: string | null) => {
        const refreshToken = storedRefreshToken || this.refreshToken;
        if (!refreshToken) {
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
          catchError(() => of(null))
        );
      })
    );
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
    return this.backendApi.post(registerUrl, payload).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  registerCreator(payload: CreatorRegisterRequest): Observable<boolean> {
    if (!environment.apiUrl) {
      return of(false);
    }

    const registerUrl = '/api/creator/create';
    return this.backendApi.post(registerUrl, payload).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  recoverPassword(payload: PasswordRecoveryRequest): Observable<boolean> {
    if (!environment.apiUrl) {
      return of(false);
    }

    const recoveryUrl = '/password-recovery/';
    return this.backendApi.post(recoveryUrl, payload).pipe(
      map(() => true),
      catchError(() => of(false))
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
    void this.storage.remove(this.tokenStorageKey);
    void this.storage.remove(this.refreshTokenStorageKey);
    void this.storage.remove(this.userStorageKey);
  }
}
