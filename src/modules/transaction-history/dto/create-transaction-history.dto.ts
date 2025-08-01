import {
  TransactionDirectionEnum,
  PaymentStatus,
  TransactionTypeEnum,
  RampPaymentEventEnum,
} from '@/models/payment.types';
import {
  FeeLevel,
  WalletWebhookEventEnum,
} from '@/models/wallet-manager.types';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';

export class TransactionHistoryDto {
  event?: WalletWebhookEventEnum | RampPaymentEventEnum;
  transactionId: string;
  transactionDirection: TransactionDirectionEnum;
  transactionType: TransactionTypeEnum;
  assetCode: string;
  amount: string;
  fee?: string;
  feeLevel?: FeeLevel;
  blockchainTxId: string;
  reason?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  walletId: string;
  walletName?: string;
  paymentStatus?: PaymentStatus;
  sourceAddress?: string;
  destinationAddress: string;
  paymentNetwork: string;
  tokenId?: string;
  user: UserEntity;
  rampID?: string;
  mainAssetAmount?: number;
}
