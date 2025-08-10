import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import {
  BASIS_POINTS_DIVISOR,
  BlockchainNetworkSettings,
  DIRECT_SETTLEMENT_THRESHOLD,
  FiatEnum,
  ONE_DAY_LATER,
  PAYMENT_PROVIDER_PRIORITY,
  SupportedWalletTypes,
  WalletProviderEnum,
} from '@/config/settings';
import { CreateCryptoWithdrawPaymentDto } from './dto/create-withdraw-crypto.dto';
import { TransactionHistoryEntity } from '@/utils/typeorm/entities/transaction-history.entity';
import { QwalletService } from '../wallets/qwallet/qwallet.service';
import { CwalletService } from '../wallets/cwallet/cwallet.service';
import { YellowCardService } from './yellowcard.service';
import { v4 as uuidV4 } from 'uuid';
import { CustomHttpException } from '@/middleware/custom.http.exception';
import { PaymentPartnerEnum } from '@/models/payments.providers';
import { walletConfig } from '@/utils/tokenChains';
import {
  FiatCryptoRampTransactionEntity,
  IFiatToCryptoQuoteSummaryResponseDto,
  IRatesDto,
  IRatesResponseDto,
} from '@/utils/typeorm/entities/fiat-crypto-ramp-transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  capitalizeName,
  extractFirstName,
  findBankByName,
  formatUserWithTiers,
  toLowestDenomination,
  toUTCDate,
} from '@/utils/helpers';
import {
  calculateNetCryptoAmount,
  calculateNetFiatAmount,
} from '@/utils/fee.utils';
import {
  PaymentStatus,
  TransactionDirectionEnum,
  TransactionTypeEnum,
  YCRampPaymentEventEnum,
} from '@/models/payment.types';
import { plainToInstance } from 'class-transformer';
import { FiatToCryptoOnRampRequestDto } from './dto/fiat-to-crypto-request.dto';
import { IYellowCardRateDto } from './dto/yellocard.dto';
import { RequestCryptoOffRampPaymentDto } from './dto/request-crypto-offramp-payment.dto';
import { EtherService } from '@/utils/services/ethers.service';
import { TransactionHistoryDto } from '../transaction-history/dto/create-transaction-history.dto';
import { QWalletsEntity } from '@/utils/typeorm/entities/wallets/qwallet/qwallets.entity';
import { CwalletsEntity } from '@/utils/typeorm/entities/wallets/cwallet/cwallet.entity';
import { WalletErrorEnum } from '@/models/wallet-manager.types';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import {
  NotificationEventEnum,
  NotificationStatusEnum,
} from '@/models/notifications.enum';
import { PaymentErrorEnum } from '@/models/payment-error.enum';
import { MapleradService } from './maplerad.service';
import { TransactionHistoryService } from '../transaction-history/transaction-history.service';
import { YCTxnAccountTypes } from '@/models/yellow-card.types';
import { LRUCache } from 'lru-cache';
import { ICreateMalperadFiatWithdrawPaymentDto } from './dto/create-withdraw-fiat.dto';

//[x] properly throw error using enum
@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly qwalletService: QwalletService,
    private readonly cwalletService: CwalletService,
    private readonly ycService: YellowCardService,
    private readonly notificationGateway: NotificationsGateway,
    @InjectRepository(FiatCryptoRampTransactionEntity)
    private readonly fiatCryptoRampTransactionRepo: Repository<FiatCryptoRampTransactionEntity>,
    private readonly dataSource: DataSource,
    private readonly mapleradService: MapleradService,
    private readonly transactionHistoryService: TransactionHistoryService,
  ) {
    // this.notificationGateway.emitNotificationToUser({
    //   token:
    //     'eny5uYxnR6KzQIFPmkll1Y:APA91bEF7yJwA9ofBHpQdiJb80URlREaOwT9fxBC8tjFmiOJg-tgjIILKDNeMe5LwTVUVAwdBwDcelcFj8FT2KaI-irKTgDVhaKOJIoSd4F8200noLryPGA',
    //   event: NotificationEventEnum.FIAT_TO_CRYPTO_DEPOSIT,
    //   status: NotificationStatusEnum.PROCESSING,
    //   data: {
    //     transaction: {
    //       id: 'this isadfa txn dddd',
    //     },
    //   },
    // });
  }

  async handleRates(
    fiatCode: FiatEnum | undefined,
    user: any,
    amount: number,
  ): Promise<IRatesResponseDto | null> {
    try {
      const cached = await this.ycService.getRateFromCache(fiatCode);

      if (
        !cached ||
        !cached.rate ||
        (Array.isArray(cached.rate) && cached.rate.length === 0)
      ) {
        return null;
      }

      const userPlain = formatUserWithTiers(user);

      const formatRate = (rate: IYellowCardRateDto): IRatesDto => ({
        fiatCode: rate.code,
        rate: {
          buy: rate.buy,
          sell: rate.sell,
          fee: userPlain.currentTier.txnFee.withdrawal.feePercentage,
          feeDivisor: BASIS_POINTS_DIVISOR,
        },
      });

      const formattedRates: IRatesDto[] = Array.isArray(cached.rate)
        ? cached.rate.map(formatRate)
        : [formatRate(cached.rate)];

      const result = {
        rates: formattedRates,
        expiresAt: cached.expiresAt,
      };

      return plainToInstance(IRatesResponseDto, result, {
        excludeExtraneousValues: true,
      });
    } catch (err) {
      console.error('Error in handleRates:', err);
      return null;
    }
  }

  async findAllDirectSettlementTransactions(
    filter: Partial<
      Pick<
        FiatCryptoRampTransactionEntity,
        'paymentStatus' | 'sentCrypto' | 'transactionType'
      >
    >,
  ): Promise<FiatCryptoRampTransactionEntity[]> {
    try {
      return this.fiatCryptoRampTransactionRepo.find({
        where: {
          paymentStatus: filter.paymentStatus,
          sentCrypto: filter.sentCrypto,
          transactionType: filter.transactionType,
        },
        relations: ['user'],
      });
    } catch (err) {
      console.log(err);
    }
  }

  /**
   * Handles a cryptocurrency withdrawal request dynamically based on walletConfig.
   * @param {CreateCryptoWithdrawPaymentDto} withdrawCryptoPaymentDto - The withdrawal request details.
   * @returns {Promise<TransactionHistoryEntity | null>} A promise that resolves to the withdrawal transaction record.
   */
  async handleWithdrawCryptoPayment(
    withdrawCryptoPaymentDto: CreateCryptoWithdrawPaymentDto,
  ): Promise<TransactionHistoryEntity> {
    const { network, assetCode, sourceAddress } = withdrawCryptoPaymentDto;

    for (const walletTypeKey in walletConfig) {
      const walletType = walletConfig[walletTypeKey as SupportedWalletTypes];
      const providers = walletType.providers;

      for (const providerKey in providers) {
        const provider = providers[providerKey as WalletProviderEnum];
        const networkConfig = provider.networks[network];

        if (networkConfig && networkConfig.tokens.includes(assetCode)) {
          const wallet =
            providerKey === WalletProviderEnum.QUIDAX
              ? await this.qwalletService.lookupSubWallet(sourceAddress)
              : await this.cwalletService.lookupSubWallet(sourceAddress);

          return providerKey === WalletProviderEnum.QUIDAX
            ? await this.qwalletService.createCryptoWithdrawal(
                withdrawCryptoPaymentDto,
                wallet as QWalletsEntity,
              )
            : await this.cwalletService.createCryptoWithdrawal(
                withdrawCryptoPaymentDto,
                wallet as CwalletsEntity,
              );
        }
      }
    }
  }

  async findOneRampTransactionBySequenceId(
    sequenceId: string,
  ): Promise<FiatCryptoRampTransactionEntity | null> {
    return await this.fiatCryptoRampTransactionRepo.findOneBy({
      sequenceId,
    });
  }

  async handleWithdrawFiatPayment(
    user: UserEntity,
    withdrawCryptoPaymentDto: ICreateMalperadFiatWithdrawPaymentDto,
  ): Promise<TransactionHistoryEntity | any> {
    // const localTransferResponse = this.mapleradService.localTransferAfrica(
    //   withdrawCryptoPaymentDto,
    // );
    //[x] creat transaction history
    //[x] store withdraw record in fiat dto
    //[x] alert users
  }

  async handleFiatToCryptoOffRamp(
    user: UserEntity,
    dto: FiatToCryptoOnRampRequestDto,
  ): Promise<IFiatToCryptoQuoteSummaryResponseDto | any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const fiatCode = dto.fiatCode.toUpperCase();
      const countryCode = dto.country.toUpperCase();

      // Get fiat rate
      const fiatRate = await this.ycService.getRateFromCache(fiatCode);
      if (!fiatRate?.rate) {
        throw new CustomHttpException(
          PaymentErrorEnum.RATES_NOT_YET_ACTIVE,
          HttpStatus.FORBIDDEN,
        );
      }

      // Wallet lookup
      const [cwallet, qwallet] = await Promise.all([
        this.cwalletService.lookupSubWallet(dto.destinationAddress),
        this.qwalletService.lookupSubWallet(dto.destinationAddress),
      ]);

      if (!cwallet && !qwallet) {
        throw new CustomHttpException(
          WalletErrorEnum.MISSING_WALLET_ID,
          HttpStatus.NOT_FOUND,
        );
      }

      const wallet = cwallet ?? qwallet;

      // Format user
      const userPlain = formatUserWithTiers(user);

      // Get channels and networks
      const [channelData, networkData] = await Promise.all([
        this.ycService.getChannels(),
        this.ycService.getNetworks(),
      ]);

      const activeChannels = channelData.channels.filter(
        (c) => c.status === 'active' && c.rampType === 'deposit',
      );

      const supportedCountries = new Set(activeChannels.map((c) => c.country));

      if (!supportedCountries.has(countryCode)) {
        throw new CustomHttpException(
          PaymentErrorEnum.COUNTRY_NOT_ACTIVE,
          HttpStatus.FORBIDDEN,
        );
      }

      const channel = activeChannels[0];

      const supportedNetworks = networkData.networks.filter(
        (n) => n.status === 'active' && n.channelIds.includes(channel.id),
      );
      const network = supportedNetworks[0];

      // Format KYC
      const userKycData = { ...userPlain.kyc };
      if (userKycData.dob) {
        const [year, month, day] = userKycData.dob.split('-');
        userKycData.dob = `${month}/${day}/${year}`;
      }
      const recipient = {
        name: capitalizeName(
          `${extractFirstName(userKycData.firstName)} ${userKycData.lastName}`,
        ),
        country: countryCode,
        phone: userKycData.phone,
        address: userKycData.address,
        dob: userKycData.dob,
        email: userPlain.email,
        idNumber: userKycData.idNumber,
        idType: userKycData.idTypes[0],
        additionalIdType: userKycData.idTypes[1],
        additionalIdNumber: userKycData.bvn,
      };

      const sequenceId = uuidV4();

      // Submit to YellowCard
      const yellowCardResponse = await this.ycService.submitCollectionRequest({
        sequenceId,
        channelId: channel.id,
        currency: channel.currency,
        country: channel.country,
        reason: dto.paymentReason,
        localAmount: dto.userAmount,
        recipient,
        forceAccept: true,
        source: { accountType: YCTxnAccountTypes.BANK },
        customerType: userPlain.kyc.customerType,
        customerUID: userPlain.uid.toString(),
      });

      // Calculate values
      const {
        netFiatAmount,
        feeAmount,
        feeLabel,
        grossCrypto,
        netCryptoAmount,
      } = await calculateNetCryptoAmount(
        dto.userAmount,
        userPlain.currentTier.txnFee.withdrawal.feePercentage,
        fiatRate.rate.buy,
      );

      const serviceFeeAmountUSD = parseFloat(
        (feeAmount / fiatRate.rate.buy).toFixed(3),
      );

      // Create transaction entity
      const newTxn = queryRunner.manager.create(
        FiatCryptoRampTransactionEntity,
        {
          user,
          userId: user.id,
          sequenceId,
          channelId: channel.id,
          transactionType: TransactionTypeEnum.FIAT_TO_CRYPTO_DEPOSIT,
          paymentStatus: PaymentStatus.Processing,
          providerReference: yellowCardResponse.reference,
          providerTransactionId: yellowCardResponse.id,
          providerDepositId: yellowCardResponse.depositId,
          customerType: userPlain.kyc.customerType,
          paymentReason: dto.paymentReason,
          userAmount: dto.userAmount,
          mainFiatAmount: dto.userAmount,
          netFiatAmount,
          netCryptoAmount,
          feeLabel,
          serviceFeeAmountLocal: feeAmount,
          serviceFeeAmountUSD,
          rate: fiatRate.rate.buy,
          grossCrypto,
          fiatCode: dto.fiatCode,
          currency: channel.currency,
          country: dto.country,
          paymentProvider: PaymentPartnerEnum.YELLOWCARD,
          bankInfo: {
            bankName: yellowCardResponse.bankInfo.name,
            accountNumber: yellowCardResponse.bankInfo.accountNumber,
            accountHolder: yellowCardResponse.bankInfo.accountName,
          },
          recipientInfo: {
            destinationAddress: dto.destinationAddress,
            network: dto.network,
            assetCode: dto.assetCode,
          },
          expiresAt: yellowCardResponse.expiresAt,
        },
      );

      const savedTxn = await queryRunner.manager.save(newTxn);

      // Save transaction history
      const txnData: TransactionHistoryDto = {
        event: YCRampPaymentEventEnum.COLLECTION_CREATED,
        transactionId: sequenceId,
        transactionDirection: TransactionDirectionEnum.INBOUND,
        assetCode: dto.assetCode,
        amount: netCryptoAmount.toString(),
        fee: serviceFeeAmountUSD.toString(),
        blockchainTxId: '',
        walletId: wallet.id,
        sourceAddress: '',
        destinationAddress: dto.destinationAddress,
        paymentNetwork: dto.network,
        user,
        paymentStatus: PaymentStatus.Processing,
        transactionType: TransactionTypeEnum.FIAT_TO_CRYPTO_DEPOSIT,
        rampID: savedTxn.id,
      };

      const { user: u, ...transaction } =
        await this.transactionHistoryService.create(txnData, user);

      // Notify user
      await this.notificationGateway.emitNotificationToUser({
        token: user.alertID,
        event: NotificationEventEnum.FIAT_TO_CRYPTO_DEPOSIT,
        status: NotificationStatusEnum.PROCESSING,
        data: { transaction },
      });

      await queryRunner.commitTransaction();

      // Return summary DTO
      return plainToInstance(
        IFiatToCryptoQuoteSummaryResponseDto,
        {
          id: savedTxn.id,
          userAmount: dto.userAmount,
          feeLabel,
          serviceFeeAmountLocal: feeAmount,
          serviceFeeAmountUSD,
          netFiatAmount,
          netCryptoAmount,
          rate: fiatRate.rate.buy,
          grossCrypto,
          bankInfo: savedTxn.bankInfo,
          recipientInfo: savedTxn.recipientInfo,
          expiresAt: yellowCardResponse.expiresAt,
          seen: false,
          paymentStatus: transaction.paymentStatus,
          transactionType: TransactionTypeEnum.FIAT_TO_CRYPTO_DEPOSIT,
          createdAt: savedTxn.createdAt,
          mainFiatAmount: savedTxn.mainFiatAmount,
          paymentReason: savedTxn.paymentReason,
        },
        { excludeExtraneousValues: true },
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        'handleFiatToCryptoOffRamp failed:',
        error.stack ?? error,
      );
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Crypto to fiat off ramp
  async handleCryptoToFiatOffRamp(
    user: UserEntity,
    dto: RequestCryptoOffRampPaymentDto,
  ) {
    const sequenceId = uuidV4();
    try {
      const fiatRate = await this.ycService.getRateFromCache(
        dto.fiatCode.toUpperCase(),
      );
      if (!fiatRate.rate) {
        throw new CustomHttpException(
          PaymentErrorEnum.RATES_NOT_YET_ACTIVE,
          HttpStatus.FORBIDDEN,
        );
      }

      const networkInfo = BlockchainNetworkSettings[dto.network];

      const userPlain = formatUserWithTiers(user);

      const [cwallet, qwallet] = await Promise.all([
        this.cwalletService.lookupSubWallet(dto.sourceAddress),
        this.qwalletService.lookupSubWallet(dto.sourceAddress),
      ]);

      if (!cwallet && !qwallet) {
        throw new CustomHttpException(
          WalletErrorEnum.MISSING_WALLET_ID,
          HttpStatus.NOT_FOUND,
        );
      }

      const wallet = cwallet ?? qwallet;

      const sourceAddress =
        cwallet?.networkMetadata[dto.network].address ??
        qwallet?.networkMetadata[dto.network].address;

      if (!sourceAddress) {
        throw new CustomHttpException(
          WalletErrorEnum.WALLET_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      const { channels } = await this.ycService.getChannels();
      const { networks } = await this.ycService.getNetworks();

      let activeChannels = channels.filter(
        (c) =>
          c.status === 'active' &&
          c.apiStatus === 'active' &&
          c.rampType === 'withdraw',
      );
      let supportedCountries = [
        ...new Set(activeChannels.map((c) => c.country)),
      ];

      let channel = activeChannels[0];
      let supportedNetworks = networks.filter(
        (n) => n.status === 'active' && n.channelIds.includes(channel.id),
      );
      let network = supportedNetworks[0];

      const userKycData = { ...userPlain.kyc };
      if (userKycData.dob) {
        const [year, month, day] = userKycData.dob.split('-');
        userKycData.dob = `${month}/${day}/${year}`;
      }

      const sender = {
        name: `${userPlain.kyc.firstName} ${userPlain.kyc.lastName}`,
        country: 'NGN',
        phone: userKycData.phone,
        dob: userKycData.dob,
        email: userPlain.email,
        idNumber: userKycData.idNumber,
        idType: userKycData.idTypes[0],
      };

      const destination = {
        accountName: dto.bankInfo.accountHolder,
        accountNumber: dto.bankInfo.accountNumber,
        accountType: YCTxnAccountTypes.BANK,
        networkId: network.id,
        accountBank: network.code,
      };

      const { grossFiat, feeAmount, feeLabel, netFiatAmount, netCryptoAmount } =
        await calculateNetFiatAmount(
          dto.mainAssetAmount,
          userPlain.currentTier.txnFee.withdrawal.feePercentage,
          fiatRate.rate.buy,
        );

      const bank = findBankByName(dto.bankInfo.bankName);
      if (!bank) {
        throw new CustomHttpException('Bank not found', HttpStatus.BAD_REQUEST);
      }

      // Step 1: Transfer crypto from user wallet to treasury address
      let cryptoTxResult;
      try {
        this.inProgressTxnCache.set(sequenceId, true);
        cryptoTxResult = await this.payoutCrypto({
          user,
          userId: user.id,
          recipientInfo: {
            destinationAddress: networkInfo.treasuryAddress,
            network: dto.network,
            assetCode: dto.assetCode,
          },
          userAmount: dto.mainAssetAmount,
          sourceAddress: dto.sourceAddress,
          grossCrypto: netCryptoAmount,
          serviceFeeAmountUSD: parseFloat(
            (feeAmount / fiatRate.rate.sell).toFixed(2),
          ),
          sequenceId,
          transactionType: TransactionTypeEnum.CRYPTO_TO_FIAT_WITHDRAWAL,
          providerTransactionId: uuidV4(),
        });

        if (!cryptoTxResult.success) {
          throw new Error(`Crypto transfer failed: ${cryptoTxResult.error}`);
        }
      } catch (error) {
        this.inProgressTxnCache.delete(sequenceId);
        this.logger.error(
          `Crypto transfer failed for sequenceId ${sequenceId}: ${error.message}`,
        );
        throw new CustomHttpException(
          'Crypto transfer failed',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      // Step 2: Create transaction entity
      const newTxn = new FiatCryptoRampTransactionEntity();
      newTxn.user = user;
      newTxn.userId = user.id;
      newTxn.sequenceId = sequenceId;
      newTxn.channelId = channel.id;
      newTxn.transactionType = TransactionTypeEnum.CRYPTO_TO_FIAT_WITHDRAWAL;
      newTxn.paymentStatus = PaymentStatus.Processing;
      newTxn.customerType = userPlain.kyc.customerType;
      newTxn.userAmount = dto.userAmount;
      newTxn.netFiatAmount = netFiatAmount;
      newTxn.grossFiat = grossFiat;
      newTxn.netCryptoAmount = netCryptoAmount;
      newTxn.mainAssetAmount = dto.mainAssetAmount;
      newTxn.rate = fiatRate.rate.sell;
      newTxn.fiatCode = dto.fiatCode;
      newTxn.currency = channel.currency;
      newTxn.country = dto.country;
      newTxn.sourceAddress = dto.sourceAddress;
      newTxn.blockchainTxId = cryptoTxResult.txHash;
      newTxn.bankInfo = {
        bankName: dto.bankInfo.bankName,
        accountNumber: dto.bankInfo.accountNumber,
        accountHolder: dto.bankInfo.accountHolder,
        networkId: network.id,
        accountBank: network.code,
        networkName: bank.name,
      };
      newTxn.recipientInfo = {
        destinationAddress: networkInfo.treasuryAddress,
        sourceAddress: dto.sourceAddress,
        network: dto.network,
        assetCode: dto.assetCode,
      };
      newTxn.expiresAt = toUTCDate(new Date(ONE_DAY_LATER).toISOString());
      newTxn.sentCrypto = false;

      // Step 3: Attempt fiat payout with prioritized providers
      let payoutResponse;
      let paymentProvider;

      const aa = 100;
      const bankInfoAndCode = findBankByName(dto.bankInfo.bankName);
      this.logger.log({ bankInfoAndCode, b: dto.bankInfo.accountNumber });
      // let bankRecord = await this.mapleradService.resolveInstitutionAccount({
      //   account_number: dto.bankInfo.accountNumber,
      //   bank_code: bankInfoAndCode.code,
      // });

      // this.logger.log({ bankRecord });
      this.logger.log({
        bank_code: bankInfoAndCode.code,
        account_number: dto.bankInfo.accountNumber,
        amount: toLowestDenomination(aa),
        reason: dto.paymentReason,
        currency: dto.fiatCode,
      });

      const payoutServices = [
        {
          name: PaymentPartnerEnum.MAPLERAD,
          execute: async () => {
            //[x] resolve bank

            const response = await this.mapleradService.localTransferAfrica({
              bank_code: bankInfoAndCode.code,
              account_number: dto.bankInfo.accountNumber,
              amount: toLowestDenomination(aa),
              reason: dto.paymentReason,
              currency: dto.fiatCode,
            });

            return {
              ...response,
              expiresAt: toUTCDate(new Date(ONE_DAY_LATER).toISOString()),
            };
          },
        },
        // {
        //   name: PaymentPartnerEnum.YELLOWCARD,
        //   execute: async () => {
        //     let { accountName } = await this.ycService.resolveBankAccount({
        //       accountNumber: destination.accountNumber,
        //       networkId: destination.networkId,
        //     });
        //     destination.accountName = accountName;

        //     const request = {
        //       sequenceId: sequenceId,
        //       channelId: channel.id,
        //       currency: channel.currency,
        //       country: channel.country,
        //       localAmount: dto.userAmount,
        //       reason: dto.paymentReason,
        //       destination,
        //       sender,
        //       forceAccept: true,
        //       customerUID: userPlain.uid.toString(),
        //     };

        //     return await this.ycService.submitPaymentRequest(request);
        //   },
        // },
      ].sort(
        (a, b) =>
          PAYMENT_PROVIDER_PRIORITY.indexOf(a.name) -
          PAYMENT_PROVIDER_PRIORITY.indexOf(b.name),
      );

      for (const service of payoutServices) {
        try {
          paymentProvider = service.name;
          payoutResponse = await service.execute();
          newTxn.providerTransactionId = payoutResponse.id;
          newTxn.paymentProvider = paymentProvider;
          if (service.name === PaymentPartnerEnum.MAPLERAD) {
            newTxn.sentCrypto = true;
            newTxn.paymentStatus = PaymentStatus.Processing;
            newTxn.feeLabel = feeLabel;
            newTxn.serviceFeeAmountLocal = feeAmount;
            newTxn.serviceFeeAmountUSD = parseFloat(
              (feeAmount / fiatRate.rate.sell).toFixed(2),
            );
          }
          // For YellowCard, keep sentCrypto: false for cron processing
          this.logger.log(`Fiat payout succeeded with ${service.name}`);
          break;
        } catch (error) {
          this.inProgressTxnCache.delete(sequenceId); // Clean up cache after each failed attempt
          this.logger.error(
            `Fiat payout failed with ${service.name}: ${error.message}`,
          );
          // Save failed transaction for cron retry
          newTxn.paymentProvider = service.name;
          newTxn.paymentStatus = PaymentStatus.Failed;
          newTxn.providerErrorMsg =
            error.message === PaymentErrorEnum.INSUFFICIENT_LIQUIDITY
              ? PaymentErrorEnum.INSUFFICIENT_LIQUIDITY
              : 'OTHER';
          await this.fiatCryptoRampTransactionRepo.save(newTxn);
          if (
            service.name ===
            PAYMENT_PROVIDER_PRIORITY[PAYMENT_PROVIDER_PRIORITY.length - 1]
          ) {
            // Last provider failed
            this.logger.warn(
              `All fiat payout services failed for sequenceId ${sequenceId}`,
            );
            throw new CustomHttpException(
              'All fiat payout services failed',
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }
        }
      }

      if (!payoutResponse) {
        throw new CustomHttpException(
          'No fiat payout service succeeded',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      // Save transaction
      const rampTxn = await this.fiatCryptoRampTransactionRepo.save(newTxn);

      // Create transaction history
      const txnData: TransactionHistoryDto = {
        event: YCRampPaymentEventEnum.COLLECTION_CREATED,
        transactionId: sequenceId,
        transactionDirection: TransactionDirectionEnum.INBOUND,
        assetCode: dto.assetCode,
        amount: netCryptoAmount.toString(),
        fee: newTxn.serviceFeeAmountUSD.toString(),
        blockchainTxId: cryptoTxResult.txHash,
        walletId: wallet.id,
        sourceAddress: dto.sourceAddress,
        destinationAddress: networkInfo.treasuryAddress,
        paymentNetwork: dto.network,
        user,
        paymentStatus: newTxn.paymentStatus,
        transactionType: TransactionTypeEnum.CRYPTO_TO_FIAT_WITHDRAWAL,
        rampID: rampTxn.id,
        mainAssetAmount: rampTxn.mainAssetAmount,
      };

      const { user: u, ...transaction } =
        await this.transactionHistoryService.create(txnData, user);

      this.inProgressTxnCache.delete(sequenceId);

      return plainToInstance(
        IFiatToCryptoQuoteSummaryResponseDto,
        {
          id: rampTxn.id,
          userAmount: dto.userAmount,
          feeLabel,
          serviceFeeAmountLocal: feeAmount,
          serviceFeeAmountUsd: newTxn.serviceFeeAmountUSD,
          rate: fiatRate.rate.buy,
          netFiatAmount,
          netCryptoAmount,
          grossFiat,
          expiresAt: payoutResponse.expiresAt,
          bankInfo: dto.bankInfo,
          recipientInfo: newTxn.recipientInfo,
          seen: false,
          paymentStatus: transaction.paymentStatus,
          transactionType: TransactionTypeEnum.CRYPTO_TO_FIAT_WITHDRAWAL,
          createdAt: transaction.createdAt,
          mainAssetAmount: rampTxn.mainAssetAmount,
          transaction,
        },
        { excludeExtraneousValues: true },
      );
    } catch (err) {
      this.inProgressTxnCache.delete(sequenceId);
      this.logger.error('Error in handleCryptoToFiatOffRamp:', err);
      throw err;
    }
  }

  async payout(params: FiatCryptoRampTransactionEntity) {
    if (
      params.transactionType === TransactionTypeEnum.CRYPTO_TO_FIAT_WITHDRAWAL
    ) {
      return this.payoutFiat(params);
    } else {
      return this.payoutCrypto(params);
    }
  }

  async payoutCrypto(
    params: Partial<FiatCryptoRampTransactionEntity>,
  ): Promise<{
    success: boolean;
    txHash?: string;
    error?: string;
  }> {
    const {
      recipientInfo,
      grossCrypto,
      userId,
      user,
      sourceAddress,
      userAmount,
      id: transactionId,
    } = params;

    // Input validation
    // if (
    //   !recipientInfo ||
    //   !grossCrypto ||
    //   !userId ||
    //   !user ||
    //   !sourceAddress ||
    //   !userAmount ||
    //   !transactionId
    // ) {
    //   const errorMsg = `Missing required fields: ${JSON.stringify({
    //     recipientInfo: !!recipientInfo,
    //     grossCrypto: !!grossCrypto,
    //     userId: !!userId,
    //     user: !!user,
    //     sourceAddress: !!sourceAddress,
    //     userAmount: !!userAmount,
    //     transactionId: !!transactionId,
    //   })}`;
    //   this.logger.error(`Crypto payout failed for user ${userId}: ${errorMsg}`);
    //   throw new CustomHttpException(
    //     PaymentErrorEnum.INVALID_REQUEST,
    //     HttpStatus.BAD_REQUEST,
    //   );
    // }

    // // Validate asset and network
    // if (!recipientInfo.assetCode) {
    //   this.logger.error(`Invalid asset code for transaction ${transactionId}`);
    //   throw new CustomHttpException(
    //     PaymentErrorEnum.UNSUPPORTED_ASSET,
    //     HttpStatus.BAD_REQUEST,
    //   );
    // }
    // if (!recipientInfo.network) {
    //   this.logger.error(`Invalid network for transaction ${transactionId}`);
    //   throw new CustomHttpException(
    //     PaymentErrorEnum.NETWORK_NOT_SUPPORTED,
    //     HttpStatus.BAD_REQUEST,
    //   );
    // }

    try {
      // Step 1: Lookup wallets
      const [cwallet, qwallet] = await Promise.all([
        this.cwalletService.lookupSubWallet(sourceAddress),
        this.qwalletService.lookupSubWallet(sourceAddress),
      ]);

      if (!cwallet && !qwallet) {
        const errorMsg = `No wallet found for address ${recipientInfo.sourceAddress}`;
        this.logger.warn(`❗ ${errorMsg}`);
        throw new CustomHttpException(
          PaymentErrorEnum.INVALID_WALLET,
          HttpStatus.BAD_REQUEST,
        );
      }

      const walletId =
        qwallet?.profile?.qid ?? cwallet?.profile?.walletSetId ?? null;

      if (!walletId) {
        this.logger.warn(`⚠️ Wallet found but no wallet ID for user ${userId}`);
      }

      this.logger.log(
        `Processing crypto payout for user ${userId}, wallet: ${walletId}, asset: ${recipientInfo.assetCode}, amount: ${userAmount}`,
      );

      // Step 2: Create crypto withdrawal
      const cryptoPaymentObj: CreateCryptoWithdrawPaymentDto = {
        assetCode: recipientInfo.assetCode,
        amount: userAmount.toString(),
        network: recipientInfo.network,
        sourceAddress,
        fund_uid: recipientInfo.destinationAddress,
      };

      let txResult;
      // try {
      //   if (cwallet) {
      //     txResult = await this.cwalletService.createCryptoWithdrawal(
      //       cryptoPaymentObj,
      //       cwallet,
      //     );
      //   } else if (qwallet) {
      //     txResult = await this.qwalletService.createCryptoWithdrawal(
      //       cryptoPaymentObj,
      //       qwallet,
      //     );
      //   }
      // } catch (error) {
      //   let errorCode = PaymentErrorEnum.WITHDRAWAL_TRANSACTION_FAILED;
      //   if (error.message?.includes('insufficient balance')) {
      //     errorCode = PaymentErrorEnum.WITHDRAWAL_AMOUNT_EXCEEDS_BALANCE;
      //   } else if (error.message?.includes('invalid address')) {
      //     errorCode = PaymentErrorEnum.INVALID_DESTINATION_ADDRESS;
      //   } else if (error.message?.includes('network')) {
      //     errorCode = PaymentErrorEnum.NETWORK_NOT_SUPPORTED;
      //   } else if (error.message?.includes('asset')) {
      //     errorCode = PaymentErrorEnum.UNSUPPORTED_ASSET;
      //   }
      //   throw new CustomHttpException(errorCode, HttpStatus.BAD_REQUEST);
      // }

      // if (!txResult) {
      //   throw new CustomHttpException(
      //     PaymentErrorEnum.WITHDRAWAL_TRANSACTION_FAILED,
      //     HttpStatus.INTERNAL_SERVER_ERROR,
      //   );
      // }

      // Step 3: Update transaction entity
      params.paymentStatus = PaymentStatus.Processing;

      // Step 4: Create transaction history
      const txnHistory = new TransactionHistoryEntity();
      const transaction: TransactionHistoryDto = {
        event: YCRampPaymentEventEnum.PAYMENT_PROCESSING,
        transactionId,
        transactionDirection: TransactionDirectionEnum.OUTBOUND,
        assetCode: recipientInfo.assetCode,
        amount: grossCrypto.toString(),
        fee: params.serviceFeeAmountUSD?.toString() ?? '0',
        walletId,
        sourceAddress,
        destinationAddress: recipientInfo.destinationAddress,
        paymentNetwork: recipientInfo.network,
        user,
        paymentStatus: PaymentStatus.Processing,
        transactionType: params.transactionType,
      };

      Object.assign(txnHistory, transaction);

      // Step 5: Persist transaction and history
      // await Promise.all([
      //   this.txnHistoryRepo.save(txnHistory),
      //   this.fiatCryptoRampTransactionRepo.save(
      //     params as FiatCryptoRampTransactionEntity,
      //   ),
      // ]);

      return { success: true };
    } catch (error) {
      this.logger.error(
        `❌ Crypto payout failed for user ${userId}, transaction ${transactionId}: ${error.message}`,
        error.stack,
      );

      // Update transaction status to Failed on error
      params.paymentStatus = PaymentStatus.Failed;
      params.blockchainTxId = params.blockchainTxId ?? 'no-id';
      await this.fiatCryptoRampTransactionRepo.save(
        params as FiatCryptoRampTransactionEntity,
      );

      return {
        success: false,
        error:
          error instanceof CustomHttpException
            ? error.message
            : PaymentErrorEnum.UNKNOWN,
      };
    }
  }

  // FIAT Payout
  async payoutFiat(
    params: FiatCryptoRampTransactionEntity,
  ): Promise<{ success: boolean; txHash?: string }> {
    try {
      //[x] move token from user wallet to treasurer wallet
      const tx: any = null;

      if (!params.providerTransactionId) {
        throw new CustomHttpException(
          PaymentErrorEnum.NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      //[x] check for bank records
      // const acceptResponse = await this.ycService.acceptPaymentRequest({
      //   id: 'd4159747-dbcb-5fd2-992a-5ea7a30f14a2',
      // });

      // console.log({ acceptResponse });

      // const { currency, recipientInfo } = params;

      // //[x] any updates on params and then saved
      // // await this.fiatCryptoRampTransactionRepo.save(params);

      // const notification = await this.notificationGateway.createNotification({
      //   user: params.user,
      //   title: '',
      //   message: '',
      //   data: {
      //     amount: '',
      //     assetCode: '',
      //     txnID: '',
      //     walletID: '',
      //     transactionType: TransactionTypeEnum.CRYPTO_TO_FIAT_WITHDRAWAL,
      //   },
      // });

      // this.notificationGateway.emitNotificationToUser({
      //   token: params.user.alertID,
      //   event: NotificationEventEnum.CRYPTO_TO_FIAT,
      //   status: NotificationStatusEnum.SUCCESS,
      //   data: {
      //     transaction,
      //     notification,
      //   },
      // });
    } catch (error) {
      this.logger.error(
        `❌ Fiat payout failed for user ${params.userId}`,
        error.stack,
      );
      return { success: false };
    }
  }

  async updateRampTransactionHistoryBySequenceId(
    sequenceId: string,
    updates: Partial<FiatCryptoRampTransactionEntity>,
  ): Promise<FiatCryptoRampTransactionEntity> {
    const transaction = await this.fiatCryptoRampTransactionRepo.findOne({
      where: { sequenceId },
    });

    if (!transaction) {
      this.logger.log(`Transaction with sequenceId ${sequenceId} not found`);
    }

    const updatedTransaction = this.fiatCryptoRampTransactionRepo.merge(
      transaction,
      updates,
    );

    return await this.fiatCryptoRampTransactionRepo.save(updatedTransaction);
  }

  shouldSettleDirectly(amount: number): boolean {
    return amount < DIRECT_SETTLEMENT_THRESHOLD;
  }

  async handleActivateYcWebhook() {
    try {
      const webHooks = await this.ycService.listWebhooks();
      console.log(webHooks);
      //       {
      // [1]   webhooks: [
      // [1]     {
      // [1]       partnerId: 'c2119ce9-2ee6-4ba6-9b12-67af1dcba485',
      // [1]       active: true,
      // [1]       updatedAt: '2025-07-11T08:28:33.702Z',
      // [1]       createdAt: '2025-07-11T08:28:33.702Z',
      // [1]       url: 'https://goat-touched-mite.ngrok-free.app/api/yc-payments-hooks',
      // [1]       id: 'b20ac825-8ddf-42e2-8914-01bc3a1b41e6',
      // [1]       state: ''
      // [1]     },
      // [1]     {
      // [1]       partnerId: 'c2119ce9-2ee6-4ba6-9b12-67af1dcba485',
      // [1]       active: true,
      // [1]       updatedAt: '2025-07-11T08:08:31.025Z',
      // [1]       createdAt: '2025-07-11T08:08:31.025Z',
      // [1]       url: 'https://goat-touched-mite.ngrok-free.app/api/payments-hooks',
      // [1]       id: '86c4049a-1395-40fe-b4db-22ca19dbd243',
      // [1]       state: ''
      // [1]     },
      // [1]     {
      // [1]       partnerId: 'c2119ce9-2ee6-4ba6-9b12-67af1dcba485',
      // [1]       active: true,
      // [1]       updatedAt: '2025-06-20T09:51:49.447Z',
      // [1]       createdAt: '2025-06-20T09:51:49.447Z',
      // [1]       url: 'https://webhook.site/9df281f6-0cbd-4e60-a9ab-c01dfe16046a',
      // [1]       id: 'ba1af894-b517-4a57-8364-f6c95cd06c72',
      // [1]       state: ''
      // [1]     },
      // [1]     {
      // [1]       partnerId: 'c2119ce9-2ee6-4ba6-9b12-67af1dcba485',
      // [1]       active: true,
      // [1]       updatedAt: '2025-07-11T08:06:14.505Z',
      // [1]       createdAt: '2025-07-11T08:06:14.505Z',
      // [1]       url: 'https://webhook.site/0f4205a4-00c8-40cc-809a-d3f4b63670a6',
      // [1]       id: '5c56d43a-be5f-4130-bc72-13d5a812552f',
      // [1]       state: ''
      // [1]     }
      // [1]   ]
      // [1] }
      // const response = await this.ycService.removeWebhook({
      //   id: '5c56d43a-be5f-4130-bc72-13d5a812552f',
      // });

      // const az = await this.ycService.createWebhook({
      //   active: true,
      //   url: 'https://goat-touched-mite.ngrok-free.app/api/yc-payments-hooks', //[x] upate payload later
      // });
      // console.log(az);
    } catch (error) {
      console.log(error);
    }
  }

  private readonly inProgressTxnCache = new LRUCache<string, boolean>({
    max: 10000, // Max concurrent keys to track
    ttl: 1000 * 60 * 10, // 10 minutes TTL (auto evict old ones)
  });
}
