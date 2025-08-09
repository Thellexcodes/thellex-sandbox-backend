import { Controller } from '@nestjs/common';
import { TransactionHistoryService } from './transaction-history.service';
import { VersionedController101 } from '../controller/base.controller';

@VersionedController101('transaction-history')
export class TransactionHistoryController {
  constructor(
    private readonly transactionHistoryService: TransactionHistoryService,
  ) {}
}
