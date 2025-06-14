import { HttpStatus, Injectable } from '@nestjs/common';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { CustomHttpException } from '@/middleware/custom.http.exception';
import { QWalletWebhookEnum } from '@/types/qwallet-webhook.enum';
import { QwalletNotificationsService } from '../notifications/qwallet-notifications.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { TransactionHistoryService } from '../transaction-history/transaction-history.service';
import { TransactionHistoryDto } from '../transaction-history/dto/create-transaction-history.dto';
import { QWalletWebhookPayloadDto } from './dto/qwallet-hook.dto';
import { IQwalletHookDepositSuccessfulData } from './dto/qwallet-hook-depositSuccessful.dto';
import { IQWalletHookWithdrawSuccessfulEvent } from './dto/qwallet-hook-withdrawSuccessful.dto';
import {
  NotificationMessageEnum,
  NotificationsEnum,
} from '@/types/notifications.enum';
import { WalletWebhookEventType } from '@/types/wallet-manager.types';

//TODO: handle errors with enum
@Injectable()
export class QwalletHooksService {
  constructor(
    private readonly notificationsGateway: NotificationsGateway,
    private readonly transactionHistoryService: TransactionHistoryService,
    private readonly qwalletNotificationService: QwalletNotificationsService,
  ) {}

  handleWalletUpdated(payload: any) {
    return { message: 'Wallet updated event received', payload };
  }

  handleWalletAddressGenerated(payload: any) {
    return { message: 'Wallet address generated', payload };
  }

  handleDepositConfirmation(payload: any) {
    return { message: 'Deposit confirmation received', payload };
  }

  async handleDepositSuccessful(
    payload: QWalletWebhookPayloadDto,
    user: UserEntity,
  ): Promise<void> {
    try {
      const data = payload.data as IQwalletHookDepositSuccessfulData;
      const payloadUser = data.user;
      const qwallet = user.qWalletProfile;

      if (payloadUser.sn !== qwallet.qsn) {
        throw new CustomHttpException(
          QWalletWebhookEnum.INVALID_USER,
          HttpStatus.BAD_REQUEST,
        );
      }

      const existingTxnHistory =
        await this.transactionHistoryService.findTransactionByTransactionId(
          payload.data.id,
        );

      if (existingTxnHistory)
        throw new CustomHttpException(
          QWalletWebhookEnum.TRANSACTION_FOUND,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );

      //[x] Update source and destination address
      const txnData: TransactionHistoryDto = {
        event: WalletWebhookEventType.DepositSuccessful,
        transactionId: data.id,
        type: data.type,
        currency: data.currency,
        amount: data.amount,
        fee: data.fee,
        blockchainTxId: data.txid,
        reason: data.reason,
        createdAt: data.created_at,
        updatedAt: data.done_at,
        walletId: data.wallet.id,
        walletName: data.wallet.name ?? existingTxnHistory.walletName,
        paymentStatus: data.payment_transaction.status,
        destinationAddress: data.payment_address.address,
        paymentNetwork: data.payment_address.network,
        sourceAddress: data.payment_address.address,
        feeLevel: 'HIGH',
        user,
      };

      const transaction = await this.transactionHistoryService.create(
        txnData,
        user,
      );

      const notification =
        await this.qwalletNotificationService.createNotification({
          user,
          data,
          title: NotificationsEnum.CRYPTO_DEPOSIT_SUCCESSFUL,
          message: NotificationMessageEnum.CRYPTO_DEPOSIT_SUCCESSFUL,
        });

      await this.notificationsGateway.emitDepositSuccessfulToUser(
        user.alertID,
        { transaction, notification },
      );
    } catch (error) {
      console.error(error);
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

  async handleWithdrawSuccessful(
    payload: QWalletWebhookPayloadDto,
    user: UserEntity,
  ): Promise<void> {
    const data = payload.data as IQWalletHookWithdrawSuccessfulEvent;
    const payloadUser = data.user;
    const qwallet = user.qWalletProfile;

    if (payloadUser.sn !== qwallet.qsn) {
      throw new CustomHttpException(
        QWalletWebhookEnum.INVALID_USER,
        HttpStatus.BAD_REQUEST,
      );
    }

    const transaction =
      await this.transactionHistoryService.updateTransactionByTransactionId(
        data,
      );

    const notification =
      await this.qwalletNotificationService.createNotification({
        user,
        data,
        title: NotificationsEnum.CRYPTO_WITHDRAWAL_SUCCESSFUL,
        message: NotificationMessageEnum.CRYPTO_WITHDRAW_SUCCESSFUL,
      });

    await this.notificationsGateway.emitDepositSuccessfulToUser(user.alertID, {
      transaction,
      notification,
    });
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
