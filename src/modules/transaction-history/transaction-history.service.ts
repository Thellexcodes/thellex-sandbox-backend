import { HttpStatus, Injectable } from '@nestjs/common';
import { TransactionHistoryEntity } from '@/utils/typeorm/entities/transaction-history.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { QWalletWebhookEnum } from '@/types/qwallet-webhook.enum';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { CreateTransactionHistoryDto } from './dto/create-transaction-history.dto';
import { CustomHttpException } from '@/middleware/custom.http.exception';
import { IQWalletHookWithdrawSuccessfulEvent } from '../qwallet-hooks/dto/qwallet-hook-withdrawSuccessful.dto';

//TODO: add try catch block for error handling
@Injectable()
export class TransactionHistoryService {
  constructor(
    @InjectRepository(TransactionHistoryEntity)
    private readonly transactionRepo: Repository<TransactionHistoryEntity>,
  ) {}

  async create(
    txData: CreateTransactionHistoryDto,
    user: UserEntity,
  ): Promise<TransactionHistoryEntity> {
    const transactionRecord = this.transactionRepo.create({
      user,
      ...txData,
    });

    return this.transactionRepo.save(transactionRecord);
  }

  async findTransactionByTransactionId(
    transactionId: string,
  ): Promise<TransactionHistoryEntity | null> {
    return this.transactionRepo.findOne({
      where: { transactionId },
    });
  }

  async updateTransactionByTransactionId(
    updates: IQWalletHookWithdrawSuccessfulEvent,
  ): Promise<TransactionHistoryEntity> {
    const existing = await this.findTransactionByTransactionId(
      updates.transactionId,
    );

    if (!existing) {
      throw new CustomHttpException(
        QWalletWebhookEnum.TRANSACTION_NOT_FOUND,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    existing.doneAt = updates.done_at;
    existing.updatedAt = new Date();
    existing.blockchainTxId = updates.txid;
    existing.reason = updates.reason;
    existing.paymentStatus = updates.status;

    return this.transactionRepo.save(existing);
  }
}
