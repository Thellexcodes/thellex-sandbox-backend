import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CwalletHookDto } from './dto/create-cwallet-hook.dto';
import {
  WalletErrorEnum,
  WalletWebhookEventEnum,
} from '@/models/wallet-manager.types';
import {
  TransactionDirectionEnum,
  PaymentStatus,
  TransactionTypeEnum,
} from '@/models/payment.types';
import { normalizeEnumValue, toUTCDate } from '@/utils/helpers';
import { CustomHttpException } from '@/middleware/custom.http.exception';
import { TokenEnum } from '@/config/settings';
import { TransactionHistoryService } from '@/modules/transaction-history/transaction-history.service';
import { TransactionHistoryDto } from '@/modules/transaction-history/dto/create-transaction-history.dto';
import { CwalletService } from '@/modules/wallets/cwallet/cwallet.service';
import { QWalletStatus } from '@/modules/wallets/qwallet/qwallet-status.enum';
import {
  NotificationEventEnum,
  NotificationStatusEnum,
} from '@/models/notifications.enum';
import { NotificationsGateway } from '@/modules/notifications/notifications.gateway';
import { NotificationKindEnum } from '@/utils/typeorm/entities/notification.entity';
import { TransactionsService } from '@/modules/transactions/transactions.service';
import { DevicesService } from '@/modules/devices/devices.service';

//TODO: handle errors with enums
//TODO: update all date in system to UTC
@Injectable()
export class CwalletHooksService {
  private readonly logger = new Logger(CwalletHooksService.name);

  constructor(
    private readonly transactionHistoryServie: TransactionHistoryService,
    private readonly cwalletService: CwalletService,
    private readonly notificationGateway: NotificationsGateway,
    private readonly transactionService: TransactionsService,
    private readonly deviceService: DevicesService,
  ) {}

  async handleDepositSuccessful(payload: CwalletHookDto) {
    try {
      const txnID = payload.notification.id;
      const txnState = payload.notification.state;
      const notificationPayload = payload.notification;

      const normalizedState = normalizeEnumValue(txnState, PaymentStatus);

      //handle complete deposit
      if (normalizedState === PaymentStatus.Complete) {
        const wallet = await this.cwalletService.lookupSubWallet(
          notificationPayload.destinationAddress,
        );

        if (!wallet) {
          throw new CustomHttpException(
            WalletErrorEnum.GET_USER_WALLET_FAILED,
            HttpStatus.NOT_FOUND,
          );
        }

        const userProfile = wallet.profile.user;

        const transactionHistoryExists =
          await this.transactionHistoryServie.findTransactionByTransactionId(
            txnID,
          );

        if (transactionHistoryExists)
          throw new CustomHttpException(
            QWalletStatus.TRANSACTION_FOUND,
            HttpStatus.CONFLICT,
          );

        const txnToken = await this.cwalletService.getToken({
          id: notificationPayload.tokenId,
        });

        const assetCode =
          txnToken.data.token.symbol.toLocaleLowerCase() as TokenEnum;

        const txnData: TransactionHistoryDto = {
          event: WalletWebhookEventEnum.DepositSuccessful,
          transactionId: txnID,
          transactionDirection: TransactionDirectionEnum.INBOUND,
          assetCode,
          amount: notificationPayload.amounts[0],
          fee: notificationPayload.networkFee,
          blockchainTxId: notificationPayload.txHash,
          updatedAt: toUTCDate(notificationPayload.updateDate),
          walletId: notificationPayload.walletId,
          sourceAddress: notificationPayload.sourceAddress,
          destinationAddress: notificationPayload.destinationAddress,
          paymentNetwork: notificationPayload.blockchain,
          user: userProfile,
          paymentStatus: PaymentStatus.Accepted,
          transactionType: TransactionTypeEnum.CRYPTO_DEPOSIT,
        };

        const { user, ...transaction } =
          await this.transactionHistoryServie.create(txnData, userProfile);

        const latestWalletBalance =
          await this.cwalletService.getBalanceByAddress(
            notificationPayload.walletId,
            assetCode as TokenEnum,
          );

        await this.transactionService.createTransaction({
          transactionType: TransactionTypeEnum.CRYPTO_DEPOSIT,
          cryptoAmount: transaction.mainAssetAmount ?? 0,
          cryptoAsset: transaction.assetCode,
          paymentStatus: transaction.paymentStatus,
          paymentReason: transaction.paymentReason,
          fiatAmount: transaction.mainFiatAmount ?? 0,
        });

        await this.cwalletService.updateWalletTokenBalance(
          wallet,
          assetCode,
          latestWalletBalance.toString(),
        );

        const notification = await this.notificationGateway.createNotification({
          user,
          title: NotificationEventEnum.CRYPTO_DEPOSIT,
          message: NotificationEventEnum.CRYPTO_DEPOSIT,
          data: {
            amount: notificationPayload.amounts[0],
            assetCode,
            txnID: transaction.id,
            walletID: notificationPayload.walletId,
            transactionType: TransactionTypeEnum.CRYPTO_DEPOSIT,
            kind: NotificationKindEnum.Transaction,
          },
        });

        const tokens = await this.deviceService.getUserDeviceTokens(user.id);

        await this.notificationGateway.emitNotificationToUser({
          event: WalletWebhookEventEnum.DepositSuccessful,
          status: NotificationStatusEnum.SUCCESS,
          data: {
            notification,
            transaction,
          },
          tokens,
        });
      }
    } catch (error) {
      if (error instanceof CustomHttpException) {
        throw error;
      }

      // For unexpected errors, log and throw a generic exception
      console.error('Unexpected error in service:', error);

      throw new CustomHttpException(
        QWalletStatus.UNEXPECTED_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async handleWithdrawSuccessful(payload: CwalletHookDto) {
    try {
      const txnID = payload.notification.id;
      const txnState = payload.notification.state;
      const notificationPayload = payload.notification;

      const normalizedState = normalizeEnumValue(txnState, PaymentStatus);

      // Handle complete withdrawal
      if (normalizedState === PaymentStatus.Complete) {
        const wallet = await this.cwalletService.lookupSubWallet(
          notificationPayload.sourceAddress,
        );

        if (!wallet) {
          throw new CustomHttpException(
            WalletErrorEnum.GET_USER_WALLET_FAILED,
            HttpStatus.NOT_FOUND,
          );
        }

        const transaction =
          await this.transactionHistoryServie.findTransactionByTransactionId(
            txnID,
          );

        if (
          !transaction ||
          transaction.transactionDirection !== TransactionDirectionEnum.OUTBOUND
        ) {
          throw new CustomHttpException(
            QWalletStatus.TRANSACTION_NOT_FOUND,
            HttpStatus.NOT_FOUND,
          );
        }

        if (transaction.paymentStatus === PaymentStatus.Complete) {
          throw new CustomHttpException(
            QWalletStatus.TRANSACTION_ALREADY_PROCESSED,
            HttpStatus.CONFLICT,
          );
        }

        // Update transaction
        const updatedTxn =
          await this.transactionHistoryServie.updateCwalletTransaction({
            transactionId: txnID,
            updates: {
              event: WalletWebhookEventEnum.WithdrawalSuccessful,
              blockchainTxId: notificationPayload.txHash,
              updatedAt: toUTCDate(notificationPayload.updateDate),
              paymentStatus: PaymentStatus.Complete,
            },
          });

        const txnToken = await this.cwalletService.getToken({
          id: notificationPayload.tokenId,
        });

        const updatedAssetCode = txnToken.data.token.symbol.toLowerCase();

        const latestWalletBalance =
          await this.cwalletService.getBalanceByAddress(
            notificationPayload.walletId,
            updatedAssetCode as TokenEnum,
          );

        await this.transactionService.createTransaction({
          transactionType: TransactionTypeEnum.CRYPTO_WITHDRAWAL,
          cryptoAmount: updatedTxn.mainAssetAmount ?? 0,
          cryptoAsset: updatedTxn.assetCode,
          paymentStatus: updatedTxn.paymentStatus,
          paymentReason: updatedTxn.paymentReason,
          fiatAmount: updatedTxn.mainFiatAmount ?? 0,
        });

        await this.cwalletService.updateWalletTokenBalance(
          wallet,
          updatedAssetCode,
          latestWalletBalance.toString(),
        );

        const notification = await this.notificationGateway.createNotification({
          user: updatedTxn.user,
          title: NotificationEventEnum.CRYPTO_WITHDRAWAL,
          message: NotificationEventEnum.CRYPTO_WITHDRAWAL,
          data: {
            amount: updatedTxn.amount,
            assetCode: updatedTxn.assetCode,
            txnID: updatedTxn.transactionId,
            walletID: updatedTxn.walletId,
            transactionType: TransactionTypeEnum.CRYPTO_WITHDRAWAL,
            kind: NotificationKindEnum.Transaction,
          },
        });

        const tokens = await this.deviceService.getUserDeviceTokens(
          transaction.user.id,
        );

        await this.notificationGateway.emitNotificationToUser({
          tokens,
          event: WalletWebhookEventEnum.WithdrawalSuccessful,
          status: NotificationStatusEnum.SUCCESS,
          data: {
            notification,
            transaction: {
              id: updatedTxn.id,
              event: updatedTxn.event,
              transactionId: updatedTxn.transactionId,
              transactionDirection: updatedTxn.transactionDirection,
              transactionType: updatedTxn.transactionType,
              assetCode: updatedTxn.assetCode,
              amount: updatedTxn.amount,
              fee: updatedTxn.fee,
              feeLevel: updatedTxn.feeLevel,
              blockchainTxId: updatedTxn.blockchainTxId,
              reason: updatedTxn.reason,
              paymentStatus: updatedTxn.paymentStatus,
              sourceAddress: updatedTxn.sourceAddress,
              destinationAddress: updatedTxn.destinationAddress,
              paymentNetwork: updatedTxn.paymentNetwork,
              createdAt: updatedTxn.createdAt,
            },
          },
        });
      }
    } catch (error) {
      if (error instanceof CustomHttpException) {
        throw error;
      }

      console.error('Unexpected error in withdraw service:', error);

      throw new CustomHttpException(
        QWalletStatus.UNEXPECTED_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
