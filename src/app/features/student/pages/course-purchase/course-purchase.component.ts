import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CourseDetailStateService } from '@core/services/student/course-detail-state.service';
import { CourseAccessService } from '@core/services/student/course-access.service';
import { CoursePurchaseService } from '@core/services/student/course-purchase.service';

@Component({
  selector: 'app-course-purchase',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './course-purchase.component.html',
  styleUrl: './course-purchase.component.scss'
})
export class CoursePurchaseComponent {
  readonly selectedCourse = this.courseDetailState.selectedCourse;
  readonly paymentStep = signal<'summary' | 'gateway' | 'processing'>('summary');
  readonly formErrors = signal<{
    cardHolder: string | null;
    cardNumber: string | null;
    cardExpiry: string | null;
    cardCvc: string | null;
  }>({
    cardHolder: null,
    cardNumber: null,
    cardExpiry: null,
    cardCvc: null
  });

  cardHolder = '';
  cardNumber = '';
  cardExpiry = '';
  cardCvc = '';

  constructor(
    private readonly courseDetailState: CourseDetailStateService,
    private readonly courseAccess: CourseAccessService,
    private readonly coursePurchaseService: CoursePurchaseService
  ) {}

  goBackToDetail(): void {
    this.courseAccess.requestCourseDetailAndOpen();
  }

  simulateSuccessfulPayment(): void {
    const course = this.selectedCourse();
    if (!course) {
      return;
    }

    this.coursePurchaseService.simulateSuccessfulPurchase(course);
    this.courseDetailState.setSelectedCourse({
      ...course,
      isPurchased: true
    });
    this.courseAccess.grantAccessAndOpen();
  }

  simulateFailedPayment(): void {
    this.courseAccess.requestCourseDetailAndOpen();
  }

  openPaymentGateway(): void {
    this.paymentStep.set('gateway');
  }

  cancelGatewayAndBack(): void {
    this.paymentStep.set('summary');
  }

  processApprovedPayment(): void {
    const course = this.selectedCourse();
    if (!course) {
      return;
    }

    if (!this.validatePaymentForm()) {
      return;
    }

    this.coursePurchaseService.registerTransactionAttempt({
      course,
      status: 'approved',
      message: 'Pago aprobado por el usuario.'
    });

    this.paymentStep.set('processing');
    setTimeout(() => {
      this.simulateSuccessfulPayment();
    }, 900);
  }

  processRejectedPayment(): void {
    const course = this.selectedCourse();
    if (!course) {
      return;
    }

    if (!this.validatePaymentForm()) {
      return;
    }

    this.coursePurchaseService.registerTransactionAttempt({
      course,
      status: 'rejected',
      message: 'Pago rechazado en pasarela.'
    });

    this.paymentStep.set('processing');
    setTimeout(() => {
      this.simulateFailedPayment();
    }, 900);
  }

  updateCardNumber(value: string): void {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    this.cardNumber = digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  }

  updateCardExpiry(value: string): void {
    const digits = value.replace(/\D/g, '').slice(0, 4);

    if (digits.length <= 2) {
      this.cardExpiry = digits;
      return;
    }

    this.cardExpiry = `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }

  updateCardCvc(value: string): void {
    this.cardCvc = value.replace(/\D/g, '').slice(0, 4);
  }

  private validatePaymentForm(): boolean {
    const holder = this.cardHolder.trim();
    const cardNumberDigits = this.cardNumber.replace(/\s/g, '');
    const expiry = this.cardExpiry.trim();
    const cvc = this.cardCvc.trim();

    const errors = {
      cardHolder: null as string | null,
      cardNumber: null as string | null,
      cardExpiry: null as string | null,
      cardCvc: null as string | null
    };

    if (holder.length < 4) {
      errors.cardHolder = 'Ingresa el nombre completo del titular.';
    }

    if (!/^\d{16}$/.test(cardNumberDigits)) {
      errors.cardNumber = 'La tarjeta debe tener 16 digitos.';
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
      errors.cardExpiry = 'Usa formato MM/AA valido.';
    } else if (this.isExpired(expiry)) {
      errors.cardExpiry = 'La tarjeta esta vencida.';
    }

    if (!/^\d{3,4}$/.test(cvc)) {
      errors.cardCvc = 'El CVC debe tener 3 o 4 digitos.';
    }

    this.formErrors.set(errors);

    return !errors.cardHolder && !errors.cardNumber && !errors.cardExpiry && !errors.cardCvc;
  }

  private isExpired(expiry: string): boolean {
    const [monthPart, yearPart] = expiry.split('/');
    const month = Number(monthPart);
    const year = 2000 + Number(yearPart);

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    if (year < currentYear) {
      return true;
    }

    return year === currentYear && month < currentMonth;
  }
}
