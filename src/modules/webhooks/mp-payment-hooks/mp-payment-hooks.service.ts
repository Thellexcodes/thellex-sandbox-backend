import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UpdateMpPaymentHookDto } from './dto/update-mp-payment-hook.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FiatCryptoRampTransactionEntity } from '@/utils/typeorm/entities/fiat-crypto-ramp-transaction.entity';
import { Repository } from 'typeorm';
import { CreateMpPaymentHookDto } from './dto/create-mp-payment-hook.dto';
import { PaymentsService } from '@/modules/payments/payments.service';
import { findDynamic } from '@/utils/DynamicSource';
import { TransactionHistoryService } from '@/modules/transaction-history/transaction-history.service';
import { TransactionHistoryEntity } from '@/utils/typeorm/entities/transactions/transaction-history.entity';
import { PaymentStatus, TransactionTypeEnum } from '@/models/payment.types';
import { TransactionsService } from '@/modules/transactions/transactions.service';

@Injectable()
export class MpPaymentHooksService {
  private readonly logger = new Logger(MpPaymentHooksService.name);

  constructor(
    @InjectRepository(FiatCryptoRampTransactionEntity)
    private readonly fiatCryptoRampTransactionRepo: Repository<FiatCryptoRampTransactionEntity>,

    @InjectRepository(TransactionHistoryEntity)
    private readonly transactionHistoryRepo: Repository<TransactionHistoryEntity>,

    private transactionService: TransactionsService,
  ) {}

  async success(createMpPaymentHookDto: CreateMpPaymentHookDto) {
    // Find the ramp transaction
    // Find the ramp transaction with user id
    const rampTxn = await this.fiatCryptoRampTransactionRepo
      .createQueryBuilder('ramp')
      .leftJoin('ramp.user', 'user') // assuming `ramp.user` is the relation
      .select(['ramp.id', 'ramp.paymentStatus', 'user.id'])
      .where('ramp.providerTransactionId = :id', {
        id: createMpPaymentHookDto.id,
      })
      .getOne();

    if (!rampTxn) {
      throw new NotFoundException('Ramp transaction not found');
    }

    // Update ramp transaction
    await this.fiatCryptoRampTransactionRepo.update(
      { id: rampTxn.id },
      { paymentStatus: PaymentStatus.Complete },
    );

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
      // Update transaction history
      await this.transactionHistoryRepo.update(
        { id: transaction.id },
        { paymentStatus: PaymentStatus.Complete },
      );
    }

    console.log({
      transactionType: TransactionTypeEnum.CRYPTO_TO_FIAT_WITHDRAWAL,
      cryptoAmount: Number(transaction.amount) ?? 0,
      cryptoAsset: transaction.assetCode,
      paymentStatus: transaction.paymentStatus,
      paymentReason: transaction.paymentReason,
      fiatAmount: transaction.mainFiatAmount ?? 0,
    });

    await this.transactionService.createTransaction(
      {
        transactionType: TransactionTypeEnum.CRYPTO_TO_FIAT_WITHDRAWAL,
        cryptoAmount: Number(transaction.amount) ?? 0,
        cryptoAsset: transaction.assetCode,
        paymentStatus: transaction.paymentStatus,
        paymentReason: transaction.paymentReason,
        fiatAmount: transaction.mainFiatAmount ?? 0,
      },
      rampTxn.user,
    );

    // const notification = await this.notificationGateway.createNotification({
    //   user,
    //   title: NotificationEventEnum.CRYPTO_DEPOSIT,
    //   message: NotificationEventEnum.CRYPTO_DEPOSIT,
    //   data: {
    //     amount: notificationPayload.amounts[0],
    //     assetCode,
    //     txnID: transaction.id,
    //     walletID: notificationPayload.walletId,
    //     transactionType: TransactionTypeEnum.CRYPTO_DEPOSIT,
    //     kind: NotificationKindEnum.Transaction,
    //   },
    // });

    // const tokens = await this.deviceService.getUserDeviceTokens(user.id);

    // await this.notificationGateway.emitNotificationToUser({
    //   event: WalletWebhookEventEnum.DepositSuccessful,
    //   status: NotificationStatusEnum.SUCCESS,
    //   data: {
    //     notification,
    //     transaction,
    //   },
    //   tokens,
    // });

    // console.log({ transaction, rampTxn });

    //      {
    // [1]   createMpPaymentHookDto: {
    // [1]     created_at: '2025-08-25 21:38:39.734689 +0000 UTC',
    // [1]     event: 'transfer.successful',
    // [1]     id: 'e405c61d-ecff-4d7d-8564-038411401160',
    // [1]     reference: null,
    // [1]     status: 'SUCCESS',
    // [1]     updated_at: '2025-08-25 21:39:16.038069089 +0000 UTC'
    // [1]   }

    //     ] {
    // [1]   createMpPaymentHookDto: {
    // [1]     created_at: '2025-09-13 22:14:53.986647 +0000 UTC',
    // [1]     event: 'transfer.successful',
    // [1]     id: 'd337506c-241c-4fe3-a9a2-d7b356b1480f',
    // [1]     reference: null,
    // [1]     status: 'SUCCESS',
    // [1]     updated_at: '2025-09-13 22:15:28.199927797 +0000 UTC'
    // [1]   }
    // [1] }
    //      {
    // [1]   createMpPaymentHookDto: {
    // [1]     created_at: '2025-09-13 22:19:12.379846 +0000 UTC',
    // [1]     event: 'transfer.successful',
    // [1]     id: '3d82f2b0-b4af-45fd-a4ca-d6d5ce0e9f1f',
    // [1]     reference: null,
    // [1]     status: 'SUCCESS',
    // [1]     updated_at: '2025-09-13 22:19:45.419591232 +0000 UTC'
    // [1]   }
  }

  findAll() {
    return `This action returns all mpPaymentHooks`;
  }

  findOne(id: number) {
    return `This action returns a #${id} mpPaymentHook`;
  }

  update(id: number, updateMpPaymentHookDto: UpdateMpPaymentHookDto) {
    return `This action updates a #${id} mpPaymentHook`;
  }

  remove(id: number) {
    return `This action removes a #${id} mpPaymentHook`;
  }
}
