import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import {
  BlockchainNetworkSettings,
  DIRECT_SETTLEMENT_THRESHOLD,
  FiatEnum,
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
import { PaymentPartnerEnum } from '@/models/payments.types';
import { walletConfig } from '@/utils/tokenChains';
import {
  FiatCryptoRampTransactionEntity,
  IFiatToCryptoQuoteSummaryResponseDto,
} from '@/utils/typeorm/entities/fiat-crypto-ramp-transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { formatUserWithTiers } from '@/utils/helpers';
import {
  calculateNetCryptoAmount,
  calculateNetFiatAmount,
} from '@/utils/fee.utils';
import {
  PaymentStatus,
  TransactionDirectionEnum,
  TransactionTypeEnum,
  YCPaymentEventEnum,
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
import { ConfigService } from '@/config/config.service';
import { PaymentErrorEnum } from '@/models/payment-error.enum';

//[x] properly throw error using enum
@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly qwalletService: QwalletService,
    private readonly cwalletService: CwalletService,
    private readonly ycService: YellowCardService,
    private readonly ethersService: EtherService,
    private readonly notificationGateway: NotificationsGateway,
    @InjectRepository(FiatCryptoRampTransactionEntity)
    private readonly fiatCryptoRampTransactionRepo: Repository<FiatCryptoRampTransactionEntity>,
    @InjectRepository(TransactionHistoryEntity)
    private readonly txnHistoryRepo: Repository<TransactionHistoryEntity>,
    private readonly configService: ConfigService,
  ) {}

  async handleRates(
    fiatCode: FiatEnum | undefined,
    user: any,
    amount: number, // The amount user wants to convert or transact
  ): Promise<{ rates: any; expiresAt; netFiat; netCrypto } | null> {
    try {
      // Get cached rates for the fiatCode (can be fiat or crypto)
      const cached = await this.ycService.getRateFromCache(fiatCode);

      if (
        !cached ||
        !cached.rate ||
        (Array.isArray(cached.rate) && cached.rate.length === 0)
      ) {
        return null;
      }

      // Format user with tiers, to get fee info
      const userPlain = formatUserWithTiers(user);

      // Helper to format a single rate object
      const formatRate = (rate: IYellowCardRateDto) => ({
        fiatCode: rate.code,
        rate: rate.buy,
      });

      // Format rates array or single object accordingly
      const ratesFormatted = Array.isArray(cached.rate)
        ? cached.rate.map(formatRate)
        : formatRate(cached.rate);

      // Use the first rate for calculations (or adapt as needed)
      const firstRate = Array.isArray(cached.rate)
        ? cached.rate[0]
        : cached.rate;

      // Calculate net fiat amount after fees (assuming your function returns a value)
      const netFiat = await calculateNetFiatAmount(
        amount,
        userPlain.currentTier.txnFee.withdrawal.feePercentage,
        firstRate.buy,
      );

      // Calculate net crypto amount after fees
      const netCrypto = await calculateNetCryptoAmount(
        amount,
        userPlain.currentTier.txnFee.withdrawal.feePercentage,
        firstRate.buy,
      );

      return {
        rates: ratesFormatted,
        expiresAt: cached.expiresAt,
        netFiat,
        netCrypto,
      };
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

  // Crypto to fiat off ramp
  async handleFiatToCryptoOffRamp(
    user: UserEntity,
    dto: FiatToCryptoOnRampRequestDto,
  ): Promise<IFiatToCryptoQuoteSummaryResponseDto> {
    try {
      // Fetch fiat rate from cache
      const fiatRate = await this.ycService.getRateFromCache(
        dto.fiatCode.toUpperCase(),
      );
      if (!fiatRate?.rate) {
        throw new CustomHttpException(
          PaymentErrorEnum.RATES_NOT_YET_ACTIVE,
          HttpStatus.FORBIDDEN,
        );
      }

      const [cwallet, qwallet] = await Promise.all([
        this.cwalletService.lookupSubWallet(dto.destinationAddress),
        this.qwalletService.lookupSubWallet(dto.destinationAddress),
      ]);

      if (!cwallet && !qwallet)
        throw new CustomHttpException(
          WalletErrorEnum.MISSING_WALLET_ID,
          HttpStatus.NOT_FOUND,
        );

      // Prepare user data with tiers
      const userPlain = formatUserWithTiers(user);

      // Fetch active channels and networks
      const { channels } = await this.ycService.getChannels();
      const { networks } = await this.ycService.getNetworks();

      const activeChannels = channels.filter(
        (c) => c.status === 'active' && c.rampType === 'deposit',
      );

      // Check if user's country is supported
      const supportedCountries = Array.from(
        new Set(activeChannels.map((c) => c.country)),
      );
      if (!supportedCountries.includes(dto.country.toUpperCase())) {
        throw new CustomHttpException(
          PaymentErrorEnum.COUNTRY_NOT_ACTIVE,
          HttpStatus.FORBIDDEN,
        );
      }

      // Use the first active channel and its supported network
      const channel = activeChannels[0];
      const supportedNetworks = networks.filter(
        (n) => n.status === 'active' && n.channelIds.includes(channel.id),
      );
      const network = supportedNetworks[0]; // Not currently used but could be extended

      // Format user KYC date of birth safely (MM/DD/YYYY)
      const userKycData = { ...userPlain.kyc };
      if (userKycData.dob) {
        const [year, month, day] = userKycData.dob.split('-');
        userKycData.dob = `${month}/${day}/${year}`;
      }

      // Prepare recipient info
      const recipient = {
        name: `${userKycData.firstName} ${userKycData.lastName}`,
        country: dto.country.toUpperCase(),
        phone: userKycData.phone ?? '+2341111111111',
        address: userKycData.address,
        dob: userKycData.dob,
        email: userPlain.email,
        idNumber: userKycData.idNumber,
        idType: userKycData.idTypes[0],
        additionalIdType: userKycData.idTypes[1],
        additionalIdNumber: userKycData.bvn,
      };

      // Unique transaction sequence ID
      const sequenceId = uuidV4();

      // Submit a temporary request just to get the rate and reference info
      const tempRateRequest = {
        sequenceId,
        channelId: channel.id,
        currency: channel.currency,
        country: channel.country,
        reason: dto.paymentReason,
        localAmount: dto.userAmount,
        recipient,
        forceAccept: true,
        source: { accountType: 'bank' },
        // source: {
        //   accountNumber: '+2341111111111',
        //   accountType: 'bank',
        //   networkId: '20823163-f55c-4fa5-8cdb-d59c5289a137',
        // },
        customerType: userPlain.kyc.customerType,
        customerUID: userPlain.uid.toString(),
      };

      const yellowCardResponse =
        await this.ycService.submitCollectionRequest(tempRateRequest);

      // Calculate fees and net crypto amount
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

      const serviceFeeAmountUsd = parseFloat(
        (feeAmount / fiatRate.rate.buy).toFixed(2),
      );

      //[x] implement reduced kyc for transactions less than $20

      // Create new transaction entity
      const newTxn = new FiatCryptoRampTransactionEntity();
      newTxn.user = user;
      newTxn.userId = user.id;
      newTxn.sequenceId = sequenceId;
      newTxn.channelId = channel.id;
      newTxn.transactionType = TransactionTypeEnum.FIAT_TO_CRYPTO_WITHDRAWAL;
      newTxn.paymentStatus = PaymentStatus.Processing;
      newTxn.providerReference = yellowCardResponse.reference;
      newTxn.providerTransactionId = yellowCardResponse.id;
      newTxn.providerDepositId = yellowCardResponse.depositId;
      newTxn.customerType = userPlain.kyc.customerType;
      newTxn.paymentReason = dto.paymentReason;

      newTxn.userAmount = dto.userAmount; // original fiat amount
      newTxn.netFiatAmount = netFiatAmount; // fiat after adding/removing fees
      newTxn.netCryptoAmount = netCryptoAmount;
      newTxn.feeLabel = feeLabel; // e.g. "2.00%"
      newTxn.serviceFeeAmountLocal = feeAmount; // fee in fiat (local currency)
      newTxn.serviceFeeAmountUSD = serviceFeeAmountUsd; // fee converted to USD

      newTxn.rate = fiatRate.rate.buy;
      newTxn.grossCrypto = grossCrypto;

      newTxn.fiatCode = dto.fiatCode;
      newTxn.currency = channel.currency;
      newTxn.country = dto.country;

      newTxn.paymentProvider = PaymentPartnerEnum.YELLOWCARD;
      newTxn.bankInfo = {
        bankName: yellowCardResponse.bankInfo.name,
        accountNumber: yellowCardResponse.bankInfo.accountNumber,
        accountHolder: yellowCardResponse.bankInfo.accountName,
      };
      newTxn.recipientInfo = {
        destinationAddress: dto.destinationAddress,
        network: dto.network,
        assetCode: dto.assetCode,
      };
      newTxn.expiresAt = yellowCardResponse.expiresAt;

      // Save the transaction
      const fctTxn = await this.fiatCryptoRampTransactionRepo.save(newTxn);

      // Return the formatted response DTO
      return plainToInstance(
        IFiatToCryptoQuoteSummaryResponseDto,
        {
          userAmount: dto.userAmount,
          feeLabel,
          serviceFeeAmountLocal: feeAmount,
          serviceFeeAmountUsd,
          netFiatAmount,
          netCryptoAmount,
          rate: fiatRate.rate.buy,
          grossCrypto,
          bankInfo: fctTxn.bankInfo,
          recipientInfo: fctTxn.recipientInfo,
          expiresAt: yellowCardResponse.expiresAt,
        },
        { excludeExtraneousValues: true },
      );
    } catch (error) {
      this.logger.error('handleCryptoToFiatOnRamp failed', error);
      throw error;
    }
  }

  // Crypto to fiat off ramp
  async handleCryptotoFiatOffRamp(
    user: UserEntity,
    dto: RequestCryptoOffRampPaymentDto,
  ) {
    const fiatRate = await this.ycService.getRateFromCache(
      dto.fiatCode.toUpperCase(),
    );

    if (!fiatRate.rate)
      throw new CustomHttpException(
        PaymentErrorEnum.RATES_NOT_YET_ACTIVE,
        HttpStatus.FORBIDDEN,
      );

    const networkInfo = BlockchainNetworkSettings[dto.network];

    const userPlain = formatUserWithTiers(user);

    const [cwallet, qwallet] = await Promise.all([
      this.cwalletService.lookupSubWallet(dto.sourceAddress),
      this.qwalletService.lookupSubWallet(dto.sourceAddress),
    ]);

    if (!cwallet && !qwallet)
      throw new CustomHttpException(
        WalletErrorEnum.MISSING_WALLET_ID,
        HttpStatus.NOT_FOUND,
      );

    const sourceAddress =
      cwallet?.networkMetadata[dto.network].address ??
      qwallet?.networkMetadata[dto.network].address;

    if (!sourceAddress)
      throw new CustomHttpException(
        WalletErrorEnum.WALLET_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );

    //[x] check balance of source address
    //[x] validate treasurer address

    const withdrawCryptoPayload = {
      assetCode: dto.assetCode,
      amount: dto.userAmount.toString(),
      network: dto.network,
      sourceAddress,
      fund_uid: networkInfo.treasuryAddress,
      transaction_note: dto.paymentReason,
      narration: dto.paymentReason,
    };

    //[x] remove comment for sending
    // const withdrawResponse = await this.handleWithdrawCryptoPayment(
    //   withdrawCryptoPayload,
    // );

    // if (!withdrawResponse.id) {
    //   throw new CustomHttpException(
    //     WalletErrorEnum.CREATE_WITHDRAWAL_FAILED,
    //     HttpStatus.INTERNAL_SERVER_ERROR,
    //   );
    // }

    const { channels } = await this.ycService.getChannels();
    const { networks } = await this.ycService.getNetworks();

    let activeChannels = channels.filter(
      (c) =>
        c.status === 'active' &&
        c.apiStatus === 'active' &&
        c.rampType === 'withdraw',
    );
    let supportedCountries = [...new Set(activeChannels.map((c) => c.country))];

    // Select channel
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

    // country: dto.country.toUpperCase(),
    const sender = {
      name: `${userPlain.kyc.firstName} ${userPlain.kyc.lastName}`,
      country: 'NGN',
      phone: userKycData.phone ?? '+2341111111111',
      dob: userKycData.dob,
      email: userPlain.email,
      idNumber: userKycData.idNumber,
      idType: userKycData.idTypes[0],
    };

    // const destination = {
    //   accountNumber: dto.bankInfo.accountNumber,
    //   accountType: network.accountNumberType,
    //   country: network.country,
    //   networkId: network.id,
    //   accountBank: network.code,
    // } as any;

    const { grossFiat, feeAmount, feeLabel, netFiatAmount, netCryptoAmount } =
      await calculateNetFiatAmount(
        dto.userAmount,
        userPlain.currentTier.txnFee.withdrawal.feePercentage,
        fiatRate.rate.buy,
      );

    const destination = {
      accountName: 'Regina Phalenge',
      accountNumber: '0000000000',
      accountType: 'bank',
      networkId: '5f1af11b-305f-4420-8fce-65ed2725a409',
    };

    const sequenceId = uuidV4();

    let { accountName } = await this.ycService.resolveBankAccount({
      accountNumber: destination.accountNumber,
      networkId: destination.networkId,
    });

    destination.accountName = accountName;

    let request = {
      sequenceId: sequenceId,
      channelId: channel.id,
      currency: channel.currency,
      country: channel.country,
      localAmount: netFiatAmount,
      reason: dto.paymentReason,
      destination,
      sender,
      forceAccept: false,
      customerUID: userPlain.uid.toString(),
    };

    const yellowCardResponse =
      await this.ycService.submitPaymentRequest(request);

    const serviceFeeAmountUsd = parseFloat(
      (feeAmount / fiatRate.rate.sell).toFixed(2),
    );

    // Assign to entity
    const newTxn = new FiatCryptoRampTransactionEntity();
    newTxn.user = user;
    newTxn.userId = user.id;
    newTxn.sequenceId = sequenceId;
    newTxn.channelId = channel.id;
    newTxn.transactionType = TransactionTypeEnum.CRYPTO_TO_FIAT_WITHDRAWAL;
    newTxn.paymentStatus = PaymentStatus.Processing;
    newTxn.providerTransactionId = yellowCardResponse.id;
    newTxn.customerType = userPlain.kyc.customerType;
    newTxn.userAmount = dto.userAmount; // original fiat amount
    newTxn.netFiatAmount = netFiatAmount; // fiat after adding/removing fees
    newTxn.feeLabel = feeLabel; // e.g. "2.00%"
    newTxn.serviceFeeAmountLocal = feeAmount; // fee in fiat (local currency)
    newTxn.serviceFeeAmountUSD = serviceFeeAmountUsd; // fee converted to USD
    newTxn.grossFiat = grossFiat;
    newTxn.netCryptoAmount = netCryptoAmount;
    newTxn.rate = fiatRate.rate.sell;
    newTxn.fiatCode = dto.fiatCode;
    newTxn.currency = channel.currency;
    newTxn.country = dto.country;
    newTxn.paymentProvider = PaymentPartnerEnum.YELLOWCARD;
    newTxn.sourceAddress = dto.sourceAddress;
    // newTxn.blockchainTxId =  withdrawResponse.blockchainTxId ?? ''
    newTxn.blockchainTxId = 'blockchain-tx-id';
    newTxn.bankInfo = {
      bankName: dto.bankInfo.bankName,
      accountNumber: dto.bankInfo.accountNumber,
      accountHolder: dto.bankInfo.accountHolder,
      networkId: yellowCardResponse.destination.networkId,
      accountBank: yellowCardResponse.destination.accountBank,
      networkName: yellowCardResponse.destination.networkName,
    };
    newTxn.recipientInfo = {
      destinationAddress: networkInfo.treasuryAddress,
      sourceAddress: dto.sourceAddress,
      network: dto.network,
      assetCode: dto.assetCode,
    };
    newTxn.expiresAt = yellowCardResponse.expiresAt;

    await this.fiatCryptoRampTransactionRepo.save(newTxn);

    return plainToInstance(
      IFiatToCryptoQuoteSummaryResponseDto,
      {
        userAmount: dto.userAmount,
        feeLabel,
        serviceFeeAmountLocal: feeAmount,
        serviceFeeAmountUsd,
        rate: fiatRate.rate.buy,
        netFiatAmount,
        netCryptoAmount,
        grossFiat,
        expiresAt: yellowCardResponse.expiresAt,
        bankInfo: dto.bankInfo,
        recipientInfo: newTxn.recipientInfo,
      },
      { excludeExtraneousValues: true },
    );
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

  async payoutCrypto(params: FiatCryptoRampTransactionEntity) {
    try {
      const { recipientInfo, grossCrypto, userId, user } = params;

      const [cwallet, qwallet] = await Promise.all([
        this.cwalletService.lookupSubWallet(recipientInfo.destinationAddress),
        this.qwalletService.lookupSubWallet(recipientInfo.destinationAddress),
      ]);

      if (!cwallet && !qwallet) {
        this.logger.warn(
          `❗ No wallet found for address ${recipientInfo.destinationAddress} - skipping payout.`,
        );
        return;
      }

      //[x] check balance of treasurer

      const tx = await this.ethersService.transferToken({
        to: recipientInfo.destinationAddress,
        amount: grossCrypto.toString(),
        assetCode: recipientInfo.assetCode,
        chain: recipientInfo.network,
      });

      // Update transaction entity status
      params.paymentStatus = PaymentStatus.Complete;

      // Create transaction history
      const txnHistory = new TransactionHistoryEntity();
      const walletId =
        qwallet?.profile?.qid ?? cwallet?.profile?.walletSetId ?? null;

      if (!walletId) {
        this.logger.warn(`⚠️ Wallet found but no wallet ID for user ${userId}`);
      }

      const transaction: TransactionHistoryDto = {
        event: YCPaymentEventEnum.COLLECTION_COMPLETE,
        transactionId: params.id,
        transactionDirection: TransactionDirectionEnum.INBOUND,
        assetCode: recipientInfo.assetCode,
        amount: grossCrypto.toString(),
        fee: params.serviceFeeAmountUSD.toString(),
        blockchainTxId: tx.txHash,
        walletId,
        sourceAddress: tx.sourceAddress,
        destinationAddress: recipientInfo.destinationAddress,
        paymentNetwork: recipientInfo.network,
        user,
        paymentStatus: PaymentStatus.Accepted,
        transactionType: TransactionTypeEnum.CRYPTO_DEPOSIT,
      };

      Object.assign(txnHistory, transaction);

      // await this.txnHistoryRepo.save(txnHistory);
      //[x] any updates on params and then saved
      // await this.fiatCryptoRampTransactionRepo.save(params);

      const notification = await this.notificationGateway.createNotification({
        user: params.user,
        title: '',
        message: '',
        data: {
          amount: '',
          assetCode: '',
          txnID: '',
          walletID: '',
          transactionType: TransactionTypeEnum.FIAT_TO_CRYPTO_DEPOSIT,
        },
      });

      this.notificationGateway.emitNotificationToUser({
        token: params.user.alertID,
        event: NotificationEventEnum.CRYPTO_TO_FIAT,
        status: NotificationStatusEnum.SUCCESS,
        data: {
          transaction,
          notification,
        },
      });
      // this.logger.log(`✅ Crypto payout successful for user ${userId}`);

      return { success: true, txHash: tx.txHash };
    } catch (error) {
      this.logger.error(
        `❌ Crypto payout failed for user ${params.userId}: ${error.message}`,
        error.stack,
      );
      return { success: false, error: error.message };
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
      console.log({ id: params.providerTransactionId });

      //[x] check for bank records
      // const acceptResponse = await this.ycService.acceptPaymentRequest({
      //   id: params.providerTransactionId,
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

  async updateTransactionBySequenceId(
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
      // const webHooks = await this.ycService.listWebhooks();
      // console.log({ webHooks });
      // const az = await this.ycService.createWebhook({
      //   active: true,
      //   url: 'https://goat-touched-mite.ngrok-free.app/api/yc-payments-hooks', //[x] upate payload later
      // });
      // console.log(az);
    } catch (error) {
      console.log(error);
    }
  }
}
