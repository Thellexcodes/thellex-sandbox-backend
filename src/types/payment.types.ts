import { TransactionType } from '@circle-fin/developer-controlled-wallets';

export enum PaymentStatus {
  None = 'None',
  Confirmed = 'confirmed',
  Accepted = 'accepted',
  Done = 'Done',
  Processing = 'Processing',
}

export enum PaymentType {
  OUTBOUND = 'OUTBOUND',
  INBOUND = 'INBOUND',
}
