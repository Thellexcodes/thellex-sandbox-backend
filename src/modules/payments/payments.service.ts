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
import { formatUserWithTiers, getTreasuryAddress } from '@/utils/helpers';
import { calculateNetCryptoAmount } from '@/utils/fee.utils';
import { PaymentStatus, TransactionTypeEnum } from '@/models/payment.types';
import { plainToInstance } from 'class-transformer';
import { IFiatToCryptoQuoteResponseDto } from './dto/payment.dto';
import { FiatToCryptoOnRampRequestDto } from './dto/fiat-to-crypto-request.dto';
import { IYellowCardRateDto } from './dto/yellocard.dto';
import { RequestCryptoOffRampPaymentDto } from './dto/request-crypto-offramp-payment.dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly qwalletService: QwalletService,
    private readonly cwalletService: CwalletService,
    private readonly ycService: YellowCardService,

    @InjectRepository(FiatCryptoRampTransactionEntity)
    private readonly fiatCryptoRampTransactionRepo: Repository<FiatCryptoRampTransactionEntity>,
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
    filter: Partial<FiatCryptoRampTransactionEntity>,
  ): Promise<FiatCryptoRampTransactionEntity[]> {
    try {
      return this.fiatCryptoRampTransactionRepo.find({
        where: {
          directSettlement: filter.directSettlement,
          paymentStatus: filter.paymentStatus,
          userId: filter.userId,
        },
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
                wallet,
              )
            : await this.cwalletService.createCryptoWithdrawal(
                withdrawCryptoPaymentDto,
                wallet,
              );
        }
      }
    }
  }

  // async handleGetPaymentChannels(): Promise<IYCChannel[] | any> {
  //   const paymentChannelResponse = await this.ycService.getChannels();
  //   return paymentChannelResponse.channels;
  // }

  async handleCryptoToFiatOnRamp(
    user: UserEntity,
    dto: FiatToCryptoOnRampRequestDto,
  ) {
    try {
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
        (c) => c.status === 'active' && c.rampType === 'deposit',
      );
      let supportedCountries = [
        ...new Set(activeChannels.map((c) => c.country)),
      ];

      if (!supportedCountries.includes(dto.country.toUpperCase()))
        throw new CustomHttpException(
          PaymentErrorEnum.COUNTRY_NOT_ACTIVE,
          HttpStatus.FORBIDDEN,
        );

      let channel = activeChannels[0];
      let supportedNetworks = networks.filter(
        (n) => n.status === 'active' && n.channelIds.includes(channel.id),
      );
      let network = supportedNetworks[0];

      const userKycData = userPlain.kyc;
      const [year, month, day] = userKycData.dob.split('-');
      userKycData.dob = `${month}/${day}/${year}`;

      const recipient = {
        name: `${userKycData.firstName} ${userKycData.lastName}`,
        country: dto.country,
        phone: userKycData.phone ?? '+2341111111111',
        address: userKycData.address ?? '',
        dob: userKycData.dob ?? '',
        email: userPlain.email,
        idNumber: userKycData.idNumber,
        idType: IdTypeEnum.NIN,
        additionalIdType: IdTypeEnum.BVN,
        additionalIdNumber: userKycData.bvn,
      };

      const sequenceId = uuidV4();

      // Submit dummy request with original user amount just to get rate
      const tempRateRequest = {
        sequenceId,
        channelId: channel.id,
        currency: channel.currency,
        country: channel.country,
        reason: 'other',
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

      const { adjustedNaira, feeAmount, feeLabel, netCryptoAmount } =
        calculateNetCryptoAmount(
          dto.userAmount,
          userPlain.currentTier.txnFee.withdrawal.feePercentage,
          fiatRate.rate.buy,
        );

      const serviceFeeAmountUsd = parseFloat(
        (feeAmount / fiatRate.rate.buy).toFixed(2),
      );

      // Assign to entity
      const newTxn = new FiatCryptoRampTransactionEntity();
      newTxn.user = user;
      newTxn.userId = user.id;
      newTxn.sequenceId = sequenceId;
      newTxn.channelId = channel.id;
      newTxn.transactionType = TransactionTypeEnum.FIAT_TO_CRYPTO_DEPOSIT;
      newTxn.paymentStatus = PaymentStatus.Processing;
      if (this.shouldSettleDirectly(dto.userAmount)) {
        newTxn.directSettlement = true;
      }
      newTxn.providerReference = yellowCardResponse.reference;
      newTxn.providerTransactionId = yellowCardResponse.id;
      newTxn.providerDepositId = yellowCardResponse.depositId;
      newTxn.customerType = userPlain.kyc.customerType;

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

      await this.fiatCryptoRampTransactionRepo.save(newTxn);

      return plainToInstance(
        IFiatToCryptoQuoteResponseDto,
        {
          userAmount: dto.userAmount,
          feePercentage: feeLabel,
          feeAmount,
          adjustedFiatAmount: adjustedNaira,
          rate: fiatRate.rate.buy,
          netCryptoAmount,
          serviceFeeAmountUsd,
        },
        { excludeExtraneousValues: true },
      );
    } catch (err) {
      console.log(err);
    }
  }

  async handleCryptoToFiatOffRamp(
    user: UserEntity,
    dto: RequestCryptoOffRampPaymentDto,
  ) {
    // [x] get wallet from db
    const treasureryAddress = getTreasuryAddress(dto.network);
    //[x] validate addrersses
    // transfer asset to treasurery address
    // payout user from yc
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

  async payout(params: {
    type: TransactionTypeEnum;
    userId: string;
    amount: number;
    currency: string;
    recipientInfo?: {
      accountNumber: string;
      accountType: 'bank' | 'momo';
      networkId: string;
    };
    walletAddress?: string;
    network?: SupportedBlockchainTypeEnum;
  }): Promise<{ success: boolean; txHash?: string }> {
    if (params.type === TransactionTypeEnum.CRYPTO_TO_FIAT_WITHDRAWAL) {
      return this.payoutFiat(params as any);
    } else {
      return this.payoutCrypto(params as any);
    }
  }

  async payoutCrypto(params: {
    userId: string;
    amount: number;
    currency: string;
    walletAddress: string;
    network: SupportedBlockchainTypeEnum;
  }): Promise<{ success: boolean; txHash?: string }> {
    try {
      // Construct and send the transaction using your crypto SDK (e.g. ethers.js)
      const tx = await this.cryptoService.sendCrypto({
        to: params.walletAddress,
        amount: params.amount,
        currency: params.currency,
        network: params.network,
      });

      return {
        success: !!tx.hash,
        txHash: tx.hash,
      };
    } catch (error) {
      this.logger.error(
        `❌ Crypto payout failed for user ${params.userId}`,
        error.stack,
      );
      return { success: false };
    }
  }

  // FIAT Payout
  async payoutFiat(params: {
    userId: string;
    amount: number;
    currency: string;
    recipientInfo: {
      accountNumber: string;
      accountType: 'bank' | 'momo';
      networkId: string;
    };
  }): Promise<{ success: boolean; txHash?: string }> {
    try {
      const { amount, currency, recipientInfo } = params;

      const payload = {
        amount,
        currency,
        destination: {
          accountNumber: recipientInfo.accountNumber,
          accountType: recipientInfo.accountType,
          networkId: recipientInfo.networkId,
          accountName: 'Test User',
        },
      };

      const response =
        recipientInfo.accountType === 'bank'
          ? await this.disburseToBank(payload)
          : await this.disburseToWallet(payload);

      return {
        success: response.status === 'success',
        txHash: response.txHash || response.transactionReference || undefined,
      };
    } catch (error) {
      this.logger.error(
        `❌ Fiat payout failed for user ${params.userId}`,
        error.stack,
      );
      return { success: false };
    }
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
