import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { CustomHttpException } from '@/middleware/custom.http.exception';
import { TransactionHistoryDto } from './dto/create-transaction-history.dto';
import { QWalletStatus } from '../wallets/qwallet/qwallet-status.enum';
import { IQWalletHookWithdrawSuccessfulEvent } from '../webhooks/qwallet-hooks/dto/qwallet-hook-withdrawSuccessful.dto';
import { IUpdateCwalletTransactionDto } from '../webhooks/cwallet-hooks/dto/update-cwallet-hook.dto';
import { TransactionHistoryEntity } from '@/utils/typeorm/entities/transactions/transaction-history.entity';

//TODO: add try catch block for error handling
@Injectable()
export class TransactionHistoryService {
  private readonly logger = new Logger(TransactionHistoryService.name);

  constructor(
    @InjectRepository(TransactionHistoryEntity)
    private readonly transactionRepo: Repository<TransactionHistoryEntity>,
  ) {}

  async create(
    txData: TransactionHistoryDto,
    user: UserEntity,
  ): Promise<TransactionHistoryEntity> {
    const transactionRecord = this.transactionRepo.create({ user, ...txData });
    return this.transactionRepo.save(transactionRecord);
  }

  async findTransactionByTransactionId(
    transactionId: string,
  ): Promise<TransactionHistoryEntity | null> {
    return this.transactionRepo.findOne({
      where: { transactionId },
      relations: ['user'],
    });
  }

  async updateQWalletTransactionByTransactionId(
    updates: IQWalletHookWithdrawSuccessfulEvent,
  ): Promise<TransactionHistoryEntity> {
    const existing = await this.findTransactionByTransactionId(updates.id);

    if (!existing) {
      throw new CustomHttpException(
        QWalletStatus.TRANSACTION_NOT_FOUND,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    existing.event = updates.event;
    // existing.paymentStatus = updates.status;
    existing.updatedAt = updates.done_at;
    existing.blockchainTxId = updates.txid;
    existing.reason = updates.narration;

    return this.transactionRepo.save(existing);
  }

  async updateCwalletTransaction(
    params: IUpdateCwalletTransactionDto,
  ): Promise<TransactionHistoryEntity | null> {
    const existing = await this.findTransactionByTransactionId(
      params.transactionId,
    );

    if (!existing) {
      throw new CustomHttpException(
        'Transaction not found',
        HttpStatus.NOT_FOUND,
      );
    }

    Object.assign(existing, params.updates);

    return this.transactionRepo.save(existing);
  }

  async updateTransactionByTransactionId(
    transactionId: string,
    updates: Partial<TransactionHistoryEntity>,
  ): Promise<TransactionHistoryEntity> {
    const transaction =
      await this.findTransactionByTransactionId(transactionId);

    if (!transaction) {
      throw new CustomHttpException(
        'Transaction not found',
        HttpStatus.NOT_FOUND,
      );
    }

    Object.assign(transaction, updates);

    return this.transactionRepo.save(transaction);
  }
}
