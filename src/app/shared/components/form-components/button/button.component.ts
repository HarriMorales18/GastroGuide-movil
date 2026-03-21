import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-form-button',
  standalone: true,
  imports: [CommonModule, IonIcon],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
})
export class ButtonComponent {
  @Input({ required: true }) contenido!: string;
  @Input({ required: true }) nombre!: string;
  @Input() icono?: string;
  @Input() color?: string;
  @Output() presionado = new EventEmitter<MouseEvent>();

  onClick(event: MouseEvent): void {
    this.presionado.emit(event);
  }
}
