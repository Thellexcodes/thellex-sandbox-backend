import { Injectable, Logger } from '@nestjs/common';
import { YcHookDataDto } from './dto/yc-hook-data.dto';
import { PaymentsService } from '@/modules/payments/payments.service';
import { toUTCDate, toUTCString } from '@/utils/helpers';
import { PaymentStatus, TransactionTypeEnum } from '@/models/payment.types';
import { TransactionHistoryService } from '@/modules/transaction-history/transaction-history.service';
import { NotificationsGateway } from '@/modules/notifications/notifications.gateway';
import {
  NotificationEventEnum,
  NotificationStatusEnum,
} from '@/models/notifications.enum';
import { TransactionsService } from '@/modules/transactions/transactions.service';
import { DevicesService } from '@/modules/devices/devices.service';

@Injectable()
export class YcPaymentHookService {
  private readonly logger = new Logger(YcPaymentHookService.name);

  constructor(
    private readonly paymentService: PaymentsService,
    private readonly transactionHistoryService: TransactionHistoryService,
    private readonly notificationGateway: NotificationsGateway,
    private readonly transactionService: TransactionsService,
    private readonly deviceService: DevicesService,
  ) {}

  async handleSuccessfulCollectionRequest(dto: YcHookDataDto) {
    await this.paymentService.updateRampTransactionHistoryBySequenceId(
      dto.sequenceId,
      {
        paymentStatus: PaymentStatus.Complete,
        updatedAt: toUTCString(Number(dto.executedAt)),
      },
    );
  }

  async handleFailedCollectionRequest(dto: YcHookDataDto) {
    const rampTxn =
      await this.paymentService.findOneRampTransactionBySequenceId(
        dto.sequenceId,
      );

    if (rampTxn && rampTxn.paymentStatus === PaymentStatus.Failed) return;

    const rampTransaction =
      await this.paymentService.updateRampTransactionHistoryBySequenceId(
        dto.sequenceId,
        {
          paymentStatus: PaymentStatus.Failed,
          updatedAt: toUTCDate(dto.executedAt.toString()),
          providerErrorMsg: dto.errorCode,
        },
      );

    const { user, ...transaction } =
      await this.transactionHistoryService.updateTransactionByTransactionId(
        rampTransaction.sequenceId,
        { paymentStatus: rampTransaction.paymentStatus },
      );

    const notification = await this.notificationGateway.createNotification({
      user,
      title: NotificationEventEnum.FIAT_TO_CRYPTO_DEPOSIT_FAILED,
      message: NotificationEventEnum.FIAT_TO_CRYPTO_DEPOSIT_FAILED,
      data: {
        amount: rampTransaction.netFiatAmount.toString(),
        assetCode: rampTransaction.recipientInfo.assetCode,
        txnID: transaction.id,
        transactionType: TransactionTypeEnum.FIAT_TO_CRYPTO_DEPOSIT,
      },
    });

    const tokens = await this.deviceService.getUserDeviceTokens(user.id);

    await this.notificationGateway.emitNotificationToUser({
      tokens,
      event: NotificationEventEnum.FIAT_TO_CRYPTO_DEPOSIT,
      status: NotificationStatusEnum.FAILED,
      data: {
        notification,
        transaction,
      },
    });
  }

  ///------------- Payments ------------

  async handleSuccessfulPaymentRequest(dto: YcHookDataDto) {
    //[x] update the ramp trnsaction
    const rampTransaction =
      await this.paymentService.updateRampTransactionHistoryBySequenceId(
        dto.sequenceId,
        {
          paymentStatus: PaymentStatus.Complete,
          updatedAt: toUTCString(Number(dto.executedAt)),
        },
      );

    const { user, ...transaction } =
      await this.transactionHistoryService.updateTransactionByTransactionId(
        rampTransaction.sequenceId,
        { paymentStatus: dto.status },
      );

    await this.transactionService.createTransaction(
      {
        transactionType: TransactionTypeEnum.CRYPTO_TO_FIAT_WITHDRAWAL,
        cryptoAmount: transaction.mainAssetAmount ?? 0,
        fiatAmount: transaction.mainFiatAmount ?? 0,
        cryptoAsset: transaction.assetCode,
        paymentStatus: transaction.paymentStatus,
        paymentReason: transaction.paymentReason,
      },
      user,
    );

    const notification = await this.notificationGateway.createNotification({
      user,
      title: NotificationEventEnum.CRYPTO_TO_FIAT_WITHDRAWAL,
      message: NotificationEventEnum.CRYPTO_TO_FIAT_WITHDRAWAL,
      data: {
        amount: rampTransaction.netFiatAmount.toString(),
        assetCode: rampTransaction.recipientInfo.assetCode,
        txnID: transaction.id,
        transactionType: TransactionTypeEnum.CRYPTO_TO_FIAT_WITHDRAWAL,
      },
    });

    const tokens = await this.deviceService.getUserDeviceTokens(user.id);

    await this.notificationGateway.emitNotificationToUser({
      tokens,
      event: NotificationEventEnum.CRYPTO_TO_FIAT_WITHDRAWAL,
      status: NotificationStatusEnum.SUCCESS,
      data: {
        notification,
        transaction,
      },
    });
  }

  async handleFailedPaymentRequest(dto: YcHookDataDto) {
    const rampTxn =
      await this.paymentService.findOneRampTransactionBySequenceId(
        dto.sequenceId,
      );

    if (rampTxn && rampTxn.paymentStatus === PaymentStatus.Failed) return;

    const rampTransaction =
      await this.paymentService.updateRampTransactionHistoryBySequenceId(
        dto.sequenceId,
        {
          paymentStatus: PaymentStatus.Failed,
          updatedAt: toUTCDate(dto.executedAt.toString()),
        },
      );

    const { user, ...transaction } =
      await this.transactionHistoryService.updateTransactionByTransactionId(
        rampTransaction.sequenceId,
        { paymentStatus: rampTransaction.paymentStatus },
      );

    const notification = await this.notificationGateway.createNotification({
      user,
      title: NotificationEventEnum.CRYPTO_TO_FIAT_WITHDRAWAL_FAILED,
      message: NotificationEventEnum.CRYPTO_TO_FIAT_WITHDRAWAL_FAILED,
      data: {
        amount: rampTransaction.netFiatAmount.toString(),
        assetCode: rampTransaction.recipientInfo.assetCode,
        txnID: transaction.id,
        transactionType: TransactionTypeEnum.CRYPTO_TO_FIAT_WITHDRAWAL,
      },
    });

    const tokens = await this.deviceService.getUserDeviceTokens(user.id);

    await this.notificationGateway.emitNotificationToUser({
      tokens,
      event: NotificationEventEnum.CRYPTO_TO_FIAT_WITHDRAWAL,
      status: NotificationStatusEnum.FAILED,
      data: {
        notification,
        transaction,
      },
    });
  }
}
