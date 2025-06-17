import { HttpStatus, Injectable } from '@nestjs/common';
import { CwalletHookDto } from './dto/create-cwallet-hook.dto';
import { TransactionHistoryService } from '../transaction-history/transaction-history.service';
import {
  WalletErrorEnum,
  WalletWebhookEventEnum,
} from '@/types/wallet-manager.types';
import { PaymentStatus, PaymentType } from '@/types/payment.types';
import { toUTCDate } from '@/utils/helpers';
import { TransactionHistoryDto } from '../transaction-history/dto/create-transaction-history.dto';
import { CwalletService } from '../cwallet/cwallet.service';
import { WalletNotificationsService } from '../notifications/wallet-notifications.service';
import {
  NotificationMessageEnum,
  NotificationsEnum,
} from '@/types/notifications.enum';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { TRANSACTION_NOTIFICATION_TYPES_ENUM } from '@/types/socket.enums';
import { CustomHttpException } from '@/middleware/custom.http.exception';
import { QWalletStatus } from '../qwallet/qwallet-status.enum';
import { TokenEnum } from '@/config/settings';

//TODO: handle errors with enums
//TODO: update all date in system to UTC
@Injectable()
export class CwalletHooksService {
  constructor(
    private readonly transactionHistoryServie: TransactionHistoryService,
    private readonly cwalletService: CwalletService,
    private readonly walletNotficationsService: WalletNotificationsService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async handleDepositSuccessful(payload: CwalletHookDto) {
    try {
      const txnID = payload.notification.id;
      const txnState = payload.notification.state;
      const notificationPayload = payload.notification;

      if (txnState === PaymentStatus.Confirmed.toLocaleUpperCase()) {
        const wallet = await this.cwalletService.lookupSubWallet(
          notificationPayload.destinationAddress,
        );

        if (!wallet) {
          throw new CustomHttpException(
            WalletErrorEnum.GET_USER_WALLET_FAILED,
            HttpStatus.NOT_FOUND,
          );
        }

        const user = wallet.profile.user;

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

        const assetCode = txnToken.data.token.symbol.toLocaleLowerCase();

        const txnData: TransactionHistoryDto = {
          event: WalletWebhookEventEnum.DepositSuccessful,
          transactionId: txnID,
          type: PaymentType.INBOUND,
          assetCode,
          amount: notificationPayload.amounts[0],
          fee: notificationPayload.networkFee,
          blockchainTxId: notificationPayload.txHash,
          updatedAt: toUTCDate(notificationPayload.updateDate),
          walletId: notificationPayload.walletId,
          sourceAddress: notificationPayload.sourceAddress,
          destinationAddress: notificationPayload.destinationAddress,
          paymentNetwork: notificationPayload.blockchain,
          user,
          paymentStatus: PaymentStatus.Accepted,
        };

        const transaction = await this.transactionHistoryServie.create(
          txnData,
          user,
        );

        const latestWalletBalance =
          await this.cwalletService.getBalanceByAddress(
            notificationPayload.walletId,
            assetCode as TokenEnum,
          );

        await this.cwalletService.updateWalletTokenBalance(
          wallet,
          assetCode,
          latestWalletBalance.toString(),
        );

        const notification =
          await this.walletNotficationsService.createNotification({
            user,
            title: NotificationsEnum.CRYPTO_DEPOSIT_SUCCESSFUL,
            message: NotificationMessageEnum.CRYPTO_DEPOSIT_SUCCESSFUL,
            data: {
              amount: notificationPayload.amounts[0],
              assetCode,
              txID: transaction.id,
              walletID: notificationPayload.walletId,
            },
          });

        await this.notificationsGateway.emitTransactionNotificationToUser(
          user.alertID,
          TRANSACTION_NOTIFICATION_TYPES_ENUM.Deposit,
          { transaction, notification },
        );
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

      if (txnState === PaymentStatus.Confirmed.toLocaleUpperCase()) {
        const wallet = await this.cwalletService.lookupSubWallet(
          notificationPayload.destinationAddress,
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
          transaction.type !== PaymentType.OUTBOUND ||
          transaction.event === WalletWebhookEventEnum.DepositSuccessful
        ) {
          throw new CustomHttpException(
            QWalletStatus.TRANSACTION_NOT_FOUND,
            HttpStatus.NOT_FOUND,
          );
        }

        // Update transaction to reflect successful withdrawal
        await this.transactionHistoryServie.updateCwalletTransaction({
          transactionId: txnID,
          updates: {
            paymentStatus: PaymentStatus.Confirmed,
            event: WalletWebhookEventEnum.WithdrawalSuccessful,
            blockchainTxId: notificationPayload.txHash,
            updatedAt: toUTCDate(notificationPayload.updateDate),
          },
        });

        const user = transaction.user;

        const txnToken = await this.cwalletService.getToken({
          id: notificationPayload.tokenId,
        });

        const assetCode = txnToken.data.token.symbol.toLocaleLowerCase();

        const latestWalletBalance =
          await this.cwalletService.getBalanceByAddress(
            notificationPayload.walletId,
            assetCode as TokenEnum,
          );

        await this.cwalletService.updateWalletTokenBalance(
          wallet,
          assetCode,
          latestWalletBalance.toString(),
        );

        // Send notification
        const notification =
          await this.walletNotficationsService.createNotification({
            user,
            title: NotificationsEnum.CRYPTO_WITHDRAWAL_SUCCESSFUL,
            message: NotificationMessageEnum.CRYPTO_WITHDRAW_SUCCESSFUL,
            data: {
              amount: transaction.amount,
              assetCode: transaction.assetCode,
              txID: transaction.transactionId,
              walletID: transaction.walletId,
            },
          });

        await this.notificationsGateway.emitTransactionNotificationToUser(
          user.alertID,
          TRANSACTION_NOTIFICATION_TYPES_ENUM.Withdrawal,
          { transaction, notification },
        );
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
