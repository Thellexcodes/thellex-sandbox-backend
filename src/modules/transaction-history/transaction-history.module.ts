import { Module } from '@nestjs/common';
import { TransactionHistoryService } from './transaction-history.service';
import { TransactionHistoryController } from './transaction-history.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionHistoryEntity } from '@/utils/typeorm/entities/transactions/transaction-history.entity';
@Module({
  imports: [TypeOrmModule.forFeature([TransactionHistoryEntity])],
  controllers: [TransactionHistoryController],
  providers: [TransactionHistoryService],
})
export class TransactionHistoryModule {}
