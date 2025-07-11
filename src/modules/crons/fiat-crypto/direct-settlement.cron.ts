import { PaymentStatus, TransactionTypeEnum } from '@/models/payment.types';
import { PaymentsService } from '@/modules/payments/payments.service';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class DirectSettlementCron {
  private readonly logger = new Logger(DirectSettlementCron.name);

  constructor(private readonly paymentService: PaymentsService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async processDirectSettlements() {
    this.logger.log('🔁 Checking direct settlements...');

    const txns = await this.paymentService.findAllDirectSettlementTransactions({
      directSettlement: true,
      paymentStatus: PaymentStatus.Processing,
      transactionType: TransactionTypeEnum.FIAT_TO_CRYPTO_DEPOSIT,
    });

    for (const txn of txns) {
      try {
        this.logger.log(`⚡ Directly settling txn ${txn.id}`);
        const result = await this.paymentService.payout({
          userId: txn.userId,
          amount: txn.userAmount,
          currency: txn.fiatCode,
          recipientInfo: txn.recipientInfo,
        });

        // txn.status = result.success ? 'COMPLETED' : 'FAILED';
        // txn.settlementTxHash = result.txHash ?? null;
        // await this.txnRepo.save(txn);
      } catch (err) {
        this.logger.error(`Failed to settle txn ${txn.id}`, err.stack);
      }
    }
  }
}
