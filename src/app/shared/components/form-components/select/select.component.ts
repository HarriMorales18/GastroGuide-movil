import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-form-select',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
})
export class SelectComponent {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) nombre!: string;
  @Input() options: SelectOption[] = [];
  @Input() opcionDefault?: string;
  @Output() seleccionChange = new EventEmitter<string>();

  onChange(event: Event): void {
    const value = (event.target as HTMLSelectElement | null)?.value ?? '';
    this.seleccionChange.emit(value);
  }
}
