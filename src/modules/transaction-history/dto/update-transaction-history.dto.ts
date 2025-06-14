import { PartialType } from '@nestjs/swagger';
import { TransactionHistoryDto } from './create-transaction-history.dto';

export class UpdateWalletWebhookEventType extends PartialType(
  TransactionHistoryDto,
) {}
