import { TransactionType } from '@circle-fin/developer-controlled-wallets';

export enum PaymentStatus {
  None = 'None',
  Complete = 'COMPLETE',
  Confirmed = 'confirmed',
  Accepted = 'accepted',
  Done = 'Done',
  Processing = 'Processing',

  Outbound = 'OUTBOUND',
  Inbound = 'INBOUND',
  PendingRiskScreening = 'PENDING_RISK_SCREENING',
  Queued = 'QUEUED',
  Sent = 'SENT',
}

export enum TransactionDirectionEnum {
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND',
}

export enum TransactionTypeEnum {
  CRYPTO_DEPOSIT = 'CRYPTO_DEPOSIT',
  CRYPTO_WITHDRAWAL = 'CRYPTO_WITHDRAWAL',
  FIAT_TO_CRYPTO_DEPOSIT = 'FIAT_TO_CRYPTO_DEPOSIT',
  CRYPTO_TO_FIAT_WITHDRAWAL = 'CRYPTO_TO_FIAT_WITHDRAWAL',
  FIAT_TO_FIAT_DEPOSIT = 'FIAT_TO_FIAT_DEPOSIT',
  FIAT_TO_FIAT_WITHDRAWAL = 'FIAT_TO_FIAT_WITHDRAWAL',
}
