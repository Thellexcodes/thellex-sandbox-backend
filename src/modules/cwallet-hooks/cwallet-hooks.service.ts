import { Injectable } from '@nestjs/common';
import { CwalletHookDto } from './dto/create-cwallet-hook.dto';
import { TransactionHistoryService } from '../transaction-history/transaction-history.service';
import { WalletWebhookEventType } from '@/types/wallet-manager.types';
import { PaymentStatus } from '@/types/payment.types';
import { toUTCDate } from '@/utils/helpers';

//TODO: handle errors with enums
//TODO: update all date in system to UTC
@Injectable()
export class CwalletHooksService {
  constructor(private transactionHistoryServie: TransactionHistoryService) {}

  async handleDepositSuccessful(payload: CwalletHookDto) {}

  async handleWithdrawSuccessful(payload: CwalletHookDto) {
    const id = payload.notification.id;
    const txnState = payload.notification.state;
    const notification = payload.notification;

    if (txnState === PaymentStatus.Confirmed.toLocaleUpperCase()) {
      const transaction =
        await this.transactionHistoryServie.findTransactionByTransactionId(id);

      if (
        !transaction ||
        transaction.type !== PaymentStatus.Outbound ||
        transaction.event === WalletWebhookEventType.DepositSuccessful
      )
        return;

      await this.transactionHistoryServie.updateCwalletTransaction({
        transactionId: id,
        updates: {
          paymentStatus: PaymentStatus.Confirmed,
          event: WalletWebhookEventType.DepositSuccessful,
          blockchainTxId: notification.txHash,
          updatedAt: toUTCDate(notification.updateDate),
        },
      });
    }
  }
}
