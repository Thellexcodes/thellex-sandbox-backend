export enum YCPaymentEventEnum {
  COLLECTION_CREATED = 'collection.created',
  COLLECTION_PENDING_APPROVAL = 'collection.pending_approval',
  COLLECTION_PROCESSING = 'collection.processing',
  COLLECTION_PENDING = 'collection.pending',
  COLLECTION_COMPLETE = 'collection.complete',
  COLLECTION_FAILED = 'collection.failed',

  // Payment events
  PAYMENT_CREATED = 'payment.created',
  PAYMENT_PENDING_APPROVAL = 'payment.pending_approval',
  PAYMENT_PROCESSING = 'payment.processing',
  PAYMENT_FAILED = 'payment.failed',
  PAYMENT_EXPIRED = 'payment.expired',
  PAYMENT_COMPLETE = 'payment.complete',
}

export enum PaymentStatus {
  None = 'none',
  Created = 'created',
  Complete = 'complete',
  Confirmed = 'confirmed',
  Accepted = 'accepted',
  Done = 'done',
  Processing = 'processing',
  PendingApproval = 'pending_approval',
  PendingRiskScreening = 'pending_risk_screening',
  Queued = 'queued',
  Sent = 'sent',
}

export enum TransactionDirectionEnum {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
}

export enum TransactionTypeEnum {
  CRYPTO_DEPOSIT = 'crypto_deposit',
  CRYPTO_WITHDRAWAL = 'crypto_withdrawal',

  FIAT_TO_CRYPTO_DEPOSIT = 'fiat_to_crypto_deposit',
  FIAT_TO_CRYPTO_WITHDRAWAL = 'fiat_to_crypto_withdrawal',

  CRYPTO_TO_FIAT_DEPOSIT = 'crypto_to_fiat_deposit',
  CRYPTO_TO_FIAT_WITHDRAWAL = 'crypto_to_fiat_withdrawal',

  FIAT_TO_FIAT_DEPOSIT = 'fiat_to_fiat_deposit',
  FIAT_TO_FIAT_WITHDRAWAL = 'fiat_to_fiat_withdrawal',
}

export enum PaymentReasonEnum {
  GIFT = 'gift',
  BILLS = 'bills',
  GROCERIES = 'groceries',
  TRAVEL = 'travel',
  HEALTH = 'health',
  ENTERTAINMENT = 'entertainment',
  HOUSING = 'housing',
  SCHOOL_FEES = 'school-fees',
  OTHER = 'other',
}
