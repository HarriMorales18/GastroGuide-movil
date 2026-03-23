import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-form-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
})
export class InputComponent {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) tipo!: string;
  @Input({ required: true }) nombre!: string;
  @Input() placeholder = '';
  @Output() valorChange = new EventEmitter<string>();

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement | null)?.value ?? '';
    this.valorChange.emit(value);
  }
}
