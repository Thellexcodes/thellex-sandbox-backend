import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TransactionHistoryService } from './transaction-history.service';
import { CreateTransactionHistoryDto } from './dto/create-transaction-history.dto';
import { UpdateTransactionHistoryDto } from './dto/update-transaction-history.dto';

@Controller('transaction-history')
export class TransactionHistoryController {
  constructor(
    private readonly transactionHistoryService: TransactionHistoryService,
  ) {}
}
