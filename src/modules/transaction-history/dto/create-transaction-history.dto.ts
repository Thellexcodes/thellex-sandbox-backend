import { PaymentStatus, PaymentType } from '@/types/payment.types';
import { QWalletWebhookEnum } from '@/types/qwallet-webhook.enum';
import { WalletWebhookEventType } from '@/types/wallet-manager.types';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { FeeLevel } from '@circle-fin/developer-controlled-wallets';

export class TransactionHistoryDto {
  event?: WalletWebhookEventType;
  transactionId: string;
  type: PaymentType;
  currency: string;
  amount: string;
  fee: string;
  feeLevel: FeeLevel;
  blockchainTxId: string;
  reason: string | null;
  createdAt: Date;
  updatedAt: Date;
  walletId: string;
  walletName?: string;
  paymentStatus?: PaymentStatus;
  sourceAddress: string;
  destinationAddress: string;
  paymentNetwork: string;
  tokenId?: string;
  user: UserEntity;
}

export interface ITransactionHistory {
  event?: WalletWebhookEventType;
  transactionId: string;
  type: PaymentType;
  currency: string;
  amount: string;
  fee: string;
  feeLevel: FeeLevel;
  blockchainTxId: string;
  reason: string | null;
  createdAt: Date;
  updatedAt: Date;
  walletId: string;
  walletName?: string;
  paymentStatus?: PaymentStatus;
  sourceAddress: string;
  destinationAddress: string;
  paymentNetwork: string;
  tokenId?: string;
  user: UserEntity;
}
