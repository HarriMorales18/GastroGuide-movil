import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import {
  checkmarkOutline,
  contrastOutline,
  languageOutline,
  notificationsOutline,
  shieldOutline
} from 'ionicons/icons';
import { Preference } from '@student-config-models/preferences.interface';

@Component({
  selector: 'app-preferences-config-view',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './preferences-config-view.component.html',
  styleUrl: './preferences-config-view.component.scss'
})
export class PreferencesConfigViewComponent {
  selectedLanguage = signal('es');
  selectedTheme = signal('light');

  notifications = signal<Preference[]>([
    {
      id: 'course-updates',
      label: 'Actualizaciones de Cursos',
      enabled: true,
      description: 'Recibe notificaciones cuando hay nuevas lecciones'
    },
    {
      id: 'messages',
      label: 'Mensajes',
      enabled: true,
      description: 'Notificaciones cuando recibas mensajes'
    },
    {
      id: 'achievements',
      label: 'Logros',
      enabled: true,
      description: 'Celebra tus logros y progreso'
    },
    {
      id: 'promotions',
      label: 'Promociones',
      enabled: false,
      description: 'Ofertas especiales y descuentos'
    }
  ]);

  readonly languages = [
    { code: 'es', name: 'Español' },
    { code: 'en', name: 'English' },
    { code: 'pt', name: 'Português' }
  ];

  readonly themes = [
    { code: 'light', name: 'Claro' },
    { code: 'dark', name: 'Oscuro' },
    { code: 'auto', name: 'Automático' }
  ];

  constructor() {
    addIcons({
      checkmarkOutline,
      contrastOutline,
      languageOutline,
      notificationsOutline,
      shieldOutline
    });
  }

  selectLanguage(code: string): void {
    this.selectedLanguage.set(code);
  }

  selectTheme(code: string): void {
    this.selectedTheme.set(code);
  }

  toggleNotification(id: string): void {
    const updated = this.notifications().map((notif) =>
      notif.id === id ? { ...notif, enabled: !notif.enabled } : notif
    );
    this.notifications.set(updated);
  }
}
