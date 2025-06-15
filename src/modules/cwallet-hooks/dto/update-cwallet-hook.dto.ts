import { PartialType } from '@nestjs/swagger';
import { CwalletHookDto } from './create-cwallet-hook.dto';
import { PaymentStatus } from '@/types/payment.types';
import { WalletWebhookEventType } from '@/types/wallet-manager.types';

export class UpdateCwalletHookDto extends PartialType(CwalletHookDto) {}

export interface IUpdateCwalletTransactionDto {
  transactionId: string;
  updates: Partial<{
    paymentStatus: PaymentStatus;
    event: WalletWebhookEventType;
    blockchainTxId: string;
    updatedAt: Date;
  }>;
}
