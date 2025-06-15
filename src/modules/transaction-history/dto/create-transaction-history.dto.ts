import { PaymentStatus, PaymentType } from '@/types/payment.types';
import { QWalletStatus } from '@/modules/qwallet/qwallet-status.enum';
import { FeeLevel, WalletWebhookEventType } from '@/types/wallet-manager.types';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';

export class TransactionHistoryDto {
  event?: WalletWebhookEventType;
  transactionId: string;
  type: PaymentType;
  currency: string;
  amount: string;
  fee: string;
  feeLevel?: FeeLevel;
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
  feeLevel?: FeeLevel;
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
