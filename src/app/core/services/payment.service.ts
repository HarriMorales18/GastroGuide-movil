import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BackendApiService } from '@core/services/backend-api.service';
import {
  ConfirmPaymentRequest,
  ConfirmPaymentResponse,
  PaymentIntentRequest,
  PaymentIntentResponse,
  PaymentTransactionResponse
} from '@core/models/payment-api.model';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private readonly baseApiUrl = '/api/payments';

  constructor(private readonly backendApi: BackendApiService) {}

  createPaymentIntentFromApi(payload: PaymentIntentRequest): Observable<PaymentIntentResponse> {
    return this.backendApi.post<PaymentIntentResponse>(`${this.baseApiUrl}/intents`, payload);
  }

  confirmPaymentFromApi(payload: ConfirmPaymentRequest): Observable<ConfirmPaymentResponse> {
    return this.backendApi.post<ConfirmPaymentResponse>(`${this.baseApiUrl}/confirm`, payload);
  }

  getTransactionsFromApi(): Observable<PaymentTransactionResponse[]> {
    return this.backendApi.get<PaymentTransactionResponse[]>(`${this.baseApiUrl}/transactions`);
  }

}
