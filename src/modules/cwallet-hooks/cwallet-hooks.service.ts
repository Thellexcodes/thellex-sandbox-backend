import { Injectable } from '@nestjs/common';
import { CwalletHookDto } from './dto/create-cwallet-hook.dto';
import { TransactionHistoryService } from '../transaction-history/transaction-history.service';
import { WalletWebhookEventType } from '@/types/wallet-manager.types';
import { PaymentStatus, PaymentType } from '@/types/payment.types';
import { toUTCDate } from '@/utils/helpers';
import { TransactionHistoryDto } from '../transaction-history/dto/create-transaction-history.dto';
import { CwalletService } from '../cwallet/cwallet.service';

//TODO: handle errors with enums
//TODO: update all date in system to UTC
@Injectable()
export class CwalletHooksService {
  constructor(
    private readonly transactionHistoryServie: TransactionHistoryService,
    private readonly cwalletService: CwalletService,
  ) {}

  // async handleDepositSuccessful(payload: CwalletHookDto) {
  //   const id = payload.notification.id;
  //   const txnState = payload.notification.state;
  //   const notificationPayload = payload.notification;
  //   if (txnState === PaymentStatus.Confirmed.toLocaleUpperCase()) {
  //     const wallet = await this.cwalletService.lookupSubWallet(
  //       notificationPayload.destinationAddress,
  //     );

  //     const user = wallet.profile.user;

  //     const transaction =
  //       await this.transactionHistoryServie.findTransactionByTransactionId(id);

  //     if (transaction) return;

  //     const transactionHistory: TransactionHistoryDto = {
  //       transactionId: id,
  //       type: PaymentType.INBOUND,
  //       currency: '', //TODO: get token from txnHash
  //       amount: notificationPayload.amounts[0],
  //       fee: notificationPayload.networkFee,
  //       blockchainTxId: notificationPayload.txHash,
  //       createdAt: undefined,
  //       updatedAt: undefined,
  //       walletId: '',
  //       sourceAddress: notificationPayload.sourceAddress,
  //       destinationAddress: notificationPayload.destinationAddress,
  //       paymentNetwork: '',
  //       user,
  //     };

  //     await this.transactionHistoryServie.create(transactionHistory, user);

  //     //[x] create notification and alert user
  //     // const notification =
  //     //   await this.qwalletNotificationService.createNotification({
  //     //     user,
  //     //     data,
  //     //     title: NotificationsEnum.CRYPTO_DEPOSIT_SUCCESSFUL,
  //     //     message: NotificationMessageEnum.CRYPTO_DEPOSIT_SUCCESSFUL,
  //     //   });

  //     // await this.notificationsGateway.emitDepositSuccessfulToUser(
  //     //   user.alertID,
  //     //   { transaction, notification },
  //     // );
  //   }
  // }

  // async handleWithdrawSuccessful(payload: CwalletHookDto) {
  //   const id = payload.notification.id;
  //   const txnState = payload.notification.state;
  //   const notification = payload.notification;

  //   if (txnState === PaymentStatus.Confirmed.toLocaleUpperCase()) {
  //     const transaction =
  //       await this.transactionHistoryServie.findTransactionByTransactionId(id);

  //     if (
  //       !transaction ||
  //       transaction.type !== PaymentStatus.Outbound ||
  //       transaction.event === WalletWebhookEventType.DepositSuccessful
  //     )
  //       return;

  //     await this.transactionHistoryServie.updateCwalletTransaction({
  //       transactionId: id,
  //       updates: {
  //         paymentStatus: PaymentStatus.Confirmed,
  //         event: WalletWebhookEventType.DepositSuccessful,
  //         blockchainTxId: notification.txHash,
  //         updatedAt: toUTCDate(notification.updateDate),
  //       },
  //     });
  //   }
  // }
}
