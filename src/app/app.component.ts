import { Component, computed } from '@angular/core';
import { IonApp, IonRouterOutlet, IonToast } from '@ionic/angular/standalone';
import { AppAlertService } from '@core/services/app-alert.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet, IonToast],
})
export class AppComponent {
  readonly currentAlert = this.appAlert.currentAlert;

  readonly toastColor = computed(() => {
    const type = this.currentAlert()?.type;

    if (type === 'success') {
      return 'success';
    }

    if (type === 'error') {
      return 'danger';
    }

    if (type === 'warning') {
      return 'warning';
    }

    return 'primary';
  });

  readonly toastClass = computed(() => {
    const type = this.currentAlert()?.type ?? 'info';
    return `app-toast app-toast-${type}`;
  });

  constructor(private readonly appAlert: AppAlertService) {}

  onToastDismiss(): void {
    this.appAlert.dismissCurrent();
  }
}
