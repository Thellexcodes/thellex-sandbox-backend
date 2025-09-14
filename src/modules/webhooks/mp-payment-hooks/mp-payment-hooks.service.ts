import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FiatCryptoRampTransactionEntity } from '@/utils/typeorm/entities/fiat-crypto-ramp-transaction.entity';
import { Repository } from 'typeorm';
import { CreateMpPaymentHookDto } from './dto/create-mp-payment-hook.dto';
import { TransactionHistoryEntity } from '@/utils/typeorm/entities/transactions/transaction-history.entity';
import { PaymentStatus, TransactionTypeEnum } from '@/models/payment.types';
import { TransactionsService } from '@/modules/transactions/transactions.service';
import { flexiTruncate } from '@/utils/helpers';
import { NotificationsGateway } from '@/modules/notifications/notifications.gateway';
import {
  NotificationEventEnum,
  NotificationStatusEnum,
} from '@/models/notifications.enum';
import { NotificationKindEnum } from '@/utils/typeorm/entities/notification.entity';
import { DevicesService } from '@/modules/devices/devices.service';
import { RampWebhookEventEnum } from '@/models/wallet-manager.types';
import { QWalletStatus } from '@/modules/wallets/qwallet/qwallet-status.enum';

@Injectable()
export class MpPaymentHooksService {
  private readonly logger = new Logger(MpPaymentHooksService.name);

  constructor(
    @InjectRepository(FiatCryptoRampTransactionEntity)
    private readonly fiatCryptoRampTransactionRepo: Repository<FiatCryptoRampTransactionEntity>,

    @InjectRepository(TransactionHistoryEntity)
    private readonly transactionHistoryRepo: Repository<TransactionHistoryEntity>,

    private readonly notificationGateway: NotificationsGateway,
    private transactionService: TransactionsService,
    private readonly deviceService: DevicesService,
  ) {}

  async success(createMpPaymentHookDto: CreateMpPaymentHookDto) {
    // Find the ramp transaction
    const rampTxn = await this.fiatCryptoRampTransactionRepo
      .createQueryBuilder('ramp')
      .leftJoin('ramp.user', 'user')
      .select([
        'ramp.id',
        'ramp.paymentStatus',
        'user.id',
        'ramp.netFiatAmount',
      ])
      .where('ramp.providerTransactionId = :id', {
        id: createMpPaymentHookDto.id,
      })
      .getOne();

    if (!rampTxn) {
      throw new NotFoundException('Ramp transaction not found');
    }

    if (rampTxn.paymentStatus === PaymentStatus.Complete) {
      return this.logger.error(QWalletStatus.TRANSACTION_ALREADY_PROCESSED);
    }

    rampTxn.paymentStatus = PaymentStatus.Complete;
    const updatedTxn = await this.fiatCryptoRampTransactionRepo.save(rampTxn);

    // Find the associated transaction history
    const transaction = await this.transactionHistoryRepo.findOne({
      where: { rampID: rampTxn.id },
      select: [
        'id',
        'paymentStatus',
        'amount',
        'paymentReason',
        'mainFiatAmount',
      ],
    });

    if (transaction) {
      await this.transactionHistoryRepo.update(
        { id: transaction.id },
        { paymentStatus: updatedTxn.paymentStatus },
      );
    }

    await this.transactionService.createTransaction(
      {
        transactionType: TransactionTypeEnum.CRYPTO_TO_FIAT_WITHDRAWAL,
        cryptoAmount: Number(transaction.amount) ?? 0,
        cryptoAsset: transaction.assetCode,
        paymentStatus: updatedTxn.paymentStatus,
        paymentReason: transaction.paymentReason,
        fiatAmount: rampTxn.netFiatAmount ?? 0,
      },
      rampTxn.user,
    );

    const notification = await this.notificationGateway.createNotification({
      user: rampTxn.user,
      title: NotificationEventEnum.CRYPTO_TO_FIAT_WITHDRAWAL,
      message: NotificationEventEnum.CRYPTO_TO_FIAT_WITHDRAWAL,
      data: {
        amount: flexiTruncate(rampTxn.netFiatAmount, 3),
        fiatCode: rampTxn.fiatCode,
        txnID: transaction.id,
        transactionType: TransactionTypeEnum.CRYPTO_TO_FIAT_WITHDRAWAL,
        kind: NotificationKindEnum.Transaction,
      },
    });

    const tokens = await this.deviceService.getUserDeviceTokens(
      rampTxn.user.id,
    );

    await this.notificationGateway.emitNotificationToUser({
      event: RampWebhookEventEnum.OffRampTransactionSuccessful,
      status: NotificationStatusEnum.SUCCESS,
      data: {
        notification,
        transaction,
      },
      tokens,
    });
  }
}
