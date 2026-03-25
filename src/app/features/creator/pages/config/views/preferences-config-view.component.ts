import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { notificationsOutline, sunnyOutline, moonOutline } from 'ionicons/icons';

type NotifKey = 'courseUpdates' | 'messages' | 'payments' | 'promotions';

@Component({
  selector: 'app-preferences-config-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './preferences-config-view.component.html',
  styleUrl: './preferences-config-view.component.scss'
})
export class PreferencesConfigViewComponent {
  readonly theme = signal<'light' | 'dark'>('light');
  readonly emailNotifications = signal({
    courseUpdates: true,
    messages: true,
    payments: true,
    promotions: false
  });

  constructor() {
    addIcons({
      notificationsOutline,
      sunnyOutline,
      moonOutline
    });
  }

  setTheme(newTheme: 'light' | 'dark'): void {
    this.theme.set(newTheme);
    console.log('Tema actualizado a:', newTheme);
  }

  toggleNotification(key: NotifKey): void {
    this.emailNotifications.update((current) => ({
      ...current,
      [key]: !current[key]
    }));
  }
}
