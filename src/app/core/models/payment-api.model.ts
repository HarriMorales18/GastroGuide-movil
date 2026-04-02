export interface PaymentIntentRequest {
  courseId: number;
  amountCop: number;
}

export interface PaymentIntentResponse {
  intentId: string;
  amountCop: number;
  status: 'pending' | 'approved' | 'rejected';
}

export interface ConfirmPaymentRequest {
  intentId: string;
  transactionReference: string;
}

export interface ConfirmPaymentResponse {
  success: boolean;
  transactionId: string;
}

export interface PaymentTransactionResponse {
  id: string;
  courseId: number;
  amountCop: number;
  status: 'approved' | 'rejected' | 'canceled' | 'pending';
  createdAt: string;
}
