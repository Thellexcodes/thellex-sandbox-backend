import { PaymentStatus } from '@/types/payment.types';
import { QWalletWebhookEnum } from '@/types/qwallet-webhook.enum';

export class CreateTransactionHistoryDto {
  event: QWalletWebhookEnum;
  transactionId: string;
  type: string;
  currency: string;
  amount: string;
  fee: string;
  blockchainTxId: string;
  status: string;
  reason: string | null;
  createdAt: string;
  doneAt: string | null;
  walletId: string;
  walletName: string;
  walletCurrency: string;
  paymentStatus: PaymentStatus | string;
  paymentAddress: string;
  paymentNetwork: string;
}
