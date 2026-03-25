import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  lockClosedOutline,
  notificationsOutline,
  walletOutline,
  logOutOutline
} from 'ionicons/icons';

import { AccountConfigViewComponent } from './views/account-config-view.component';
import { PreferencesConfigViewComponent } from './views/preferences-config-view.component';
import { PaymentConfigViewComponent } from './views/payment-config-view.component';
import { AuthService } from 'src/app/core/services/auth.service';

type ConfigTab = 'account' | 'preferences' | 'payment';

interface ConfigOption {
  id: ConfigTab;
  label: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-creator-config',
  standalone: true,
  imports: [
    CommonModule,
    AccountConfigViewComponent,
    PreferencesConfigViewComponent,
    PaymentConfigViewComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './config.component.html',
  styleUrl: './config.component.scss'
})
export class ConfigComponent {
  activeTab = signal<ConfigTab | null>(null);

  readonly configOptions: ConfigOption[] = [
    {
      id: 'account',
      label: 'Configuración de Cuenta',
      icon: 'lock-closed-outline',
      description: 'Cambiar contraseña y datos personales'
    },
    {
      id: 'preferences',
      label: 'Preferencias',
      icon: 'notifications-outline',
      description: 'Notificaciones y tema'
    },
    {
      id: 'payment',
      label: 'Pagos e Impuestos',
      icon: 'wallet-outline',
      description: 'Métodos de pago e información fiscal'
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    addIcons({
      arrowBackOutline,
      lockClosedOutline,
      notificationsOutline,
      walletOutline,
      logOutOutline
    });
  }

  setActiveTab(tab: ConfigTab): void {
    this.activeTab.set(tab);
  }

  backToSections(): void {
    this.activeTab.set(null);
  }

  logout(): void {
    this.authService.logoutWithBackend().subscribe(() => {
      this.router.navigate(['/']);
    });
  }
}
