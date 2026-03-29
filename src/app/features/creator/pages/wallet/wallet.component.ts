import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface WalletTransaction {
  label: string;
  detail: string;
  amount: number;
  type: 'income' | 'expense';
}

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class WalletComponent {
  readonly availableBalance = 1835;
  readonly pendingBalance = 320;
  readonly totalWithdrawn = 2620;

  readonly transactions: WalletTransaction[] = [
    {
      label: 'Venta de curso - Cocina Mediterranea',
      detail: 'Acreditado el 26 Mar 2026',
      amount: 89,
      type: 'income',
    },
    {
      label: 'Venta de curso - Panaderia Inicial',
      detail: 'Acreditado el 25 Mar 2026',
      amount: 64,
      type: 'income',
    },
    {
      label: 'Retiro a cuenta bancaria',
      detail: 'Procesado el 22 Mar 2026',
      amount: -180,
      type: 'expense',
    },
  ];

  constructor(private readonly router: Router) {}

  backToCreator(): void {
    this.router.navigate(['/creator']);
  }

}
