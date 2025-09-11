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
import { findDynamic, FindDynamicOptions } from '@/utils/DynamicSource';

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

  async getAllUserTransactions({ page, limit }, userId: string) {
    try {
      const options: FindDynamicOptions & { where?: { [key: string]: any } } = {
        page,
        limit,
        selectFields: [
          'id',
          'transactionId',
          'transactionDirection',
          'transactionType',
          'assetCode',
          'amount',
          'fee',
          'feeLevel',
          'blockchainTxId',
          'reason',
          'paymentStatus',
          'sourceAddress',
          'destinationAddress',
          'paymentNetwork',
          'createdAt',
          'rampID',
          'mainFiatAmount',
          'mainAssetAmount',
          'transactionMessage',
        ],
        sortBy: [{ field: 'createdAt', order: 'DESC' }],
      };

      if (userId) {
        options.where = { 'user.id': userId };
        options.joinRelations = [{ relation: 'user' }];
      }

      const result = await findDynamic(this.transactionRepo, options);
      return result;
    } catch (error) {
      console.error('Error in getAllUserTransactions:', error);
      throw error;
    }
  }

  async findTransactionByTransactionId(
    transactionId: string,
  ): Promise<Partial<TransactionHistoryEntity> | null> {
    const transaction = await this.findOneTransactionDynamic(
      { transactionId },
      {
        selectFields: ['id', 'paymentStatus', 'transactionDirection'],
        joinRelations: [{ relation: 'user', selectFields: ['id'] }],
      },
    );
    return transaction;
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
    existing.paymentStatus = updates.status;
    existing.updatedAt = updates.done_at;
    existing.blockchainTxId = updates.txid;
    existing.reason = updates.narration;

    return this.transactionRepo.save(existing);
  }

  async updateCwalletTransaction(
    params: IUpdateCwalletTransactionDto,
  ): Promise<TransactionHistoryEntity | null> {
    const transaction = await this.findOneTransactionDynamic(
      { transactionId: params.transactionId },
      {
        selectFields: [
          'id',
          'transactionId',
          'transactionDirection',
          'transactionType',
          'assetCode',
          'amount',
          'fee',
          'feeLevel',
          'blockchainTxId',
          'reason',
          'paymentStatus',
          'sourceAddress',
          'destinationAddress',
          'paymentNetwork',
          'createdAt',
        ],
        joinRelations: [{ relation: 'user', selectFields: ['id'] }],
      },
    );

    if (!transaction) {
      throw new CustomHttpException(
        'Transaction not found',
        HttpStatus.NOT_FOUND,
      );
    }

    Object.assign(transaction, params.updates);

    return this.transactionRepo.save(transaction);
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

  async findOneTransactionDynamic(
    identifier: { transactionId?: string },
    options?: {
      selectFields?: string[]; // fields from transaction
      joinRelations?: {
        // join relations with optional select fields
        relation: string;
        selectFields?: string[]; // only fields to select from this relation
      }[];
    },
  ): Promise<TransactionHistoryEntity | null> {
    try {
      const query = this.transactionRepo.createQueryBuilder('transaction');

      // Default fields from transaction
      const defaultFields = [
        'transaction.id',
        'transaction.event',
        'transaction.paymentStatus',
        'transaction.updatedAt',
        'transaction.blockchainTxId',
        'transaction.reason',
      ];
      const fieldsToSelect =
        options?.selectFields?.map((f) => `transaction.${f}`) ?? defaultFields;
      query.select(fieldsToSelect);

      // Handle joinRelations dynamically with selected fields
      options?.joinRelations?.forEach((join) => {
        const parts = join.relation.split('.'); // support nested relations
        let parentAlias = 'transaction';

        parts.forEach((part, index) => {
          const alias = parts.slice(0, index + 1).join('_'); // e.g., transaction_user
          query.leftJoin(`${parentAlias}.${part}`, alias); // join relation

          // select only specified fields from relation
          if (index === parts.length - 1 && join.selectFields?.length) {
            const relationFields = join.selectFields.map(
              (f) => `${alias}.${f}`,
            );
            query.addSelect(relationFields);
          }

          parentAlias = alias;
        });
      });

      // WHERE clause
      if (identifier.transactionId) {
        query.where('transaction.transactionId = :transactionId', {
          transactionId: identifier.transactionId,
        });
      } else {
        throw new Error('transactionId must be provided');
      }

      return await query.getOne();
    } catch (error) {
      this.logger.error('Error fetching transaction dynamically:', error);
      return null;
    }
  }
}
