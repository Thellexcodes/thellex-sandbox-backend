import { Injectable, Logger } from '@nestjs/common';
import { TransactionEntity } from '@/utils/typeorm/entities/transactions/transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
  ) {}

  async createTransaction(
    payload: CreateTransactionDto,
    user: UserEntity,
  ): Promise<TransactionEntity> {
    try {
      const transaction = new TransactionEntity();
      transaction.transactionType = payload.transactionType;
      transaction.fiatAmount = payload.fiatAmount;
      transaction.cryptoAmount = payload.cryptoAmount;
      transaction.fiatCurrency = payload.fiatCurrency;
      transaction.cryptoAsset = payload.cryptoAsset;
      transaction.paymentStatus = payload.paymentStatus;
      transaction.user = user;
      return this.transactionRepository.save(transaction);
    } catch (err) {
      console.log(err);
    }
  }

  async getAllRevenue(): Promise<TransactionEntity[]> {
    return await this.transactionRepository.find();
  }

  // async getTransactionsByType(type: TransactionType): Promise<Transaction[]> {
  //   this.logger.log(`Fetching transactions for type: ${type}`);
  //   return this.transactionRepository.find({ where: { type } });
  // }

  // async getAllTransactions(): Promise<Transaction[]> {
  //   this.logger.log('Fetching all transactions');
  //   return this.transactionRepository.find({
  //     order: { createdAt: 'DESC' }, // Sort by newest first for revenue tracking
  //   });
  // }

  // async updateTransactionStatus(
  //   id: string,
  //   status: TransactionStatus,
  // ): Promise<Transaction> {
  //   const transaction = await this.transactionRepository.findOne({
  //     where: { id },
  //   });
  //   if (!transaction) {
  //     this.logger.error(`Transaction not found: ${id}`);
  //     throw new Error('Transaction not found');
  //   }

  //   transaction.status = status;
  //   this.logger.log(`Updating transaction ${id} status to: ${status}`);
  //   return this.transactionRepository.save(transaction);
  // }
}
