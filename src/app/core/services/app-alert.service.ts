import { Injectable, signal } from '@angular/core';
import { AppAlert, AppAlertType } from '@core/models/app-alert.model';

@Injectable({
  providedIn: 'root'
})
export class AppAlertService {
  readonly currentAlert = signal<AppAlert | null>(null);

  private queue: AppAlert[] = [];
  private idCounter = 0;

  show(message: string, type: AppAlertType = 'info', duration = 2600): void {
    const safeMessage = message.trim();

    if (!safeMessage) {
      return;
    }

    this.queue.push({
      id: ++this.idCounter,
      type,
      message: safeMessage,
      duration
    });

    this.openNextIfIdle();
  }

  success(message: string, duration?: number): void {
    this.show(message, 'success', duration ?? 2400);
  }

  error(message: string, duration?: number): void {
    this.show(message, 'error', duration ?? 3200);
  }

  warning(message: string, duration?: number): void {
    this.show(message, 'warning', duration ?? 3000);
  }

  info(message: string, duration?: number): void {
    this.show(message, 'info', duration ?? 2600);
  }

  dismissCurrent(): void {
    if (!this.currentAlert()) {
      return;
    }

    this.currentAlert.set(null);
    this.openNextIfIdle();
  }

  private openNextIfIdle(): void {
    if (this.currentAlert()) {
      return;
    }

    const next = this.queue.shift() ?? null;
    this.currentAlert.set(next);
  }
}
