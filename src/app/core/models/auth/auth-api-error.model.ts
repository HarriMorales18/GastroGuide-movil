export interface AuthApiError {
  endpoint: string;
  status: number;
  message: string;
  details: unknown;
}
