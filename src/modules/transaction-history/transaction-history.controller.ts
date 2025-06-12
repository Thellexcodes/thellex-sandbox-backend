import { Controller } from '@nestjs/common';
import { TransactionHistoryService } from './transaction-history.service';

@Controller('transaction-history')
export class TransactionHistoryController {
  constructor(
    private readonly transactionHistoryService: TransactionHistoryService,
  ) {}
}
