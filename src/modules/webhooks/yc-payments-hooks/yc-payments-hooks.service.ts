import { Injectable } from '@nestjs/common';
import { YcCreatePaymentHookDto } from './dto/yc-payment-hook.dto';
import { PaymentsService } from '@/modules/payments/payments.service';
import { toUTCString } from '@/utils/helpers';
import { PaymentStatus, TransactionTypeEnum } from '@/models/payment.types';
import { TransactionHistoryService } from '@/modules/transaction-history/transaction-history.service';
import { NotificationsGateway } from '@/modules/notifications/notifications.gateway';
import {
  NotificationEventEnum,
  NotificationStatusEnum,
} from '@/models/notifications.enum';

@Injectable()
export class YcPaymentHookService {
  constructor(
    private readonly paymentService: PaymentsService,
    private readonly transactionHistoryService: TransactionHistoryService,
    private readonly notificationGateway: NotificationsGateway,
  ) {}

  async handleSuccessfulCollectionRequest(dto: YcCreatePaymentHookDto) {
    const rampTransaction =
      await this.paymentService.updateRampTransactionHistoryBySequenceId(
        dto.sequenceId,
        {
          paymentStatus: PaymentStatus.Complete,
          updatedAt: toUTCString(dto.executedAt),
        },
      );

    const { user, ...transaction } =
      await this.transactionHistoryService.updateTransactionByTransactionId(
        rampTransaction.sequenceId,
        { paymentStatus: dto.status },
      );

    const notification = await this.notificationGateway.createNotification({
      user,
      title: NotificationEventEnum.FIAT_TO_CRYPTO_DEPOSIT,
      message: NotificationEventEnum.FIAT_TO_CRYPTO_DEPOSIT,
      data: {
        amount: rampTransaction.netFiatAmount.toString(),
        assetCode: rampTransaction.recipientInfo.assetCode,
        txnID: transaction.id,
        transactionType: TransactionTypeEnum.CRYPTO_TO_FIAT_WITHDRAWAL,
      },
    });

    await this.notificationGateway.emitNotificationToUser({
      token: user.alertID,
      event: NotificationEventEnum.FIAT_TO_CRYPTO_DEPOSIT,
      status: NotificationStatusEnum.SUCCESS,
      data: {
        notification,
        transaction,
      },
    });
  }

  async handleSuccessfulPaymentRequest(dto: YcCreatePaymentHookDto) {
    //[x] update the ramp trnsaction
    const rampTransaction =
      await this.paymentService.updateRampTransactionHistoryBySequenceId(
        dto.sequenceId,
        {
          paymentStatus: PaymentStatus.Complete,
          updatedAt: toUTCString(dto.executedAt),
        },
      );

    const { user, ...transaction } =
      await this.transactionHistoryService.updateTransactionByTransactionId(
        rampTransaction.sequenceId,
        { paymentStatus: dto.status },
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

    await this.notificationGateway.emitNotificationToUser({
      token: user.alertID,
      event: NotificationEventEnum.CRYPTO_TO_FIAT_WITHDRAWAL,
      status: NotificationStatusEnum.SUCCESS,
      data: {
        notification,
        transaction,
      },
    });
  }
}
