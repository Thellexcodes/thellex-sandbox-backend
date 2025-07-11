import { PaymentsService } from '@/modules/payments/payments.service';
import { Injectable, Logger } from '@nestjs/common';
import { CronExpression } from '@nestjs/schedule';

@Injectable()
export class NonDirectSettlementCron {
  private readonly logger = new Logger(NonDirectSettlementCron.name);

  constructor(
    private readonly txnRepo: FiatCryptoRampTransactionRepository,
    private readonly paymentService: PaymentsService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async processNonDirectSettlements() {
    this.logger.log('🔁 Checking non-direct settlements...');

    const txns = await this.txnRepo.find({
      where: {
        directSettlement: false,
        status: 'PENDING',
      },
    });

    for (const txn of txns) {
      if (!this.shouldSettleNow(txn)) continue;

      try {
        this.logger.log(`🕒 Settling delayed txn ${txn.id}`);
        const result = await this.paymentService.payout({
          userId: txn.userId,
          amount: txn.userAmount,
          currency: txn.fiatCode,
          recipientInfo: txn.recipientInfo,
        });

        txn.status = result.success ? 'COMPLETED' : 'FAILED';
        txn.settlementTxHash = result.txHash ?? null;
        await this.txnRepo.save(txn);
      } catch (err) {
        this.logger.error(`Error settling non-direct txn ${txn.id}`, err.stack);
      }
    }
  }

  private shouldSettleNow(txn: any): boolean {
    const minutesPassed =
      (Date.now() - new Date(txn.createdAt).getTime()) / 60000;
    return minutesPassed >= 15; // e.g., after 15 minutes delay
  }
}
