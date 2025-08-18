import { EVERY_15_SECONDS_CRON } from '@/config/settings';
import { PaymentStatus, TransactionTypeEnum } from '@/models/payment.types';
import { MapleradService } from '@/modules/payments/maplerad.service';
import { PaymentsService } from '@/modules/payments/payments.service';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LRUCache } from 'lru-cache';

@Injectable()
export class RampSettlementsCron {
  private readonly logger = new Logger(RampSettlementsCron.name);

  constructor(
    private readonly paymentService: PaymentsService,
    private readonly mapleradService: MapleradService,
  ) {}

  private readonly inProgressTxnCache = new LRUCache<string, boolean>({
    max: 10000, // Max concurrent keys to track
    ttl: 1000 * 60 * 10, // 10 minutes TTL (auto evict old ones)
  });

  @Cron(EVERY_15_SECONDS_CRON)
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
    //     this.inProgressTxnCache.delete(txn.id);ty
    //   }
    // }
  }

  // Updated processCryptoToFiatSettlements to handle YellowCard fiat payouts and retries
  // Updated processCryptoToFiatSettlements to handle liquidity checks and retries
  @Cron(EVERY_15_SECONDS_CRON)
  async processCryptoToFiatSettlements() {
    const txns = await this.paymentService.findAllDirectSettlementTransactions({
      paymentStatus: PaymentStatus.Processing,
      transactionType: TransactionTypeEnum.CRYPTO_TO_FIAT_WITHDRAWAL,
      sentCrypto: false, // Only process transactions where crypto hasn't been sent or fiat payout is pending
    });

    // Check Maplerad liquidity (pseudo-code, replace with actual API call)
    let mapleradLiquidityAvailable = false;
    try {
      mapleradLiquidityAvailable =
        (await this.mapleradService
          .checkLiquidity(txns[0]?.fiatCode)
          .then((b) => b.available_balance)) > 0;
    } catch (err) {
      // this.logger.error(`Failed to check Maplerad liquidity: ${err.message}`);
    }

    for (const txn of txns) {
      if (this.inProgressTxnCache.has(txn.id)) {
        this.logger.warn(`⏳ Skipping txn ${txn.id} (already in progress)`);
        continue;
      }
      this.inProgressTxnCache.set(txn.id, true);
      this.logger.log(`⚡ Processing txn ${txn.id}`);

      // try {
      // Step 1: Transfer crypto if not already sent
      //       if (!txn.sentCrypto) {
      //         const cryptoTxResult = await this.payoutCrypto(txn);
      //         if (!cryptoTxResult.success) {
      //           throw new Error(`Crypto transfer failed: ${cryptoTxResult.error}`);
      //         }
      //         txn.sentCrypto = true;
      //         txn.blockchainTxId = cryptoTxResult.txHash;
      //         await this.fiatCryptoRampTransactionRepo.save(txn);
      //       }

      //       // Step 2: Handle fiat payout
      //       const { channels } = await this.ycService.getChannels();
      //       const { networks } = await this.ycService.getNetworks();
      //       let channel = channels.find((c) => c.id === txn.channelId);
      //       let network = networks.find((n) => n.id === txn.bankInfo.networkId);

      //       let { accountName } = await this.ycService.resolveBankAccount({
      //         accountNumber: txn.bankInfo.accountNumber,
      //         networkId: txn.bankInfo.networkId,
      //       });

      //       const payoutServices = [
      //         {
      //           name: PaymentPartnerEnum.MAPLERAD,
      //           execute: async () => {
      //             if (!mapleradLiquidityAvailable) {
      //               throw new CustomHttpException(
      //                 PaymentErrorEnum.INSUFFICIENT_LIQUIDITY,
      //                 HttpStatus.SERVICE_UNAVAILABLE,
      //               );
      //             }
      //             const response = await this.mapleradService.localTransferAfrica({
      //               bank_code: txn.bankInfo.accountBank,
      //               account_number: txn.bankInfo.accountNumber,
      //               amount: txn.netFiatAmount,
      //               reason: txn.reason || 'Crypto to Fiat Off-Ramp',
      //               currency: txn.fiatCode,
      //             });
      //             if (!response.success) {
      //               if (response.error?.includes('insufficient liquidity')) {
      //                 throw new CustomHttpException(
      //                   PaymentErrorEnum.INSUFFICIENT_LIQUIDITY,
      //                   HttpStatus.SERVICE_UNAVAILABLE,
      //                 );
      //               }
      //               throw new Error('Maplerad transfer failed');
      //             }
      //             return {
      //               id: response.transactionId,
      //               destination: {
      //                 networkId: network.id,
      //                 accountBank: network.code,
      //                 networkName: txn.bankInfo.networkName,
      //               },
      //               expiresAt: toUTCDate(new Date(ONE_DAY_LATER).toISOString()),
      //             };
      //           },
      //         },
      //         {
      //           name: PaymentPartnerEnum.YELLOWCARD,
      //           execute: async () => {
      //             const request = {
      //               sequenceId: txn.sequenceId,
      //               channelId: channel.id,
      //               currency: channel.currency,
      //               country: channel.country,
      //               localAmount: txn.userAmount,
      //               reason: txn.reason || 'Crypto to Fiat Off-Ramp',
      //               destination: {
      //                 accountName,
      //                 accountNumber: txn.bankInfo.accountNumber,
      //                 accountType: YCTxnAccountTypes.BANK,
      //                 networkId: network.id,
      //                 accountBank: network.code,
      //               },
      //               sender: {
      //                 name: `${txn.user.kyc.firstName} ${txn.user.kyc.lastName}`,
      //                 country: 'NGN',
      //                 phone: txn.user.kyc.phone,
      //                 dob: txn.user.kyc.dob,
      //                 email: txn.user.email,
      //                 idNumber: txn.user.kyc.idNumber,
      //                 idType: txn.user.kyc.idTypes[0],
      //               },
      //               forceAccept: true,
      //               customerUID: txn.user.uid.toString(),
      //             };

      //             return await this.ycService.submitPaymentRequest(request);
      //           },
      //         },
      //       ].sort(
      //         (a, b) =>
      //           PAYMENT_PROVIDER_PRIORITY.indexOf(a.name) -
      //           PAYMENT_PROVIDER_PRIORITY.indexOf(b.name),
      //       );

      //       let payoutResponse;
      //       for (const service of payoutServices) {
      //         // Skip Maplerad if transaction was originally YellowCard or liquidity is unavailable
      //         if (
      //           (txn.paymentProvider === PaymentPartnerEnum.YELLOWCARD &&
      //             service.name === PaymentPartnerEnum.MAPLERAD) ||
      //           (service.name === PaymentPartnerEnum.MAPLERAD &&
      //             !mapleradLiquidityAvailable)
      //         ) {
      //           continue;
      //         }
      //         try {
      //           payoutResponse = await service.execute();
      //           txn.providerTransactionId = payoutResponse.id;
      //           txn.paymentProvider = service.name;
      //           txn.paymentStatus = PaymentStatus.Complete;
      //           txn.sentCrypto = true;
      //           txn.failureReason = null;
      //           await this.fiatCryptoRampTransactionRepo.save(txn);
      //           this.logger.log(
      //             `✅ Fiat payout succeeded with ${service.name} for txn ${txn.id}`,
      //           );
      //           break;
      //         } catch (err) {
      //           this.logger.error(
      //             `❌ Fiat payout failed with ${service.name} for txn ${txn.id}: ${err.message}`,
      //           );
      //           txn.failureReason =
      //             err.message === PaymentErrorEnum.INSUFFICIENT_LIQUIDITY
      //               ? PaymentErrorEnum.INSUFFICIENT_LIQUIDITY
      //               : 'OTHER';
      //           txn.paymentStatus = PaymentStatus.Failed;
      //           await this.fiatCryptoRampTransactionRepo.save(txn);
      //           if (
      //             service.name ===
      //               PAYMENT_PROVIDER_PRIORITY[
      //                 PAYMENT_PROVIDER_PRIORITY.length - 1
      //               ] ||
      //             (txn.paymentProvider === PaymentPartnerEnum.YELLOWCARD &&
      //               service.name === PaymentPartnerEnum.YELLOWCARD) ||
      //             (service.name === PaymentPartnerEnum.MAPLERAD &&
      //               !mapleradLiquidityAvailable)
      //           ) {
      //             throw new Error(
      //               `All relevant fiat payout services failed for txn ${txn.id}`,
      //             );
      //           }
      //         }
      //       }

      //       if (!payoutResponse) {
      //         // Check if transaction has expired
      //         if (new Date(txn.expiresAt) < new Date()) {
      //           this.logger.warn(
      //             `Transaction ${txn.id} has expired, attempting YellowCard as final fallback`,
      //           );
      //           const yellowCardService = payoutServices.find(
      //             (s) => s.name === PaymentPartnerEnum.YELLOWCARD,
      //           );
      //           try {
      //             payoutResponse = await yellowCardService.execute();
      //             txn.providerTransactionId = payoutResponse.id;
      //             txn.paymentProvider = PaymentPartnerEnum.YELLOWCARD;
      //             txn.paymentStatus = PaymentStatus.Complete;
      //             txn.sentCrypto = true;
      //             txn.failureReason = null;
      //             await this.fiatCryptoRampTransactionRepo.save(txn);
      //             this.logger.log(
      //               `✅ Final YellowCard payout succeeded for txn ${txn.id}`,
      //             );
      //           } catch (err) {
      //             this.logger.error(
      //               `❌ Final YellowCard payout failed for txn ${txn.id}: ${err.message}`,
      //             );
      //             txn.paymentStatus = PaymentStatus.Failed;
      //             txn.failureReason = 'OTHER';
      //             await this.fiatCryptoRampTransactionRepo.save(txn);
      //             throw new Error(
      //               `Final YellowCard payout failed for txn ${txn.id}`,
      //             );
      //           }
      //         } else {
      //           throw new Error(
      //             `No fiat payout service succeeded for txn ${txn.id}`,
      //           );
      //         }
      //       }

      //       // Update transaction history
      //       const txnHistory = await this.transactionHistoryService.findOne({
      //         rampID: txn.id,
      //       });
      //       if (txnHistory) {
      //         txnHistory.paymentStatus = PaymentStatus.Complete;
      //         await this.transactionHistoryService.update(txnHistory);
      //       }

      //       // Emit notification
      //       await this.notificationGateway.emitNotificationToUser({
      //         token: txn.user.alertID,
      //         event: NotificationEventEnum.CRYPTO_TO_FIAT_WITHDRAWAL,
      //         status: NotificationStatusEnum.SUCCESS,
      //         data: { transaction: txnHistory || txn },
      //       });

      //       this.logger.log(`✅ Transaction ${txn.id} processed successfully`);
      //     } catch (err) {
      //       this.logger.error(`❌ Failed to process txn ${txn.id}`, err.stack);
      //       txn.paymentStatus = PaymentStatus.Failed;
      //       await this.fiatCryptoRampTransactionRepo.save(txn);
      //     } finally {
      //       this.inProgressTxnCache.delete(txn.id);
      //     }
      //   }
      // }
    }

    //   @Cron(EVERY_15_SECONDS_CRON)
    //   async processCryptoToFiatSettlements() {
    //     const txns = await this.paymentService.findAllDirectSettlementTransactions({
    //       paymentStatus: PaymentStatus.Processing,
    //       transactionType: TransactionTypeEnum.CRYPTO_TO_FIAT_WITHDRAWAL,
    //       sentCrypto: false,
    //     });

    //     for (const txn of txns) {
    //       if (this.inProgressTxnCache.has(txn.id)) {
    //         this.logger.warn(`⏳ Skipping txn ${txn.id} (already in progress)`);
    //         continue;
    //       }
    //       this.inProgressTxnCache.set(txn.id, true);
    //       this.logger.log(`⚡ Settling txn ${txn.id}`);
    //       try {
    //         await this.paymentService.payout(txn);
    //       } catch (err) {
    //         this.logger.error(`❌ Failed to settle txn ${txn.id}`, err.stack);
    //       } finally {
    //         this.inProgressTxnCache.delete(txn.id);
    //       }
    //     }
    //   }
    // }

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
  }
}
