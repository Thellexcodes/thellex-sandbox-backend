import { HttpStatus, Injectable } from '@nestjs/common';
import { CustomHttpException } from '@/middleware/custom.http.exception';
import { QWalletWebhookPayloadDto } from './dto/qwallet-hook.dto';
import { IQwalletHookDepositSuccessfulData } from './dto/qwallet-hook-depositSuccessful.dto';
import { IQWalletHookWithdrawSuccessfulEvent } from './dto/qwallet-hook-withdrawSuccessful.dto';
import {
  NotificationMessageEnum,
  NotificationsEnum,
} from '@/models/notifications.enum';
import {
  FeeLevel,
  WalletErrorEnum,
  WalletWebhookEventEnum,
} from '@/models/wallet-manager.types';
import { toUTCDate } from '@/utils/helpers';
import { TRANSACTION_NOTIFICATION_TYPES_ENUM } from '@/models/socket.enums';
import { PaymentStatus, PaymentType } from '@/models/payment.types';
import { IQWalletAddressGenerated } from './dto/qwallet-hook-walletUpdated.dto';
import { QwalletService } from '../../qwallet/qwallet.service';
import { NotificationsGateway } from '@/modules/notifications/notifications.gateway';
import { TransactionHistoryService } from '@/modules/transaction-history/transaction-history.service';
import { WalletNotificationsService } from '@/modules/notifications/wallet-notifications.service';
import { QWalletStatus } from '../../qwallet/qwallet-status.enum';
import { TransactionHistoryDto } from '@/modules/transaction-history/dto/create-transaction-history.dto';

//TODO: handle errors with enum
//TODO: Update logger
@Injectable()
export class QwalletHooksService {
  constructor(
    private readonly qwalletService: QwalletService,
    private readonly notificationsGateway: NotificationsGateway,
    private readonly transactionHistoryService: TransactionHistoryService,
    private readonly walletNotficationsService: WalletNotificationsService,
  ) {}

  async handleWalletUpdated(payload: QWalletWebhookPayloadDto): Promise<void> {
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

    await this.qwalletService.updateWalletAddress({
      id: wallet.id,
      networkMetadata: updatedNetworkMetadata,
    });
  }

  handleWalletAddressGenerated(payload: any) {
    return { message: 'Wallet address generated', payload };
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

      data.event = payload.event;
      data.done_at = toUTCDate(data.wallet.updated_at);

      const transactionExists =
        await this.transactionHistoryService.findTransactionByTransactionId(
          data.id,
        );

      if (transactionExists) {
        throw new CustomHttpException(
          QWalletStatus.TRANSACTION_FOUND,
          HttpStatus.CONFLICT,
        );
      }

      const qwalletProfile = await this.qwalletService.lookupSubAccountByQid(
        data.user.id,
      );

      if (!qwalletProfile)
        throw new CustomHttpException(
          QWalletStatus.INVALID_USER,
          HttpStatus.BAD_REQUEST,
        );

      const wallet = qwalletProfile.wallets.find(
        (w) =>
          w.networkMetadata[data.wallet.default_network].address ===
          data.wallet.deposit_address,
      );

      if (!wallet) {
        throw new CustomHttpException(
          WalletErrorEnum.GET_USER_WALLET_FAILED,
          HttpStatus.NOT_FOUND,
        );
      }

      const user = qwalletProfile.user;

      const txnData: TransactionHistoryDto = {
        event: WalletWebhookEventEnum.DepositSuccessful,
        transactionId: data.id,
        type: PaymentType.INBOUND,
        assetCode: data.currency,
        amount: data.amount,
        fee: data.fee,
        blockchainTxId: data.txid,
        reason: data.reason,
        updatedAt: data.done_at,
        walletId: data.wallet.id,
        walletName: data.wallet.name ?? transactionExists.walletName,
        paymentStatus: data.status,
        destinationAddress: data.wallet.deposit_address,
        paymentNetwork: data.payment_address.network,
        sourceAddress: data.payment_address.address,
        feeLevel: FeeLevel.HIGH,
        user,
      };

      const transaction = await this.transactionHistoryService.create(
        txnData,
        user,
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

      const notification =
        await this.walletNotficationsService.createNotification({
          user,
          data: {
            amount: data.amount,
            assetCode: data.currency,
            txnID: transaction.id,
            walletID: data.wallet.id,
          },
          title: NotificationsEnum.CRYPTO_DEPOSIT_SUCCESSFUL,
          message: NotificationMessageEnum.CRYPTO_DEPOSIT_SUCCESSFUL,
        });

      await this.notificationsGateway.emitTransactionNotificationToUser(
        qwalletProfile.user.alertID,
        TRANSACTION_NOTIFICATION_TYPES_ENUM.Deposit,
        { transaction, notification },
      );
    } catch (error) {
      console.error(error);
    }
  }

  async handleWithdrawSuccessful(
    payload: QWalletWebhookPayloadDto,
  ): Promise<void> {
    try {
      const data = payload.data as IQWalletHookWithdrawSuccessfulEvent;
      if (data.status !== PaymentStatus.Done) return;

      data.event = payload.event;
      data.done_at = toUTCDate(data.wallet.updated_at);

      const transactionExists =
        await this.transactionHistoryService.findTransactionByTransactionId(
          data.id,
        );

      if (!transactionExists) {
        throw new CustomHttpException(
          QWalletStatus.TRANSACTION_NOT_FOUND,
          HttpStatus.CONFLICT,
        );
      }

      if (transactionExists.paymentStatus === PaymentStatus.Done)
        throw new CustomHttpException(
          QWalletStatus.DEPOSIT_REJECTED,
          HttpStatus.CONFLICT,
        );

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
          w.networkMetadata[data.wallet.default_network].address ===
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

      const transaction =
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

      const notification =
        await this.walletNotficationsService.createNotification({
          user: qwalletProfile.user,
          data: {
            amount: data.amount,
            assetCode: data.currency,
            txnID: transaction.id,
            walletID: data.wallet.id,
          },
          title: NotificationsEnum.CRYPTO_WITHDRAWAL_SUCCESSFUL,
          message: NotificationMessageEnum.CRYPTO_WITHDRAW_SUCCESSFUL,
        });

      await this.notificationsGateway.emitTransactionNotificationToUser(
        qwalletProfile.user.alertID,
        TRANSACTION_NOTIFICATION_TYPES_ENUM.Withdrawal,
        { transaction, notification },
      );
    } catch (error) {
      console.error('Withdrawal processing failed:', error);
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
