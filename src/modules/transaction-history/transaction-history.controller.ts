import { Controller } from '@nestjs/common';
import { TransactionHistoryService } from './transaction-history.service';
import { VersionedController001 } from '../controller/base.controller';

@VersionedController001('transaction-history')
export class TransactionHistoryController {
  constructor(
    private readonly transactionHistoryService: TransactionHistoryService,
  ) {}
}
