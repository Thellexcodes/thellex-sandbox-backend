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
    const txns = await this.paymentService.findAllDirectSettlementTransactions({
      paymentStatus: PaymentStatus.Complete,
      transactionType: TransactionTypeEnum.FIAT_TO_CRYPTO_DEPOSIT,
      sentCrypto: false,
    });

    if (txns.length <= 0) return;

    // for (const txn of txns) {
    //   if (this.inProgressTxnCache.has(txn.id)) {
    //     this.logger.warn(`⏳ Skipping txn ${txn.id} (already in progress)`);
    //     continue;
    //   }

    //   this.inProgressTxnCache.set(txn.id, true);
    //   this.logger.log(`⚡ Settling txn ${txn.id}`);
    //   try {
    //     await this.paymentService.payout(txn);
    //   } catch (err) {
    //     this.logger.error(`❌ Failed to settle txn ${txn.id}`, err.stack);
    //   } finally {
    //     this.inProgressTxnCache.delete(txn.id);
    //   }
    // }
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async processCryptoToFiatSettlements() {
    const txns = await this.paymentService.findAllDirectSettlementTransactions({
      paymentStatus: PaymentStatus.Complete,
      transactionType: TransactionTypeEnum.CRYPTO_TO_FIAT_WITHDRAWAL,
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

//[x] plan for batching transactions through SC
// @Cron(CronExpression.EVERY_10_SECONDS)
// async processFiatToCryptoSettlements() {
//   const txns = await this.paymentService.findAllDirectSettlementTransactions({
//     paymentStatus: PaymentStatus.Complete,
//     transactionType: TransactionTypeEnum.CRYPTO_TO_FIAT_WITHDRAWAL,
//     sentCrypto: false,
//   });
//   // Skip if none
//   if (txns.length === 0) return;
//   // Group by assetCode
//   const groupedByToken: Record<
//     string,
//     { recipients: string[]; amounts: bigint[]; txns: any[] }
//   > = {};
//   for (const txn of txns) {
//     if (this.inProgressTxnCache.has(txn.id)) {
//       this.logger.warn(`⏳ Skipping txn ${txn.id} (already in progress)`);
//       continue;
//     }
//   //   const { assetCode, cryptoAddress, cryptoAmount } = txn;
//   //   if (!groupedByToken[assetCode]) {
//   //     groupedByToken[assetCode] = { recipients: [], amounts: [], txns: [] };
//   //   }
//   //   groupedByToken[assetCode].recipients.push(cryptoAddress);
//   //   groupedByToken[assetCode].amounts.push(
//   //     BigInt(ethers.parseUnits(cryptoAmount.toString(), 18)),
//   //   ); // Assuming 18 decimals
//   //   groupedByToken[assetCode].txns.push(txn);
//   //   this.inProgressTxnCache.set(txn.id, true);
//   // }
//   // // Batch transfer per token
//   // for (const assetCode in groupedByToken) {
//   //   const { recipients, amounts, txns } = groupedByToken[assetCode];
//   //   try {
//   //     const tokenAddress =
//   //       TokenAddresses[SupportedBlockchainTypeEnum.ETH][assetCode];
//   //     await this.sendBatchedTransfer(tokenAddress, recipients, amounts);
//   //     // ✅ Mark each txn as sent
//   //     for (const txn of txns) {
//   //       await this.paymentService.markAsSettled(txn.id);
//   //       this.inProgressTxnCache.delete(txn.id);
//   //     }
//   //   } catch (err) {
//   //     this.logger.error(
//   //       `❌ Failed batch transfer for ${assetCode}`,
//   //       err.stack,
//   //     );
//   //     for (const txn of txns) {
//   //       this.inProgressTxnCache.delete(txn.id);
//   //     }
//   //   }
//   }
// }
