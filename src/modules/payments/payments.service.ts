import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import {
  BASIS_POINTS_DIVISOR,
  BlockchainNetworkSettings,
  DIRECT_SETTLEMENT_THRESHOLD,
  FiatEnum,
  ONE_DAY_LATER,
  PAYMENT_PROVIDER_PRIORITY,
  RAMP_BALANCES,
  SupportedWalletTypes,
  WalletProviderEnum,
} from '@/config/settings';
import { CreateCryptoWithdrawPaymentDto } from './dto/create-withdraw-crypto.dto';
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
  flexiTruncate,
  formatUserWithTiers,
  isDev,
  toLowestDenomination,
  toUTCDate,
  validateOffRampRequest,
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
import { TransactionHistoryDto } from '../transaction-history/dto/create-transaction-history.dto';
import { QWalletsEntity } from '@/utils/typeorm/entities/wallets/qwallet/qwallets.entity';
import { CwalletsEntity } from '@/utils/typeorm/entities/wallets/cwallet/cwallet.entity';
import { WalletErrorEnum } from '@/models/wallet-manager.types';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { PaymentErrorEnum } from '@/models/payment-error.enum';
import { MapleradService } from './maplerad.service';
import { TransactionHistoryService } from '../transaction-history/transaction-history.service';
import { YCTxnAccountTypes } from '@/models/yellow-card.types';
import { LRUCache } from 'lru-cache';
import { ICreateMalperadFiatWithdrawPaymentDto } from './dto/create-withdraw-fiat.dto';
import {
  ITransactionHistoryDto,
  TransactionHistoryEntity,
} from '@/utils/typeorm/entities/transactions/transaction-history.entity';
import { TransactionsService } from '../transactions/transactions.service';
import { DevicesService } from '../devices/devices.service';
import { RampTransactionMessage } from '@/models/ramp-types';
import { IMapleradTransferResponseDto } from '@/models/maplerad.types';
import { findDynamic, FindDynamicOptions } from '@/utils/DynamicSource';

//[x] properly throw error using enum
@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly qwalletService: QwalletService,
    private readonly cwalletService: CwalletService,
    private readonly ycService: YellowCardService,
    @InjectRepository(FiatCryptoRampTransactionEntity)
    private readonly fiatCryptoRampTransactionRepo: Repository<FiatCryptoRampTransactionEntity>,
    private readonly dataSource: DataSource,
    private readonly mapleradService: MapleradService,
    private readonly transactionHistoryService: TransactionHistoryService,
    private readonly transactionService: TransactionsService,
    private readonly deviceService: DevicesService,
  ) {}

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

  async getAllUserRampTransactions({ page, limit }, userId: string) {
    try {
      const options: FindDynamicOptions & { where?: { [key: string]: any } } = {
        page,
        limit,
        selectFields: [
          'id',
          'expiresAt',
          'netFiatAmount',
          'netCryptoAmount',
          'mainAssetAmount',
          'mainFiatAmount',
          'feeLabel',
          'serviceFeeAmountLocal',
          'serviceFeeAmountUSD',
          'rate',
          'grossCrypto',
          'grossFiat',
          'recipientInfo',
          'bankInfo',
          'blockchainTxId',
          'seen',
          'paymentStatus',
          'transactionType',
          'createdAt',
          'paymentReason',
          'transactionMessage',
        ],
        sortBy: [{ field: 'createdAt', order: 'DESC' }],
      };

      // Add userId filter if provided
      if (userId) {
        options.where = { 'user.id': userId };
        options.joinRelations = [{ relation: 'user' }]; // Join user relation
      }

      const result = await findDynamic(
        this.fiatCryptoRampTransactionRepo,
        options,
      );
      return result;
    } catch (error) {
      console.error('Error in getAllUserTransactions:', error);
      throw error;
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

  async handleFiatToCryptoOnRamp(
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
        address: userKycData.address ?? '',
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

      const transactionMessage = `${RampTransactionMessage.REQUEST_CRYPTO} ${dto.assetCode.toUpperCase()}`;

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
            assetCode: dto.assetCode,
            network: dto.network,
          },
          expiresAt: yellowCardResponse.expiresAt,
          transactionMessage,
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
        transactionMessage,
      };

      const { user: _user, ...transaction } =
        await this.transactionHistoryService.create(txnData, user);

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
          transaction,
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
    const { valid } = validateOffRampRequest(dto);

    if (!valid)
      throw new CustomHttpException(
        WalletErrorEnum.BALANCE_LOW,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

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

      const mpBalance =
        (await this.mapleradService.checkLiquidity(dto.fiatCode))
          .available_balance / 100;

      //[x] calcualte the normal amount
      if (mpBalance <= RAMP_BALANCES[dto.fiatCode.toUpperCase()].amount) {
        throw new CustomHttpException(
          WalletErrorEnum.MAPLERAD_BALANCE_LOW,
          HttpStatus.INTERNAL_SERVER_ERROR,
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
          fiatRate.rate.sell,
        );

      const bank = findBankByName(dto.bankInfo.bankName);
      if (!bank) {
        throw new CustomHttpException('Bank not found', HttpStatus.BAD_REQUEST);
      }

      // Step 1: Transfer crypto from user wallet to treasury address
      let cryptoTxResult: {
        success: boolean;
        transactionHistory?: TransactionHistoryDto;
      };
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
          customerType: userPlain.kyc.customerType,
        });
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

      if (!cryptoTxResult.success)
        throw new CustomHttpException(
          'Crypto transaction unsuccessful',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );

      const transactionMessage = `${RampTransactionMessage.CASH_OUT_CRYPTO} ${dto.assetCode.toUpperCase()}`;

      // Step 2: Create transaction entity
      const newTxn = new FiatCryptoRampTransactionEntity();
      newTxn.user = user;
      newTxn.userId = user.id;
      newTxn.sequenceId = sequenceId;
      newTxn.channelId = channel.id;
      newTxn.transactionType = TransactionTypeEnum.CRYPTO_TO_FIAT_WITHDRAWAL;
      newTxn.paymentStatus = PaymentStatus.Processing;
      newTxn.customerType = userPlain.kyc.customerType;
      newTxn.userAmount = netFiatAmount;
      newTxn.netFiatAmount = netFiatAmount;
      newTxn.grossFiat = grossFiat;
      newTxn.netCryptoAmount = netCryptoAmount;
      newTxn.mainAssetAmount = dto.mainAssetAmount;
      newTxn.rate = fiatRate.rate.sell;
      newTxn.fiatCode = dto.fiatCode;
      newTxn.currency = channel.currency;
      newTxn.country = dto.country;
      newTxn.sourceAddress = dto.sourceAddress;
      newTxn.blockchainTxId = cryptoTxResult.transactionHistory.blockchainTxId;
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
      newTxn.transactionMessage = transactionMessage;

      // Step 3: Attempt fiat payout with prioritized providers
      let payoutResponse: IMapleradTransferResponseDto;
      let paymentProvider;

      const bankInfoAndCode = findBankByName(dto.bankInfo.bankName);

      await this.mapleradService.resolveInstitutionAccount({
        account_number: dto.bankInfo.accountNumber,
        bank_code: bankInfoAndCode.code,
      });

      isDev &&
        this.logger.log(
          `Processing crypto payout for user ${user.id}, wallet: ${wallet.id}, asset: ${newTxn.recipientInfo.assetCode}, amount: ${netFiatAmount}`,
        );

      const payoutServices = [
        {
          name: PaymentPartnerEnum.MAPLERAD,
          execute: async () => {
            const response = await this.mapleradService.localTransferAfrica({
              bank_code: bankInfoAndCode.code,
              account_number: dto.bankInfo.accountNumber,
              amount: toLowestDenomination(netFiatAmount),
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

          newTxn.providerTransactionId = payoutResponse.data.id;
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
          isDev &&
            this.logger.log(`Fiat payout succeeded with ${service.name}`);
          break;
        } catch (error) {
          this.inProgressTxnCache.delete(sequenceId);
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
        fee: flexiTruncate(newTxn.serviceFeeAmountUSD, 4).toString(),
        blockchainTxId: cryptoTxResult.transactionHistory.blockchainTxId,
        walletId: wallet.id,
        sourceAddress: dto.sourceAddress,
        destinationAddress: networkInfo.treasuryAddress,
        paymentNetwork: dto.network,
        user,
        paymentStatus: newTxn.paymentStatus,
        transactionType: TransactionTypeEnum.CRYPTO_TO_FIAT_WITHDRAWAL,
        rampID: rampTxn.id,
        mainAssetAmount: rampTxn.mainAssetAmount,
        transactionMessage: rampTxn.transactionMessage,
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
          bankInfo: dto.bankInfo,
          recipientInfo: newTxn.recipientInfo,
          seen: false,
          paymentStatus: rampTxn.paymentStatus,
          transactionType: TransactionTypeEnum.CRYPTO_TO_FIAT_WITHDRAWAL,
          createdAt: rampTxn.createdAt,
          mainAssetAmount: rampTxn.mainAssetAmount,
          transactionMessage: rampTxn.transactionMessage,
          transaction,
        },
        { excludeExtraneousValues: true },
      );
    } catch (err) {
      console.log(err);
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
    createRampHistory: boolean = false,
  ): Promise<{
    success: boolean;
    transactionHistory?: TransactionHistoryDto;
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

    // Input validation (re-enabled from commented-out code)
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

    // Validate asset and network (re-enabled from commented-out code)
    if (!recipientInfo.assetCode) {
      this.logger.error(`Invalid asset code for transaction ${transactionId}`);
      throw new CustomHttpException(
        PaymentErrorEnum.UNSUPPORTED_ASSET,
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!recipientInfo.network) {
      this.logger.error(`Invalid network for transaction ${transactionId}`);
      throw new CustomHttpException(
        PaymentErrorEnum.NETWORK_NOT_SUPPORTED,
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      // Step 1: Lookup wallets
      const [cwallet, qwallet] = await Promise.all([
        this.cwalletService.lookupSubWallet(sourceAddress),
        this.qwalletService.lookupSubWallet(sourceAddress),
      ]);

      if (!cwallet && !qwallet) {
        const errorMsg = `No wallet found for address ${sourceAddress}`; // Fixed typo: recipientInfo.sourceAddress
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

      // Step 2: Create crypto withdrawal
      const cryptoPaymentObj: CreateCryptoWithdrawPaymentDto = {
        assetCode: recipientInfo.assetCode,
        amount: userAmount.toString(),
        network: recipientInfo.network,
        sourceAddress,
        fund_uid: recipientInfo.destinationAddress,
      };

      let txResult: ITransactionHistoryDto;
      try {
        if (cwallet) {
          txResult = await this.cwalletService.createCryptoWithdrawal(
            cryptoPaymentObj,
            cwallet,
          );
        } else if (qwallet) {
          txResult = await this.qwalletService.createCryptoWithdrawal(
            cryptoPaymentObj,
            qwallet,
          );
        }
      } catch (error) {
        throw new CustomHttpException(error.message, HttpStatus.BAD_REQUEST);
      }

      if (!txResult) {
        throw new CustomHttpException(
          PaymentErrorEnum.WITHDRAWAL_TRANSACTION_FAILED,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      // Revenue tracker for crypto payout
      await this.transactionService.createTransaction(
        {
          transactionType: TransactionTypeEnum.CRYPTO_WITHDRAWAL,
          fiatAmount: txResult.mainFiatAmount ?? 0,
          cryptoAmount: txResult.mainAssetAmount ?? 0,
          cryptoAsset: txResult.assetCode,
          fiatCurrency: params.fiatCode,
          paymentStatus: params.paymentStatus,
          paymentReason: params.paymentReason,
        },
        user,
      );

      // Step 3: Update transaction entity
      params.paymentStatus = PaymentStatus.Processing;

      // Step 5: Save transaction history and update transaction entity
      if (createRampHistory) {
        await Promise.all([
          this.fiatCryptoRampTransactionRepo.save(
            params as FiatCryptoRampTransactionEntity,
          ),
        ]);
      }

      return { success: true, transactionHistory: txResult };
    } catch (error) {
      this.logger.error(
        `❌ Crypto payout failed for user ${userId}, transaction ${transactionId}: ${error.message}`,
        error.stack,
      );
      // // Update transaction status to Failed on error
      // params.paymentStatus = PaymentStatus.Failed;
      // params.blockchainTxId = params.blockchainTxId ?? 'no-id';
      // await this.fiatCryptoRampTransactionRepo.save(
      //   params as FiatCryptoRampTransactionEntity,
      // );
      // return {
      //   success: false,
      //   error:
      //     error instanceof CustomHttpException
      //       ? error.message
      //       : PaymentErrorEnum.UNKNOWN,
      //   transactionHistory: null,
      // };
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

  async findDynamicRampTransactions(options?: {
    page?: number;
    limit?: number;
    selectFields?: string[];
    joinRelations?: { relation: string; selectFields?: string[] }[];
    sortBy?: string[]; // NEW: array of fields to sort by
  }): Promise<{
    data: FiatCryptoRampTransactionEntity[];
    total: number;
    page: number;
    lastPage: number;
  }> {
    try {
      const page = options?.page ?? 1;
      const limit = options?.limit ?? 10;
      const offset = (page - 1) * limit;

      const query =
        this.fiatCryptoRampTransactionRepo.createQueryBuilder('ramp');

      // Default fields
      const defaultFields = ['ramp.id'];
      const fieldsToSelect =
        options?.selectFields?.map((f) => `ramp.${f}`) ?? defaultFields;
      query.select(fieldsToSelect);

      // Track joined aliases to prevent duplicate joins
      const joined = new Set<string>();

      // Handle joinRelations
      options?.joinRelations?.forEach((joinOption) => {
        const parts = joinOption.relation.split('.');
        let parentAlias = 'ramp';

        parts.forEach((part, index) => {
          const alias = parts.slice(0, index + 1).join('_');

          if (!joined.has(alias)) {
            query.leftJoin(`${parentAlias}.${part}`, alias); // use leftJoin only first
            joined.add(alias);
          }

          // If specific fields for this relation are provided
          if (index === parts.length - 1 && joinOption.selectFields?.length) {
            const selectFields = joinOption.selectFields.map(
              (f) => `${alias}.${f}`,
            );
            query.addSelect(selectFields);
          } else {
            query.addSelect(alias); // include all by default if no selectFields
          }

          parentAlias = alias;
        });
      });

      // Pagination
      query.skip(offset).take(limit);

      // Sorting
      if (options?.sortBy?.length) {
        options.sortBy.forEach((field) => {
          query.addOrderBy(`ramp.${field}`, 'DESC'); // you can make 'ASC' dynamic if needed
        });
      } else {
        query.addOrderBy('ramp.createdAt', 'DESC'); // default sort
      }

      const [items, total] = await query.getManyAndCount();

      return {
        data: items,
        total,
        page,
        lastPage: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error('Error fetching ramp transactions:', error);
      throw error;
    }
  }

  async findRampTransactionByIdOrSequenceId(
    identifier: string,
    options?: {
      selectFields?: string[];
      joinRelations?: { relation: string; selectFields?: string[] }[];
    },
  ): Promise<FiatCryptoRampTransactionEntity | null> {
    try {
      const query =
        this.fiatCryptoRampTransactionRepo.createQueryBuilder('ramp');

      // Default fields if none provided
      const defaultFields = ['ramp.id', 'ramp.sequenceId', 'ramp.createdAt'];
      const fieldsToSelect =
        options?.selectFields?.map((f) => `ramp.${f}`) ?? defaultFields;
      query.select(fieldsToSelect);

      // Track joined aliases
      const joined = new Set<string>();

      // Handle dynamic joins
      options?.joinRelations?.forEach((joinOption) => {
        const parts = joinOption.relation.split('.');
        let parentAlias = 'ramp';

        parts.forEach((part, index) => {
          const alias = parts.slice(0, index + 1).join('_');

          if (!joined.has(alias)) {
            query.leftJoin(`${parentAlias}.${part}`, alias);
            joined.add(alias);
          }

          if (index === parts.length - 1 && joinOption.selectFields?.length) {
            const selectFields = joinOption.selectFields.map(
              (f) => `${alias}.${f}`,
            );
            query.addSelect(selectFields);
          } else {
            query.addSelect(alias);
          }

          parentAlias = alias;
        });
      });

      // Lookup condition (by id OR sequenceId)
      query.where('ramp.id = :identifier OR ramp.sequenceId = :identifier', {
        identifier,
      });

      return await query.getOne();
    } catch (error) {
      this.logger.error(
        'Error fetching ramp transaction by id/sequenceId:',
        error,
      );
      throw error;
    }
  }

  private readonly inProgressTxnCache = new LRUCache<string, boolean>({
    max: 10000, // Max concurrent keys to track
    ttl: 1000 * 60 * 10, // 10 minutes TTL (auto evict old ones)
  });
}
