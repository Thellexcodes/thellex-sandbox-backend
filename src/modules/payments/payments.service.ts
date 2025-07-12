import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import {
  DIRECT_SETTLEMENT_THRESHOLD,
  FiatEnum,
  SupportedBlockchainTypeEnum,
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
import { calculateNetCryptoAmount } from '@/utils/fee.utils';
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

//[x] properly throw error using enum
@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly qwalletService: QwalletService,
    private readonly cwalletService: CwalletService,
    private readonly ycService: YellowCardService,
    private readonly ethersService: EtherService,
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

  async handleCryptoToFiatOnRamp(
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
        address: userKycData.address ?? '',
        dob: userKycData.dob ?? '',
        email: userPlain.email,
        idNumber: userKycData.idNumber,
        idType: IdTypeEnum.NIN,
        additionalIdType: IdTypeEnum.BVN,
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
        // source: { accountType: 'bank' },
        source: {
          accountNumber: '+2341111111111',
          accountType: 'bank',
          networkId: '20823163-f55c-4fa5-8cdb-d59c5289a137',
        },
        customerType: user.kyc.customerType,
      };

      const yellowCardResponse =
        await this.ycService.submitCollectionRequest(tempRateRequest);

      // Calculate fees and net crypto amount
      const { adjustedNaira, feeAmount, feeLabel, netCryptoAmount } =
        calculateNetCryptoAmount(
          dto.userAmount,
          userPlain.currentTier.txnFee.withdrawal.feePercentage,
          fiatRate.rate.buy,
        );

      const serviceFeeAmountUsd = parseFloat(
        (feeAmount / fiatRate.rate.buy).toFixed(2),
      );

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
      newTxn.netCryptoAmount = netCryptoAmount;

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
        walletAddress: dto.destinationAddress,
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
          netCryptoAmount,
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

  async handleCryptoToFiatOffRamp(
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

    const currency = fiatRate.rate.filter(
      (r: IYellowCardRateDto) => r.code === 'NGN',
    );

    const reason = 'entertainment';

    const sender = {
      name: `${userPlain.kyc.firstName} ${userPlain.kyc.lastName}`,
      country: 'US',
      phone: '+12222222222',
      address: 'Sample Address',
      dob: 'mm/dd/yyyy',
      email: 'email@domain.com',
      idNumber: '0123456789',
      idType: 'license',
    };

    const destination = {
      accountNumber: '1111111111',
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
      reason,
      destination,
      sender,
      forceAccept: false,
    };

    const yellowCardResponse =
      await this.ycService.submitPaymentRequest(request);

    // const { adjustedNaira, feeAmount, feeLabel, netCryptoAmount } =
    //   calculateNetCryptoAmount(
    //     dto.userAmount,
    //     userPlain.currentTier.txnFee.withdrawal.feePercentage,
    //     fiatRate.rate.buy,
    //   );

    // const serviceFeeAmountUsd = parseFloat(
    //   (feeAmount / fiatRate.rate.buy).toFixed(2),
    // );

    // // Assign to entity
    // const newTxn = new FiatCryptoRampTransactionEntity();
    // newTxn.user = user;
    // newTxn.userId = user.id;
    // newTxn.sequenceId = sequenceId;
    // newTxn.channelId = channel.id;
    // newTxn.transactionType = TransactionTypeEnum.FIAT_TO_CRYPTO_DEPOSIT;
    // newTxn.paymentStatus = PaymentStatus.Processing;
    // if (this.shouldSettleDirectly(dto.userAmount)) {
    //   newTxn.directSettlement = true;
    // }
    // newTxn.providerReference = yellowCardResponse.reference;
    // newTxn.providerTransactionId = yellowCardResponse.id;
    // newTxn.providerDepositId = yellowCardResponse.depositId;
    // newTxn.customerType = userPlain.kyc.customerType;

    // newTxn.userAmount = dto.userAmount; // original fiat amount
    // newTxn.adjustedFiatAmount = adjustedNaira; // fiat after adding/removing fees
    // newTxn.feeLabel = feeLabel; // e.g. "2.00%"
    // newTxn.serviceFeeAmountLocal = feeAmount; // fee in fiat (local currency)
    // newTxn.serviceFeeAmountUSD = serviceFeeAmountUsd; // fee converted to USD

    // newTxn.rate = fiatRate.rate.buy;
    // newTxn.netCryptoAmount = netCryptoAmount;

    // newTxn.fiatCode = dto.fiatCode;
    // newTxn.currency = channel.currency;
    // newTxn.country = dto.country;

    // newTxn.paymentProvider = PaymentPartnerEnum.YELLOWCARD;
    // newTxn.bankInfo = {
    //   bankName: yellowCardResponse.bankInfo.name,
    //   accountNumber: yellowCardResponse.bankInfo.accountNumber,
    //   accountHolder: yellowCardResponse.bankInfo.accountName,
    // };
    // newTxn.recipientInfo = {
    //   walletAddress: dto.destinationAddress,
    //   network: dto.network,
    //   assetCode: dto.assetCode,
    // };

    // newTxn.expiresAt = yellowCardResponse.expiresAt;

    // await this.fiatCryptoRampTransactionRepo.save(newTxn);

    // return plainToInstance(
    //   IFiatToCryptoQuoteResponseDto,
    //   {
    //     userAmount: dto.userAmount,
    //     feePercentage: feeLabel,
    //     feeAmount,
    //     adjustedFiatAmount: adjustedNaira,
    //     rate: fiatRate.rate.buy,
    //     netCryptoAmount,
    //     serviceFeeAmountUsd,
    //   },
    //   { excludeExtraneousValues: true },
    // );
  }

  async disburseToBank(payload: {
    amount: number;
    currency: string;
    destination: {
      accountNumber: string;
      accountType: string;
      networkId: string;
      accountName?: string;
    };
  }) {
    // simulate API call
    return {
      status: 'success',
      txHash: 'bank_tx_123456',
    };
  }
  async disburseToWallet(payload: {
    amount: number;
    currency: string;
    destination: {
      accountNumber: string;
      accountType: string;
      networkId: string;
      accountName?: string;
    };
  }) {
    // simulate API call
    return {
      status: 'success',
      txHash: 'wallet_tx_654321',
    };
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
      const { recipientInfo, netCryptoAmount, userId, user } = params;

      const [cwallet, qwallet] = await Promise.all([
        this.cwalletService.lookupSubWallet(recipientInfo.walletAddress),
        this.qwalletService.lookupSubWallet(recipientInfo.walletAddress),
      ]);

      if (!cwallet && !qwallet) {
        this.logger.warn(
          `❗ No wallet found for address ${recipientInfo.walletAddress} - skipping payout.`,
        );
        return;
      }

      const tx = await this.ethersService.transferToken({
        to: recipientInfo.walletAddress,
        amount: netCryptoAmount.toString(),
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

      const txnData: TransactionHistoryDto = {
        event: YCPaymentEventEnum.COLLECTION_COMPLETE,
        transactionId: params.id,
        transactionDirection: TransactionDirectionEnum.INBOUND,
        assetCode: recipientInfo.assetCode,
        amount: netCryptoAmount.toString(),
        fee: params.serviceFeeAmountUSD.toString(),
        blockchainTxId: tx.txHash,
        walletId,
        sourceAddress: tx.sourceAddress,
        destinationAddress: recipientInfo.walletAddress,
        paymentNetwork: recipientInfo.network,
        user,
        paymentStatus: PaymentStatus.Accepted,
        transactionType: TransactionTypeEnum.CRYPTO_DEPOSIT,
      };

      Object.assign(txnHistory, txnData);

      // await this.txnHistoryRepo.save(txnHistory);
      // await this.fiatCryptoRampTransactionRepo.save(params);

      // TODO: [x] Emit transaction/notification to user
      this.logger.log(`✅ Crypto payout successful for user ${userId}`);

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
      // const { amount, currency, recipientInfo } = params;
      // const payload = {
      //   amount,
      //   currency,
      //   destination: {
      //     accountNumber: recipientInfo.accountNumber,
      //     accountType: recipientInfo.accountType,
      //     networkId: recipientInfo.networkId,
      //     accountName: 'Test User',
      //   },
      // };
      // const response =
      //   recipientInfo.accountType === 'bank'
      //     ? await this.disburseToBank(payload)
      //     : await this.disburseToWallet(payload);
      // return {
      //   success: response.status === 'success',
      //   txHash: response.txHash || response.transactionReference || undefined,
      // };
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
