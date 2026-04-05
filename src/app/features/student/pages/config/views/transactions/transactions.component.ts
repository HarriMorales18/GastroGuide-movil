import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CoursePurchaseService } from '@core/services/student/course-purchase.service';
import { PaymentTransactionStatus } from '@student-models/course-purchase.model';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss'
})
export class TransactionsComponent {
  readonly transactionHistory = this.coursePurchaseService.transactionHistory;

  constructor(private readonly coursePurchaseService: CoursePurchaseService) {
    this.coursePurchaseService.hydrateTransactionHistoryFromBackend();
  }

  getTransactionStatusLabel(status: PaymentTransactionStatus): string {
    if (status === 'approved') {
      return 'Aprobado';
    }

    if (status === 'rejected') {
      return 'Rechazado';
    }

    return 'Cancelado';
  }

  getTransactionStatusClass(status: PaymentTransactionStatus): string {
    return `status-${status}`;
  }
}
