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
import { IdTypeEnum } from '@/models/kyc.types';
import { CustomHttpException } from '@/middleware/custom.http.exception';
import { PaymentErrorEnum, PaymentPartnerEnum } from '@/models/payments.types';
import { walletConfig } from '@/utils/tokenChains';
import { FiatCryptoRampTransactionEntity } from '@/utils/typeorm/entities/fiat-crypto-ramp-transaction.entity';
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
import { IFiatToCryptoQuoteResponseDto } from './dto/payment.dto';
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
  ) {}

  async handleRates(fiatCode: FiatEnum | undefined): Promise<any> {
    try {
      const cached = await this.ycService.getRateFromCache(fiatCode);

      if (
        !cached ||
        !cached.rate ||
        (Array.isArray(cached.rate) && cached.rate.length === 0)
      ) {
        return null;
      }

      const formatRate = (rate: IYellowCardRateDto) => ({
        fiatCode: rate.code,
        rate: rate.buy,
      });

      const ratesFormatted = Array.isArray(cached.rate)
        ? cached.rate.map(formatRate)
        : formatRate(cached.rate);

      return {
        rates: ratesFormatted,
        expiresAt: cached.expiresAt,
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

  // Crypto to fiat on ramp
  async handleFiatToCryptoOnRamp(
    user: UserEntity,
    dto: FiatToCryptoOnRampRequestDto,
  ): Promise<IFiatToCryptoQuoteResponseDto> {
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
        customerUID: userPlain.uid,
      };

      const yellowCardResponse =
        await this.ycService.submitCollectionRequest(tempRateRequest);

      // Calculate fees and net crypto amount
      const { adjustedNaira, feeAmount, feeLabel, grossCrypto } =
        calculateNetCryptoAmount(
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
      newTxn.transactionType = TransactionTypeEnum.FIAT_TO_CRYPTO_DEPOSIT;
      newTxn.paymentStatus = PaymentStatus.Processing;
      newTxn.providerReference = yellowCardResponse.reference;
      newTxn.providerTransactionId = yellowCardResponse.id;
      newTxn.providerDepositId = yellowCardResponse.depositId;
      newTxn.customerType = userPlain.kyc.customerType;
      newTxn.paymentReason = dto.paymentReason;

      newTxn.userAmount = dto.userAmount; // original fiat amount
      newTxn.adjustedFiatAmount = adjustedNaira; // fiat after adding/removing fees
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
        destnationAddress: dto.destinationAddress,
        network: dto.network,
        assetCode: dto.assetCode,
      };
      newTxn.expiresAt = yellowCardResponse.expiresAt;

      // Save the transaction
      const fctTxn = await this.fiatCryptoRampTransactionRepo.save(newTxn);

      // Return the formatted response DTO
      return plainToInstance(
        IFiatToCryptoQuoteResponseDto,
        {
          userAmount: dto.userAmount,
          feeLabel,
          serviceFeeAmountLocal: feeAmount,
          serviceFeeAmountUsd,
          adjustedFiatAmount: adjustedNaira,
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

    const userPlain = formatUserWithTiers(user);

    //[x] get user wallet info
    const [cwallet, qwallet] = await Promise.all([
      this.cwalletService.lookupSubWallet(dto.sourceAddress),
      this.qwalletService.lookupSubWallet(dto.sourceAddress),
    ]);

    if (!cwallet && !qwallet)
      throw new CustomHttpException(
        WalletErrorEnum.MISSING_WALLET_ID,
        HttpStatus.NOT_FOUND,
      );

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

    const sender = {
      name: `${userPlain.kyc.firstName} ${userPlain.kyc.lastName}`,
      country: dto.country.toUpperCase(),
      phone: userKycData.phone ?? '+2341111111111',
      address: userKycData.address,
      dob: userKycData.dob,
      email: userPlain.email,
      idNumber: userKycData.idNumber,
      idType: userKycData.idTypes[0],
    };

    const destination = {
      accountNumber: dto.bankInfo.accountNumber,
      accountType: network.accountNumberType,
      country: network.country,
      networkId: network.id,
      accountBank: network.code,
    } as any;

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
      localAmount: dto.userAmount,
      reason: dto.paymentReason,
      destination,
      sender,
      forceAccept: false,
      customerUID: userPlain.uid,
    };

    const yellowCardResponse =
      await this.ycService.submitPaymentRequest(request);

    const { grossFiat, feeAmount, feeLabel, netFiatAmount } =
      calculateNetFiatAmount(
        dto.userAmount,
        userPlain.currentTier.txnFee.withdrawal.feePercentage,
        fiatRate.rate.buy,
      );

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
    newTxn.providerReference = yellowCardResponse.reference;
    newTxn.providerTransactionId = yellowCardResponse.id;
    newTxn.providerDepositId = yellowCardResponse.depositId;
    newTxn.customerType = userPlain.kyc.customerType;
    newTxn.userAmount = dto.userAmount; // original fiat amount
    newTxn.adjustedFiatAmount = netFiatAmount; // fiat after adding/removing fees
    newTxn.feeLabel = feeLabel; // e.g. "2.00%"
    newTxn.serviceFeeAmountLocal = feeAmount; // fee in fiat (local currency)
    newTxn.serviceFeeAmountUSD = serviceFeeAmountUsd; // fee converted to USD
    newTxn.grossFiat = grossFiat;
    newTxn.rate = fiatRate.rate.sell;
    newTxn.fiatCode = dto.fiatCode;
    newTxn.currency = channel.currency;
    newTxn.country = dto.country;
    newTxn.paymentProvider = PaymentPartnerEnum.YELLOWCARD;
    newTxn.sourceAddress = dto.sourceAddress;
    newTxn.bankInfo = {
      bankName: dto.bankInfo.bankName,
      accountNumber: dto.bankInfo.accountNumber,
      accountHolder: dto.bankInfo.accountHolder,
    };
    const networkInfo = BlockchainNetworkSettings[dto.network];
    newTxn.recipientInfo = {
      destnationAddress: networkInfo.treasuryAddress,
      sourceAddress: dto.sourceAddress,
      network: dto.network,
      assetCode: dto.assetCode,
    };
    newTxn.expiresAt = yellowCardResponse.expiresAt;

    await this.fiatCryptoRampTransactionRepo.save(newTxn);

    return plainToInstance(
      IFiatToCryptoQuoteResponseDto,
      {
        userAmount: dto.userAmount,
        feePercentage: feeLabel,
        feeAmount,
        adjustedFiatAmount: netFiatAmount,
        rate: fiatRate.rate.buy,
        netFiatAmount,
        serviceFeeAmountUsd,
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
        this.cwalletService.lookupSubWallet(recipientInfo.destnationAddress),
        this.qwalletService.lookupSubWallet(recipientInfo.destnationAddress),
      ]);

      if (!cwallet && !qwallet) {
        this.logger.warn(
          `❗ No wallet found for address ${recipientInfo.destnationAddress} - skipping payout.`,
        );
        return;
      }

      //[x] check balance of treasurer

      const tx = await this.ethersService.transferToken({
        to: recipientInfo.destnationAddress,
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
        destinationAddress: recipientInfo.destnationAddress,
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

      //[x] get user wallet info
      const [cwallet, qwallet] = await Promise.all([
        this.cwalletService.lookupSubWallet(params.sourceAddress),
        this.qwalletService.lookupSubWallet(params.sourceAddress),
      ]);

      if (!cwallet && !qwallet)
        throw new CustomHttpException(
          WalletErrorEnum.MISSING_WALLET_ID,
          HttpStatus.NOT_FOUND,
        );

      //[x] once confirmed confirm payout on YC to user account
      const { id } = await this.ycService.acceptPaymentRequest({
        id: params.providerTransactionId,
      });

      if (!id) {
        //[x] throw error
        // throw new CustomHttpException(
        //   WalletErrorEnum.,
        //   HttpStatus.NOT_FOUND,
        // );
      }

      const { currency, recipientInfo } = params;

      const transaction = new TransactionHistoryEntity();
      const txnData: TransactionHistoryDto = {
        event: YCPaymentEventEnum.COLLECTION_COMPLETE,
        transactionId: params.id,
        transactionDirection: TransactionDirectionEnum.INBOUND,
        assetCode: recipientInfo.assetCode,
        amount: params.grossFiat.toString(),
        fee: params.serviceFeeAmountUSD.toString(),
        blockchainTxId: tx.txHash,
        walletId: '',
        sourceAddress: tx.sourceAddress,
        destinationAddress: recipientInfo.destnationAddress,
        paymentNetwork: recipientInfo.network,
        user: params.user,
        paymentStatus: PaymentStatus.Accepted,
        transactionType: TransactionTypeEnum.CRYPTO_TO_FIAT_WITHDRAWAL,
      };

      Object.assign(transaction, txnData);
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
          transactionType: TransactionTypeEnum.CRYPTO_TO_FIAT_WITHDRAWAL,
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
      const az = await this.ycService.createWebhook({
        active: true,
        url: 'https://goat-touched-mite.ngrok-free.app/api/yc-payments-hooks', //[x] upate payload later
      });

      console.log(az);
    } catch (error) {
      console.log(error);
    }
  }
}
