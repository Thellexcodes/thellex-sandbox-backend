import { HttpStatus, Injectable } from '@nestjs/common';
import { PaymentStatus, TransactionTypeEnum } from '@/models/payment.types';
import { AllRampTransactions, RevenuesDTO } from '@/models/admin.types';
import { TransactionsService } from '../transactions/transactions.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BetaTesterEntity } from '@/utils/typeorm/entities/beta.testers.entity';
import { TransactionEntity } from '@/utils/typeorm/entities/transactions/transaction.entity';
import { PaymentsService } from '../payments/v1/payments.service';
import {
  ApproveRampRequestDTO,
  ApproveRampRequestResponseDTO,
} from './dto/approve-transaction.dto';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import {
  NotificationEventEnum,
  NotificationStatusEnum,
} from '@/models/notifications.enum';
import { TransactionHistoryService } from '../transaction-history/transaction-history.service';
import { DevicesService } from '../devices/devices.service';
import { CustomHttpException } from '@/middleware/custom.http.exception';
import { ALL_ADMIN_ERRORS } from '@/models/admin-error.enum';
import { UserEntity } from '@/utils/typeorm/entities/user/user.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(BetaTesterEntity)
    private betaTesterRepo: Repository<BetaTesterEntity>,
    private transactionService: TransactionsService,
    private paymentsService: PaymentsService,
    private readonly notificationGateway: NotificationsGateway,
    private readonly transactionHistoryService: TransactionHistoryService,
    private readonly deviceService: DevicesService,
  ) {}

  async getAllBetaTesters() {
    await this.betaTesterRepo.find();
  }

  async allRevenues(): Promise<RevenuesDTO> {
    const allTransactions = await this.transactionService.getAllRevenue();

    // Calculate the sum of cryptoAmount and fiatAmount
    const totals = allTransactions.reduce(
      (acc, transaction: Partial<TransactionEntity>) => {
        return {
          totalCryptoAmount:
            acc.totalCryptoAmount +
            parseFloat(`${transaction.cryptoAmount || 0}`),
          totalFiatAmount:
            acc.totalFiatAmount + parseFloat(`${transaction.fiatAmount || 0}`),
        };
      },
      { totalCryptoAmount: 0, totalFiatAmount: 0 },
    );

    const { totalCryptoAmount, totalFiatAmount } = totals;

    const FIAT_CONVERSION_RATE = 1500; // [x] update to YC rate for now
    const totalRevenue = (
      totalCryptoAmount +
      totalFiatAmount / FIAT_CONVERSION_RATE
    ).toFixed(2);

    return {
      // totalRevenue: {
      //   title: 'total revenue',
      //   total: `${totalRevenue} USD`,
      // },
      fiatRevenue: {
        title: 'fiat revenue',
        total: `${totalFiatAmount.toFixed(2)} NGN`,
      },
      cryptoRevenue: {
        title: 'crypto revenue',
        total: `${totalCryptoAmount.toFixed(2)} USD`,
      },
    };
  }

  async allRampTransactions(
    page: number = 1,
    limit: number = 10,
  ): Promise<
    | {
        data: AllRampTransactions;
        total: number;
        pageNumber: number;
        lastPage: number;
      }
    | any
  > {
    const rampTransactionsResponse =
      await this.paymentsService.findDynamicRampTransactions({
        page,
        limit,
        selectFields: [
          'id',
          'createdAt',
          'transactionType',
          'approved',
          'sequenceId',
          'netFiatAmount',
          'netCryptoAmount',
          'paymentStatus',
          'providerTransactionId',
          'recipientInfo',
          'bankInfo',
        ],
        joinRelations: [{ relation: 'user', selectFields: ['uid'] }],
      });

    const {
      lastPage,
      page: pageNumber,
      total,
      data,
    } = rampTransactionsResponse;

    // Filter and map
    const rampTransactions: AllRampTransactions = data
      .filter(
        (txn) =>
          txn.transactionType === TransactionTypeEnum.FIAT_TO_CRYPTO_DEPOSIT &&
          txn.paymentStatus === PaymentStatus.Complete &&
          txn.providerTransactionId !== 'no-id-yet' &&
          !txn.approved,
      )
      .map((txn) => ({
        rampId: txn.providerTransactionId,
        txnID: txn.providerTransactionId,
        mainCryptoAmount: txn.netCryptoAmount,
        mainFiatAmount: txn.netFiatAmount,
        transactionType: txn.transactionType,
        userUID: txn.user.uid,
        approved: txn.approved,
        paymentStatus: txn.paymentStatus,
        sequenceId: txn.sequenceId,
        createdAt: txn.createdAt,
        recipientInfo: { ...txn.recipientInfo },
      }));

    return { data: rampTransactions, lastPage, pageNumber, total };
  }

  async approveRampTransactions(
    dto: ApproveRampRequestDTO,
  ): Promise<ApproveRampRequestResponseDTO> {
    const txn = await this.paymentsService.findRampTransactionByIdOrSequenceId(
      dto.sequenceId,
      {
        selectFields: ['id', 'sequenceId', 'approved', 'paymentStatus'],
        joinRelations: [{ relation: 'user', selectFields: ['id', 'email'] }],
      },
    );

    if (txn.approved)
      throw new CustomHttpException(
        ALL_ADMIN_ERRORS.RAMP_TRANSACTION_APPROVED_ALREADY,
        HttpStatus.CONFLICT,
      );

    if (txn.paymentStatus !== PaymentStatus.Complete) {
      throw new CustomHttpException(
        ALL_ADMIN_ERRORS.CANNOT_APPROVE_TRANSACTION,
        HttpStatus.FORBIDDEN,
      );
    }

    const user = txn.user;

    const rampTransaction =
      await this.paymentsService.updateRampTransactionHistoryBySequenceId(
        dto.sequenceId,
        { approved: dto.approved },
      );

    await this.transactionService.createTransaction(
      {
        transactionType: rampTransaction.transactionType,
        fiatAmount: rampTransaction.userAmount ?? 0,
        cryptoAmount: rampTransaction.mainAssetAmount ?? 0,
        cryptoAsset: rampTransaction.recipientInfo.assetCode,
        fiatCurrency: rampTransaction.fiatCode,
        paymentStatus: rampTransaction.paymentStatus,
        paymentReason:
          rampTransaction.paymentReason ?? rampTransaction.paymentReason,
      },
      user,
    );

    const { ...transaction } =
      await this.transactionHistoryService.updateTransactionByTransactionId(
        rampTransaction.sequenceId,
        { paymentStatus: rampTransaction.paymentStatus },
      );

    const notification = await this.notificationGateway.createNotification({
      user: { id: user.id } as UserEntity,
      title: NotificationEventEnum.FIAT_TO_CRYPTO_DEPOSIT,
      message: NotificationEventEnum.FIAT_TO_CRYPTO_DEPOSIT,
      data: {
        amount: rampTransaction.netFiatAmount.toString(),
        assetCode: rampTransaction.recipientInfo.assetCode,
        txnID: transaction.id,
        transactionType: TransactionTypeEnum.CRYPTO_TO_FIAT_WITHDRAWAL,
      },
    });

    const tokens = await this.deviceService.getUserDeviceTokens(user.id);

    await this.notificationGateway.emitNotificationToUser({
      event: NotificationEventEnum.FIAT_TO_CRYPTO_DEPOSIT,
      status: NotificationStatusEnum.SUCCESS,
      data: {
        notification,
        transaction,
      },
      tokens,
    });

    return dto;
  }
}
