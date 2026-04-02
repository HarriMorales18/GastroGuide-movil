import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  CreatePaymentTransactionRequest,
  CreatePaymentTransactionResponse,
  LocalPurchaseState,
  PaymentTransactionRecord,
  PaymentTransactionStatus,
  PurchaseConfirmationRequest,
  PurchaseConfirmationResponse,
  PurchaseIntentRequest,
  PurchaseIntentResponse
} from '@student-models/course-purchase.model';
import { StudentCourseDetail } from '@student-models/course-detail.model';
import { BackendApiService } from '@core/services/backend-api.service';

@Injectable()
export class CoursePurchaseService {
  private readonly storageKey = 'studentPurchasedCourseKeys';
  private readonly transactionStorageKey = 'studentPaymentTransactions';

  // API endpoints preparados para integrar backend real de pagos propio.
  private readonly purchaseIntentApiUrl = '/api/student/courses/purchase-intents';
  private readonly purchaseConfirmationApiUrl = '/api/student/courses/purchases/confirm';
  private readonly paymentTransactionsApiUrl = '/api/student/payments/transactions';

  private readonly purchasedCourseKeys = signal<string[]>(this.loadPurchasedCourseKeys());
  readonly transactionHistory = signal<PaymentTransactionRecord[]>(this.loadTransactionHistory());

  constructor(private readonly backendApi: BackendApiService) {}

  isCoursePurchased(course: Pick<StudentCourseDetail, 'id' | 'title'>): boolean {
    const key = this.buildCourseKey(course.id, course.title);
    return this.purchasedCourseKeys().includes(key);
  }

  markCourseAsPurchased(course: Pick<StudentCourseDetail, 'id' | 'title'>): void {
    const key = this.buildCourseKey(course.id, course.title);

    this.purchasedCourseKeys.update((keys) => {
      if (keys.includes(key)) {
        return keys;
      }

      const updated = [...keys, key];
      this.persistPurchasedCourseKeys(updated);
      return updated;
    });
  }

  simulateSuccessfulPurchase(course: Pick<StudentCourseDetail, 'id' | 'title'>): LocalPurchaseState {
    this.markCourseAsPurchased(course);

    return {
      courseId: course.id,
      purchased: true,
      purchasedAt: new Date().toISOString(),
      transactionReference: `SIM-${course.id}-${Date.now()}`
    };
  }

  registerTransactionAttempt(params: {
    course: Pick<StudentCourseDetail, 'id' | 'title' | 'priceCop'>;
    status: PaymentTransactionStatus;
    message?: string;
  }): PaymentTransactionRecord {
    const record: PaymentTransactionRecord = {
      id: `TX-${params.course.id}-${Date.now()}`,
      courseId: params.course.id,
      courseTitle: params.course.title,
      amountCop: params.course.priceCop,
      status: params.status,
      gateway: 'simulated',
      message: params.message,
      createdAt: new Date().toISOString(),
      backendSynced: false
    };

    this.transactionHistory.update((items) => {
      const updated = [record, ...items];
      this.persistTransactionHistory(updated);
      return updated;
    });

    this.syncTransactionWithBackend(record).subscribe();
    return record;
  }

  fetchTransactionsFromBackend(): Observable<PaymentTransactionRecord[]> {
    return this.backendApi.get<PaymentTransactionRecord[]>(this.paymentTransactionsApiUrl).pipe(
      catchError(() => of([]))
    );
  }

  hydrateTransactionHistoryFromBackend(): void {
    this.fetchTransactionsFromBackend().subscribe((backendItems) => {
      if (!backendItems.length) {
        return;
      }

      this.transactionHistory.update((localItems) => {
        const byId = new Map<string, PaymentTransactionRecord>();

        for (const item of backendItems) {
          byId.set(item.id, { ...item, backendSynced: true });
        }

        for (const item of localItems) {
          if (!byId.has(item.id)) {
            byId.set(item.id, item);
          }
        }

        const merged = Array.from(byId.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        this.persistTransactionHistory(merged);
        return merged;
      });
    });
  }

  createPurchaseIntent(payload: PurchaseIntentRequest): Observable<PurchaseIntentResponse> {
    return this.backendApi.post<PurchaseIntentResponse>(this.purchaseIntentApiUrl, payload);
  }

  confirmPurchase(payload: PurchaseConfirmationRequest): Observable<PurchaseConfirmationResponse> {
    return this.backendApi.post<PurchaseConfirmationResponse>(this.purchaseConfirmationApiUrl, payload);
  }

  private syncTransactionWithBackend(record: PaymentTransactionRecord): Observable<CreatePaymentTransactionResponse | null> {
    const payload: CreatePaymentTransactionRequest = {
      id: record.id,
      courseId: record.courseId,
      courseTitle: record.courseTitle,
      amountCop: record.amountCop,
      status: record.status,
      gateway: record.gateway,
      message: record.message,
      createdAt: record.createdAt
    };

    return this.backendApi.post<CreatePaymentTransactionResponse>(this.paymentTransactionsApiUrl, payload).pipe(
      catchError(() => of(null))
    );
  }

  private loadPurchasedCourseKeys(): string[] {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw) as string[];
      return Array.isArray(parsed) ? parsed.filter((value) => typeof value === 'string' && value.trim().length > 0) : [];
    } catch {
      return [];
    }
  }

  private persistPurchasedCourseKeys(keys: string[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(keys));
  }

  private loadTransactionHistory(): PaymentTransactionRecord[] {
    const raw = localStorage.getItem(this.transactionStorageKey);
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw) as PaymentTransactionRecord[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private persistTransactionHistory(records: PaymentTransactionRecord[]): void {
    localStorage.setItem(this.transactionStorageKey, JSON.stringify(records));
  }

  private buildCourseKey(courseId: number, title: string): string {
    return `${courseId}|${title.trim().toLowerCase()}`;
  }
}
