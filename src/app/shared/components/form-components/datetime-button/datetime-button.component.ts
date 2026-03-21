import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IonDatetime, IonDatetimeButton, IonModal } from '@ionic/angular/standalone';

@Component({
  selector: 'app-datetime-button',
  standalone: true,
  imports: [CommonModule, IonDatetimeButton, IonModal, IonDatetime],
  templateUrl: './datetime-button.component.html',
  styleUrls: ['./datetime-button.component.scss'],
})
export class DatetimeButtonComponent {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) nombre!: string;
  @Output() fechaChange = new EventEmitter<string | string[] | null>();

  get datetimeId(): string {
    return `${this.nombre}-datetime`;
  }

  onDatetimeChange(event: CustomEvent<{ value?: string | string[] | null }>): void {
    this.fechaChange.emit(event.detail.value ?? null);
  }
}
