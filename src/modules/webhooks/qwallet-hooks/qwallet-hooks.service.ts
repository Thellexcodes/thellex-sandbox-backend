import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CustomHttpException } from '@/middleware/custom.http.exception';
import { QWalletWebhookPayloadDto } from './dto/qwallet-hook.dto';
import { IQwalletHookDepositSuccessfulData } from './dto/qwallet-hook-depositSuccessful.dto';
import { IQWalletHookWithdrawSuccessfulEvent } from './dto/qwallet-hook-withdrawSuccessful.dto';
import {
  FeeLevel,
  WalletErrorEnum,
  WalletWebhookEventEnum,
} from '@/models/wallet-manager.types';
import { normalizeEnumValue, toUTCDate } from '@/utils/helpers';
import {
  PaymentStatus,
  TransactionDirectionEnum,
  TransactionTypeEnum,
} from '@/models/payment.types';
import { IQWalletAddressGenerated } from './dto/qwallet-hook-walletUpdated.dto';
import { TransactionHistoryService } from '@/modules/transaction-history/transaction-history.service';
import { TransactionHistoryDto } from '@/modules/transaction-history/dto/create-transaction-history.dto';
import { QwalletService } from '@/modules/wallets/qwallet/qwallet.service';
import { QWalletStatus } from '@/modules/wallets/qwallet/qwallet-status.enum';
import {
  NotificationEventEnum,
  NotificationStatusEnum,
} from '@/models/notifications.enum';
import { NotificationsGateway } from '@/modules/notifications/notifications.gateway';
import { NotificationKindEnum } from '@/utils/typeorm/entities/notification.entity';
import { TokenEnum } from '@/config/settings';
import { TransactionsService } from '@/modules/transactions/transactions.service';
import { DevicesService } from '@/modules/devices/devices.service';

//TODO: handle errors with enum
//TODO: Update logger
@Injectable()
export class QwalletHooksService {
  private readonly logger = new Logger(QwalletHooksService.name);

  constructor(
    private readonly qwalletService: QwalletService,
    private readonly transactionHistoryService: TransactionHistoryService,
    private readonly notificationGateway: NotificationsGateway,
    private readonly transactionService: TransactionsService,
    private readonly deviceService: DevicesService,
  ) {}

  async handleWalletAddressGenerated(
    payload: QWalletWebhookPayloadDto,
  ): Promise<void> {
    const data = payload.data as IQWalletAddressGenerated;

    const qwalletProfile = await this.qwalletService.lookupSubAccountByQid(
      data.user.id,
    );

    if (!qwalletProfile) {
      throw new CustomHttpException(
        QWalletStatus.INVALID_USER,
        HttpStatus.BAD_REQUEST,
      );
    }

    const wallet = qwalletProfile.wallets.find((w) =>
      Object.entries(w.networkMetadata || {}).some(
        ([network, meta]) =>
          meta.address === 'no-address' && network === data.network,
      ),
    );

    if (!wallet) {
      //[x] log using sentry or local log
      return;
    }

    const updatedNetworkMetadata = {
      ...wallet.networkMetadata,
      [data.network]: {
        ...(wallet.networkMetadata?.[data.network] || {}),
        address: data.address,
      },
    };

    // const user = qwalletProfile.user;

    await this.qwalletService.updateWalletAddress({
      id: wallet.id,
      networkMetadata: updatedNetworkMetadata,
    });
  }

  handleDepositConfirmation(payload: any) {
    return { message: 'Deposit confirmation received', payload };
  }

  async handleDepositSuccessful(
    payload: QWalletWebhookPayloadDto,
  ): Promise<void> {
    try {
      const data = payload.data as IQwalletHookDepositSuccessfulData;

      if (data.status !== PaymentStatus.Accepted) return;

      const {
        id: transactionId,
        txid: blockchainTxId,
        amount,
        fee,
        reason,
        currency: assetCode,
        status,
        wallet,
        user,
        payment_address,
      } = data;

      const {
        id: walletId,
        name: walletName,
        deposit_address,
        updated_at,
        default_network,
      } = wallet;

      // Check if transaction already exists
      const existingTransaction =
        await this.transactionHistoryService.findTransactionByTransactionId(
          transactionId,
        );
      if (existingTransaction) {
        throw new CustomHttpException(
          QWalletStatus.TRANSACTION_FOUND,
          HttpStatus.CONFLICT,
        );
      }

      // Attach event and normalized done_at
      data.event = payload.event;
      const doneAt = toUTCDate(updated_at);

      const qwalletProfile = await this.qwalletService.lookupSubAccountByQid(
        user.id,
      );
      if (!qwalletProfile) {
        throw new CustomHttpException(
          QWalletStatus.INVALID_USER,
          HttpStatus.BAD_REQUEST,
        );
      }

      const matchingWallet = qwalletProfile.wallets.find(
        (w) => w.networkMetadata[default_network]?.address === deposit_address,
      );
      if (!matchingWallet) {
        throw new CustomHttpException(
          WalletErrorEnum.GET_USER_WALLET_FAILED,
          HttpStatus.NOT_FOUND,
        );
      }

      const txnData: TransactionHistoryDto = {
        event: normalizeEnumValue(
          WalletWebhookEventEnum.DepositSuccessful,
          WalletWebhookEventEnum,
        ),
        transactionId,
        transactionDirection: TransactionDirectionEnum.INBOUND,
        assetCode: assetCode as TokenEnum,
        amount,
        fee,
        blockchainTxId,
        reason,
        updatedAt: doneAt,
        walletId,
        walletName: walletName ?? '',
        paymentStatus: PaymentStatus.Complete,
        destinationAddress: deposit_address,
        paymentNetwork: payment_address.network,
        sourceAddress: payment_address.address,
        feeLevel: FeeLevel.HIGH,
        user: qwalletProfile.user,
        transactionType: TransactionTypeEnum.CRYPTO_DEPOSIT,
      };

      const transaction = await this.transactionHistoryService.create(
        txnData,
        qwalletProfile.user,
      );

      // Update wallet balance
      const latestWalletInfo = await this.qwalletService.getUserWallet(
        qwalletProfile.qid,
        assetCode,
      );
      await this.qwalletService.updateWalletTokenBalance(
        matchingWallet,
        assetCode,
        latestWalletInfo.data.balance,
      );

      await this.transactionService.createTransaction(
        {
          transactionType: TransactionTypeEnum.CRYPTO_DEPOSIT,
          fiatAmount: transaction.mainFiatAmount ?? 0,
          cryptoAmount: Number(transaction.amount) ?? 0,
          cryptoAsset: transaction.assetCode,
          paymentStatus: transaction.paymentStatus,
          paymentReason: transaction.paymentReason,
        },
        qwalletProfile.user,
      );

      // Notify the user
      const notification = await this.notificationGateway.createNotification({
        user: qwalletProfile.user,
        title: NotificationEventEnum.CRYPTO_DEPOSIT,
        message: NotificationEventEnum.CRYPTO_DEPOSIT,
        data: {
          amount,
          assetCode,
          txnID: transaction.id,
          walletID: walletId,
          transactionType: TransactionTypeEnum.CRYPTO_DEPOSIT,
          kind: NotificationKindEnum.Transaction,
        },
      });

      const {
        id,
        event,
        createdAt,
        transactionDirection,
        transactionType,
        feeLevel,
        user: _user,
      } = transaction;

      const tokens = await this.deviceService.getUserDeviceTokens(_user.id);

      await this.notificationGateway.emitNotificationToUser({
        tokens,
        event: WalletWebhookEventEnum.DepositSuccessful,
        status: NotificationStatusEnum.SUCCESS,
        data: {
          notification,
          transaction: {
            id,
            event,
            transactionId,
            transactionDirection,
            transactionType,
            assetCode,
            amount,
            fee,
            feeLevel,
            blockchainTxId,
            reason,
            paymentStatus: PaymentStatus.Complete,
            sourceAddress: payment_address.address,
            destinationAddress: deposit_address,
            paymentNetwork: payment_address.network,
            createdAt,
          },
        },
      });
    } catch (error) {
      this.logger.error('Error in handleDepositSuccessful', error);
    }
  }

  async handleWithdrawSuccessful(
    payload: QWalletWebhookPayloadDto,
  ): Promise<void> {
    try {
      const data = payload.data as IQWalletHookWithdrawSuccessfulEvent;
      const normalizedStatus = normalizeEnumValue(data.status, PaymentStatus);
      data.status = normalizedStatus;

      if (data.status !== PaymentStatus.Done) return;

      data.event = payload.event;
      data.done_at = toUTCDate(data.wallet.updated_at);

      const transaction =
        await this.transactionHistoryService.findOneTransactionDynamic(
          { transactionId: data.id },
          {
            selectFields: ['id', 'paymentStatus', 'transactionDirection'],
            joinRelations: [{ relation: 'user', selectFields: ['id'] }],
          },
        );

      if (!transaction) {
        return this.logger.error(QWalletStatus.TRANSACTION_NOT_FOUND);
      }

      if (transaction.paymentStatus === PaymentStatus.Done) {
        return this.logger.log(QWalletStatus.UNSUPPORTED_EVENT);
      }

      const qwalletProfile = await this.qwalletService.lookupSubAccountByQid(
        data.user.id,
      );
      if (!qwalletProfile) {
        throw new CustomHttpException(
          QWalletStatus.INVALID_USER,
          HttpStatus.BAD_REQUEST,
        );
      }

      const wallet = qwalletProfile.wallets.find(
        (w) =>
          w.networkMetadata[data.wallet.default_network]?.address ===
          data.wallet.deposit_address,
      );

      if (!wallet) {
        throw new CustomHttpException(
          WalletErrorEnum.GET_USER_WALLET_FAILED,
          HttpStatus.NOT_FOUND,
        );
      }

      const token = wallet.tokens.find((t) => t.assetCode === data.currency);

      if (!token) {
        throw new CustomHttpException(
          WalletErrorEnum.UNSUPPORTED_TOKEN,
          HttpStatus.BAD_REQUEST,
        );
      }

      const updatedTransaction =
        await this.transactionHistoryService.updateQWalletTransactionByTransactionId(
          data,
        );

      const latestWalletInfo = await this.qwalletService.getUserWallet(
        qwalletProfile.qid,
        data.currency,
      );

      await this.qwalletService.updateWalletTokenBalance(
        wallet,
        data.currency,
        latestWalletInfo.data.balance,
      );

      await this.transactionService.createTransaction(
        {
          transactionType: TransactionTypeEnum.CRYPTO_WITHDRAWAL,
          fiatAmount: Number(transaction.mainFiatAmount) ?? 0,
          cryptoAmount: Number(transaction.amount) ?? 0,
          cryptoAsset: transaction.assetCode,
          paymentStatus: transaction.paymentStatus,
          paymentReason: transaction.paymentReason,
        },
        qwalletProfile.user,
      );

      const notification = await this.notificationGateway.createNotification({
        user: qwalletProfile.user,
        title: NotificationEventEnum.CRYPTO_WITHDRAWAL,
        message: NotificationEventEnum.CRYPTO_WITHDRAWAL,
        data: {
          amount: data.amount,
          assetCode: data.currency,
          txnID: updatedTransaction.id,
          walletID: updatedTransaction.walletId,
          transactionType: TransactionTypeEnum.CRYPTO_DEPOSIT,
          kind: NotificationKindEnum.Transaction,
        },
      });

      const tokens = await this.deviceService.getUserDeviceTokens(
        updatedTransaction.user.id,
      );

      await this.notificationGateway.emitNotificationToUser({
        tokens,
        event: WalletWebhookEventEnum.WithdrawalSuccessful,
        status: NotificationStatusEnum.SUCCESS,
        data: {
          notification,
          transaction: {
            id: updatedTransaction.id,
            event: payload.event,
            transactionId: updatedTransaction.transactionId,
            transactionDirection: TransactionDirectionEnum.OUTBOUND,
            transactionType: TransactionTypeEnum.CRYPTO_WITHDRAWAL,
            assetCode: data.currency,
            amount: data.amount,
            fee: data.fee,
            feeLevel: FeeLevel.HIGH,
            blockchainTxId: data.txid,
            reason: data.reason,
            paymentStatus: PaymentStatus.Complete,
            sourceAddress: updatedTransaction.sourceAddress,
            destinationAddress: data.recipient.details.address,
            paymentNetwork: updatedTransaction.paymentNetwork,
            createdAt: updatedTransaction.createdAt,
          },
        },
      });
    } catch (error) {
      this.logger.error('Withdrawal processing failed:', error);
    }
  }

  handleDepositOnHold(payload: any) {
    return { message: 'Deposit on hold', payload };
  }

  handleDepositFailedAml(payload: any) {
    return { message: 'Deposit failed AML check', payload };
  }

  handleDepositRejected(payload: any) {
    return { message: 'Deposit rejected', payload };
  }

  handleWithdrawRejected(payload: any) {
    return { message: 'Withdraw rejected', payload };
  }

  handleOrderDone(payload: any) {
    return { message: 'Order completed', payload };
  }

  handleOrderCancelled(payload: any) {
    return { message: 'Order cancelled', payload };
  }

  handleSwapCompleted(payload: any) {
    return { message: 'Swap completed', payload };
  }

  handleSwapReversed(payload: any) {
    return { message: 'Swap reversed', payload };
  }

  handleSwapFailed(payload: any) {
    return { message: 'Swap failed', payload };
  }
}
