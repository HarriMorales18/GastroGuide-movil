export interface ApiError {
  status: number;
  message: string;
  path?: string;
  details?: unknown;
}

export interface ApiResult<T> {
  ok: boolean;
  data: T | null;
  error: ApiError | null;
}
