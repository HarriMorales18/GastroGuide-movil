import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiError, ApiResult } from '@core/models/api.model';
import { environment } from 'src/environments/environment';

type Primitive = string | number | boolean;

export interface BackendRequestOptions {
  headers?: HttpHeaders | Record<string, string | string[]>;
  params?: HttpParams | Record<string, Primitive | ReadonlyArray<Primitive>>;
  withCredentials?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class BackendApiService {
  constructor(private readonly http: HttpClient) {}

  get<T>(path: string, options?: BackendRequestOptions): Observable<T> {
    return this.http.get<T>(this.resolveUrl(path), options);
  }

  post<T>(path: string, body: unknown, options?: BackendRequestOptions): Observable<T> {
    return this.http.post<T>(this.resolveUrl(path), body, options);
  }

  put<T>(path: string, body: unknown, options?: BackendRequestOptions): Observable<T> {
    return this.http.put<T>(this.resolveUrl(path), body, options);
  }

  patch<T>(path: string, body: unknown, options?: BackendRequestOptions): Observable<T> {
    return this.http.patch<T>(this.resolveUrl(path), body, options);
  }

  delete<T>(path: string, options?: BackendRequestOptions): Observable<T> {
    return this.http.delete<T>(this.resolveUrl(path), options);
  }

  getSafe<T>(path: string, options?: BackendRequestOptions): Observable<ApiResult<T>> {
    return this.get<T>(path, options).pipe(
      map((data) => ({ ok: true, data, error: null })),
      catchError((error) => of(this.toFailedResult<T>(error, path)))
    );
  }

  postSafe<T>(path: string, body: unknown, options?: BackendRequestOptions): Observable<ApiResult<T>> {
    return this.post<T>(path, body, options).pipe(
      map((data) => ({ ok: true, data, error: null })),
      catchError((error) => of(this.toFailedResult<T>(error, path)))
    );
  }

  putSafe<T>(path: string, body: unknown, options?: BackendRequestOptions): Observable<ApiResult<T>> {
    return this.put<T>(path, body, options).pipe(
      map((data) => ({ ok: true, data, error: null })),
      catchError((error) => of(this.toFailedResult<T>(error, path)))
    );
  }

  private resolveUrl(path: string): string {
    const isAbsolute = /^https?:\/\//i.test(path);
    if (isAbsolute) {
      return path;
    }

    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const baseUrl = (environment.apiUrl ?? '').trim();

    if (!baseUrl) {
      return normalizedPath;
    }

    return `${baseUrl.replace(/\/$/, '')}${normalizedPath}`;
  }

  private toFailedResult<T>(error: unknown, path: string): ApiResult<T> {
    return {
      ok: false,
      data: null,
      error: this.toApiError(error, path)
    };
  }

  private toApiError(error: unknown, path: string): ApiError {
    if (error instanceof HttpErrorResponse) {
      return {
        status: error.status,
        message: error.message || 'Error de comunicacion con backend.',
        path,
        details: error.error
      };
    }

    return {
      status: 0,
      message: 'Error inesperado al procesar la solicitud.',
      path,
      details: error
    };
  }
}
