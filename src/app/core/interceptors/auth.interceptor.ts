import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '@core/services/auth.service';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (isAuthRequest(req.url)) {
    return next(req);
  }

  const accessToken = authService.getAccessToken();
  const authReq = accessToken ? addToken(req, accessToken) : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401) {
        return throwError(() => error);
      }

      if (isRefreshing) {
        return refreshTokenSubject.pipe(
          filter((token): token is string => token !== null),
          take(1),
          switchMap((token) => next(addToken(req, token)))
        );
      }

      isRefreshing = true;
      refreshTokenSubject.next(null);

      return authService.refreshAccessToken().pipe(
        switchMap((newToken) => {
          isRefreshing = false;

          if (!newToken) {
            authService.logout();
            void router.navigateByUrl('/');
            return throwError(() => error);
          }

          refreshTokenSubject.next(newToken);
          return next(addToken(req, newToken));
        }),
        catchError((refreshError) => {
          isRefreshing = false;
          authService.logout();
          void router.navigateByUrl('/');
          return throwError(() => refreshError);
        })
      );
    })
  );
};

function addToken(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}

function isAuthRequest(url: string): boolean {
  return /\/api\/auth\/(login|refresh|logout)$/i.test(url);
}
