import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { addCircleOutline, closeCircleOutline, checkmarkCircleOutline } from 'ionicons/icons';

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank';
  label: string;
  value: string;
  isDefault: boolean;
}

@Component({
  selector: 'app-payment-config-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './payment-config-view.component.html',
  styleUrl: './payment-config-view.component.scss'
})
export class PaymentConfigViewComponent {
  readonly paymentMethods = signal<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      label: 'Visa terminada en',
      value: '4242',
      isDefault: true
    },
    {
      id: '2',
      type: 'bank',
      label: 'Cuenta bancaria',
      value: 'XXXX-XX34',
      isDefault: false
    }
  ]);

  readonly taxInfo = signal({
    businessName: 'Juan García Culinary',
    taxId: '12.345.678-9',
    country: 'Argentina',
    vatRegistered: true
  });

  readonly showAddPayment = signal(false);
  readonly earnings = signal({
    thisMonth: 1250.5,
    total: 5840.25,
    pendingTransfer: 450.0,
    lastTransfer: '2024-03-15'
  });

  constructor() {
    addIcons({
      addCircleOutline,
      closeCircleOutline,
      checkmarkCircleOutline
    });
  }

  toggleAddPayment(): void {
    this.showAddPayment.set(!this.showAddPayment());
  }

  setDefaultPayment(id: string): void {
    this.paymentMethods.update((methods) =>
      methods.map((m) => ({
        ...m,
        isDefault: m.id === id
      }))
    );
  }

  removePayment(id: string): void {
    this.paymentMethods.update((methods) => methods.filter((m) => m.id !== id));
  }
}
