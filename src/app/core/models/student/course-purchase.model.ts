export interface PurchaseIntentRequest {
  courseId: number;
  amountCop: number;
  currency: 'COP';
}

export interface PurchaseIntentResponse {
  transactionReference: string;
  checkoutUrl: string;
  publicKey: string;
  testMode: boolean;
}

export interface PurchaseConfirmationRequest {
  courseId: number;
  transactionReference: string;
  providerTransactionId: string;
}

export interface PurchaseConfirmationResponse {
  success: boolean;
  purchasedAt: string;
}

export interface LocalPurchaseState {
  courseId: number;
  purchased: boolean;
  purchasedAt?: string;
  transactionReference?: string;
}

export type PaymentTransactionStatus = 'approved' | 'rejected' | 'canceled';

export interface PaymentTransactionRecord {
  id: string;
  courseId: number;
  courseTitle: string;
  amountCop: number;
  status: PaymentTransactionStatus;
  gateway: 'simulated';
  message?: string;
  createdAt: string;
  backendSynced: boolean;
}

export interface CreatePaymentTransactionRequest {
  id: string;
  courseId: number;
  courseTitle: string;
  amountCop: number;
  status: PaymentTransactionStatus;
  gateway: 'simulated';
  message?: string;
  createdAt: string;
}

export interface CreatePaymentTransactionResponse {
  id: string;
  syncedAt: string;
}
