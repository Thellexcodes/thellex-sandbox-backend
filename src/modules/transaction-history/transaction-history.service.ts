import { Injectable } from '@nestjs/common';
import { CreateTransactionHistoryDto } from './dto/create-transaction-history.dto';
import { TransactionHistoryEntity } from '@/utils/typeorm/entities/transaction-history.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { QWalletWebhookEnum } from '@/types/qwallet-webhook.enum';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';

//TODO: add try catch block for error handling
@Injectable()
export class TransactionHistoryService {
  constructor(
    @InjectRepository(TransactionHistoryEntity)
    private readonly transactionRepo: Repository<TransactionHistoryEntity>,
  ) {}

  async createDepositTransactionRecord(
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
      status: txData.status,
      reason: txData.reason,
      createdAt: new Date(txData.createdAt),
      doneAt: txData.doneAt ? new Date(txData.doneAt) : null,
      walletId: txData.walletId,
      walletName: txData.walletName,
      walletCurrency: txData.walletCurrency,
      paymentStatus: txData.paymentStatus,
      paymentAddress: txData.paymentAddress,
      paymentNetwork: txData.paymentNetwork,
    });

    return this.transactionRepo.save(transactionRecord);
  }

  // New function to find existing transaction by transactionId
  async findTransactionByTransactionId(
    transactionId: string,
  ): Promise<TransactionHistoryEntity | null> {
    return this.transactionRepo.findOne({
      where: { transactionId },
    });
  }
}
