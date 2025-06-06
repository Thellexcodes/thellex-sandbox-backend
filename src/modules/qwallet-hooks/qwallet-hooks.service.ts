import { HttpStatus, Injectable } from '@nestjs/common';
import {
  QWalletDepositSuccessfulPayloadDto,
  QwalletHookDepositSuccessfulDataDto,
} from './dto/qwallet-hook-depositSuccessful.dto';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { CustomHttpException } from '@/middleware/custom.http.exception';
import { QWalletWebhookEnum } from '@/types/qwallet-webhook.enum';
import { QwalletNotificationsService } from '../notifications/qwallet-notifications.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { TransactionHistoryService } from '../transaction-history/transaction-history.service';
import { CreateTransactionHistoryDto } from '../transaction-history/dto/create-transaction-history.dto';
import { TransactionHistoryEntity } from '@/utils/typeorm/entities/transaction-history.entity';

@Injectable()
export class QwalletHooksService {
  constructor(
    private readonly qwalletNotificationService: QwalletNotificationsService,
    private readonly notificationsGateway: NotificationsGateway,
    private readonly transactionHistoryService: TransactionHistoryService,
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
    payload: QWalletDepositSuccessfulPayloadDto,
    user: UserEntity,
  ): Promise<void> {
    try {
      const payloadUser = payload.data.user;
      const qwallet = user.qwallet;

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

      if (!existingTxnHistory) {
        const transactionHistoryDto: CreateTransactionHistoryDto = {
          event: QWalletWebhookEnum.DEPOSIT_SUCCESSFUL,
          transactionId: payload.data.id,
          type: payload.data.type,
          currency: payload.data.currency,
          amount: payload.data.amount,
          fee: payload.data.fee,
          blockchainTxId: payload.data.txid,
          status: payload.data.status,
          reason: payload.data.reason,
          createdAt: payload.data.created_at,
          doneAt: payload.data.done_at,
          walletId: payload.data.wallet.id,
          walletName: payload.data.wallet.name,
          walletCurrency: payload.data.wallet.currency,
          paymentStatus: payload.data.payment_transaction.status,
          paymentAddress: payload.data.payment_address.address,
          paymentNetwork: payload.data.payment_address.network,
        };

        const transaction =
          await this.transactionHistoryService.createDepositTransactionRecord(
            transactionHistoryDto,
            user,
          );

        const notification =
          await this.qwalletNotificationService.createDepositSuccessfulNotification(
            payload,
            user,
          );

        await this.notificationsGateway.emitDepositSuccessfulToUser(
          user.alertID,
          { transaction, notification },
        );
      }
    } catch (error) {
      console.error(error);
      // throw new CustomHttpException(
      //   QWalletWebhookEnum.DER,
      //   HttpStatus.INTERNAL_SERVER_ERROR,
      // );
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

  handleWithdrawSuccessful(payload: any) {
    return { message: 'Withdraw successful', payload };
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
