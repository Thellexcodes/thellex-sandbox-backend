import { HttpStatus, Injectable } from '@nestjs/common';
import { TransactionHistoryEntity } from '@/utils/typeorm/entities/transaction-history.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { QWalletStatus } from '@/modules/qwallet/qwallet-status.enum';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { CustomHttpException } from '@/middleware/custom.http.exception';
import { IQWalletHookWithdrawSuccessfulEvent } from '../qwallet-hooks/dto/qwallet-hook-withdrawSuccessful.dto';
import { TransactionHistoryDto } from './dto/create-transaction-history.dto';
import { WalletWebhookEventType } from '@/types/wallet-manager.types';
import { PaymentStatus } from '@/types/payment.types';
import { IUpdateCwalletTransactionDto } from '../cwallet-hooks/dto/update-cwallet-hook.dto';

//TODO: add try catch block for error handling
@Injectable()
export class TransactionHistoryService {
  constructor(
    @InjectRepository(TransactionHistoryEntity)
    private readonly transactionRepo: Repository<TransactionHistoryEntity>,
  ) {}

  async create(
    txData: TransactionHistoryDto,
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
      relations: ['user'],
    });
  }

  async updateQWalletTransactionByTransactionId(
    updates: IQWalletHookWithdrawSuccessfulEvent,
  ): Promise<TransactionHistoryEntity> {
    const existing = await this.findTransactionByTransactionId(
      updates.transactionId,
    );

    if (!existing) {
      throw new CustomHttpException(
        QWalletStatus.TRANSACTION_NOT_FOUND,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    existing.paymentStatus = updates.status;
    existing.updatedAt = updates.done_at;
    existing.blockchainTxId = updates.txid;
    existing.reason = updates.reason;

    return this.transactionRepo.save(existing);
  }

  async updateCwalletTransaction(
    params: IUpdateCwalletTransactionDto,
  ): Promise<TransactionHistoryEntity | null> {
    const existing = await this.findTransactionByTransactionId(
      params.transactionId,
    );

    console.log(params.updates);

    if (!existing) {
      throw new CustomHttpException(
        'Transaction not found',
        HttpStatus.NOT_FOUND,
      );
    }

    Object.assign(existing, params.updates);

    return this.transactionRepo.save(existing);
  }
}
