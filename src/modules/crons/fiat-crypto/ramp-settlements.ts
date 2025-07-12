import { PaymentStatus, TransactionTypeEnum } from '@/models/payment.types';
import { PaymentsService } from '@/modules/payments/payments.service';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LRUCache } from 'lru-cache';

@Injectable()
export class RampSettlementsCron {
  private readonly logger = new Logger(RampSettlementsCron.name);

  constructor(private readonly paymentService: PaymentsService) {}

  private readonly inProgressTxnCache = new LRUCache<string, boolean>({
    max: 10000, // Max concurrent keys to track
    ttl: 1000 * 60 * 10, // 10 minutes TTL (auto evict old ones)
  });

  @Cron(CronExpression.EVERY_10_SECONDS)
  async processFiatToCryptoSettlements() {
    this.logger.log('🔁 Checking direct settlements...');

    const txns = await this.paymentService.findAllDirectSettlementTransactions({
      paymentStatus: PaymentStatus.Complete,
      transactionType: TransactionTypeEnum.FIAT_TO_CRYPTO_DEPOSIT,
      sentCrypto: false,
    });

    for (const txn of txns) {
      if (this.inProgressTxnCache.has(txn.id)) {
        this.logger.warn(`⏳ Skipping txn ${txn.id} (already in progress)`);
        continue;
      }

      this.inProgressTxnCache.set(txn.id, true);
      this.logger.log(`⚡ Settling txn ${txn.id}`);
      try {
        await this.paymentService.payout(txn);
      } catch (err) {
        this.logger.error(`❌ Failed to settle txn ${txn.id}`, err.stack);
      } finally {
        this.inProgressTxnCache.delete(txn.id);
      }
    }
  }
}
