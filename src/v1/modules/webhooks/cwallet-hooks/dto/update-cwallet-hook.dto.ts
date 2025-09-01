import { PartialType } from '@nestjs/swagger';
import { CwalletHookDto } from './create-cwallet-hook.dto';
import { PaymentStatus } from '@/v1/models/payment.types';
import { WalletWebhookEventEnum } from '@/v1/models/wallet-manager.types';

export class UpdateCwalletHookDto extends PartialType(CwalletHookDto) {}

export interface IUpdateCwalletTransactionDto {
  transactionId: string;
  updates: Partial<{
    paymentStatus: PaymentStatus;
    event: WalletWebhookEventEnum;
    blockchainTxId: string;
    updatedAt: Date;
  }>;
}
