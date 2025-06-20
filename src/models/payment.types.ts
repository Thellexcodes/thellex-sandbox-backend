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

export enum PaymentType {
  OUTBOUND = 'OUTBOUND',
  INBOUND = 'INBOUND',
}
