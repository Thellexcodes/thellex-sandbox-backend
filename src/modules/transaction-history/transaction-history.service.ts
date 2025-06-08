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
      event: QWalletWebhookEnum.DEPOSIT_SUCCESSFUL,
      transactionId: txData.transactionId,
      type: txData.type,
      currency: txData.currency,
      amount: txData.amount,
      fee: txData.fee,
      blockchainTxId: txData.blockchainTxId,
      reason: txData.reason,
      createdAt: new Date(txData.createdAt),
      doneAt: txData.doneAt ? new Date(txData.doneAt) : null,
      walletId: txData.walletId,
      walletName: txData.walletName,
      walletCurrency: txData.walletCurrency,
      paymentStatus: txData.status,
      paymentAddress: txData.paymentAddress,
      paymentNetwork: txData.paymentNetwork,
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

    existing.doneAt = new Date(updates.done_at);
    existing.blockchainTxId = updates.txid;
    existing.reason = updates.reason;
    existing.paymentStatus = updates.status;

    return this.transactionRepo.save(existing);
  }
}
