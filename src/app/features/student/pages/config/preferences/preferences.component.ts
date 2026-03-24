import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { addIcons } from 'ionicons';
import { checkmarkOutline } from 'ionicons/icons';
import { Preference } from '../models/preferences.interface';

@Component({
  selector: 'app-preferences',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './preferences.component.html',
  styleUrl: './preferences.component.scss'
})
export class PreferencesComponent {
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

  languages = [
    { code: 'es', name: 'Español' },
    { code: 'en', name: 'English' },
    { code: 'pt', name: 'Português' }
  ];

  themes = [
    { code: 'light', name: 'Claro' },
    { code: 'dark', name: 'Oscuro' },
    { code: 'auto', name: 'Automático' }
  ];

  constructor() {
    addIcons({ checkmarkOutline });
  }

  selectLanguage(code: string): void {
    this.selectedLanguage.set(code);
    // TODO: Implementar cambio de idioma
  }

  selectTheme(code: string): void {
    this.selectedTheme.set(code);
    // TODO: Implementar cambio de tema
  }

  toggleNotification(id: string): void {
    const updated = this.notifications().map(notif =>
      notif.id === id ? { ...notif, enabled: !notif.enabled } : notif
    );
    this.notifications.set(updated);
    // TODO: Guardar en backend
  }
}
