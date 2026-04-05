export type AppAlertType = 'success' | 'error' | 'warning' | 'info';

export interface AppAlert {
  id: number;
  type: AppAlertType;
  message: string;
  duration: number;
}
