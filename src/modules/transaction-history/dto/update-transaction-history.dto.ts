import { PartialType } from '@nestjs/swagger';
import { TransactionHistoryDto } from './create-transaction-history.dto';

export class UpdateWalletWebhookEventEnum extends PartialType(
  TransactionHistoryDto,
) {}
