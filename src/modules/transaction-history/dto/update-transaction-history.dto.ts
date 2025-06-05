import { PartialType } from '@nestjs/swagger';
import { CreateTransactionHistoryDto } from './create-transaction-history.dto';

export class UpdateTransactionHistoryDto extends PartialType(CreateTransactionHistoryDto) {}
