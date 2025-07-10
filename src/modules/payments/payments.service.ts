import { HttpStatus, Injectable } from '@nestjs/common';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import {
  SupportedWalletTypes,
  TokenEnum,
  WalletProviderEnum,
} from '@/config/settings';
import { CreateCryptoWithdrawPaymentDto } from './dto/create-withdraw-crypto.dto';
import { TransactionHistoryEntity } from '@/utils/typeorm/entities/transaction-history.entity';
import { QwalletService } from '../wallets/qwallet/qwallet.service';
import { CwalletService } from '../wallets/cwallet/cwallet.service';
import { YellowCardService } from './yellowcard.service';
import { IYCChannel } from '@/models/yellocard.models';
import { v4 as uuidV4 } from 'uuid';
import { IdTypeEnum } from '@/models/kyc.types';
import { ConfirmCollectionRequestDto } from './dto/confirm-collection-request.dto';
import { FiatCollectionRequestDto } from './dto/fiat-collection-request.dto';
import { CustomHttpException } from '@/middleware/custom.http.exception';
import { PaymentErrorEnum, PaymentPartnerEnum } from '@/models/payments.types';
import { walletConfig } from '@/utils/tokenChains';
import { FiatCryptoRampTransactionEntity } from '@/utils/typeorm/entities/fiat-crypto-ramp-transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { formatUserWithTiers } from '@/utils/helpers';
import { calculateNetCryptoAmount } from '@/utils/fee.utils';
import { PaymentStatus, TransactionTypeEnum } from '@/models/payment.types';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly qwalletService: QwalletService,
    private readonly cwalletService: CwalletService,
    private readonly ycService: YellowCardService,

    @InjectRepository(FiatCryptoRampTransactionEntity)
    private readonly fiatCryptoRampTransactionRepo: Repository<FiatCryptoRampTransactionEntity>,
  ) {}

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

  async handleGetPaymentChannels(): Promise<IYCChannel[] | any> {
    const paymentChannelResponse = await this.ycService.getChannels();
    return paymentChannelResponse.channels;
  }

  async handleGetCryptoChannels(): Promise<any> {}

  async handleYcOnRamp(user: UserEntity, dto: FiatCollectionRequestDto) {
    try {
      const fiatRate = await this.ycService.getRateFromCache(
        dto.fiatCode.toUpperCase(),
      );

      if (!fiatRate)
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
        phone: userKycData.phone ?? '+2348140979877',
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
        source: { accountType: 'bank' },
        customerType: user.kyc.customerType,
      };

      const yellowCardResponse =
        await this.ycService.submitCollectionRequest(tempRateRequest);

      const { adjustedNaira, feeAmount, feeLabel, netCryptoAmount } =
        calculateNetCryptoAmount(
          dto.userAmount,
          userPlain.currentTier.txnFee.withdrawal.feePercentage,
          fiatRate.buy,
        );

      const serviceFeeAmountUsd = parseFloat(
        (feeAmount / fiatRate.buy).toFixed(2),
      );

      console.log({
        userAmount: dto.userAmount,
        feeAmount,
        netCryptoAmount,
        fiatRate,
        serviceFeeAmountUsd,
      });

      // Assign to entity
      const newTxn = new FiatCryptoRampTransactionEntity();
      newTxn.user = user;
      newTxn.userId = user.id;
      newTxn.transactionType = TransactionTypeEnum.FIAT_TO_CRYPTO_DEPOSIT;
      newTxn.status = PaymentStatus.Processing;

      newTxn.userAmount = dto.userAmount; // original fiat amount
      newTxn.feePercentage = feeLabel; // e.g. "2.00%"
      newTxn.serviceFeeAmountLocal = feeAmount; // fee in fiat (local currency)
      newTxn.adjustedFiatAmount = adjustedNaira; // fiat after adding/removing fees
      newTxn.serviceFeeAmountUSD = serviceFeeAmountUsd; // fee converted to USD

      newTxn.rate = fiatRate.buy;
      newTxn.netCryptoAmount = netCryptoAmount;

      newTxn.assetCode = TokenEnum.USDT;
      newTxn.fiatCode = dto.fiatCode;
      newTxn.currency = channel.currency;
      newTxn.recipientDetails = recipient;
      newTxn.channelId = channel.id;
      newTxn.paymentProvider = PaymentPartnerEnum.YELLOWCARD;
      newTxn.sequenceId = sequenceId;
      newTxn.country = dto.country;
      newTxn.expiresAt = yellowCardResponse.expiresAt;
      newTxn.directSettlement = true;
      newTxn.bankAccountNumber = yellowCardResponse.bankInfo.accountNumber;

      await this.fiatCryptoRampTransactionRepo.save(newTxn);

      return {
        userAmount: dto.userAmount,
        feePercentage: feeLabel,
        feeAmount,
        adjustedFiatAmount: adjustedNaira,
        rate: fiatRate.buy,
        netCryptoAmount,
        serviceFeeAmountUsd,
      };
    } catch (err) {
      console.log(err);
    }
  }

  async handleConfirmCollectionRequest(
    { id }: ConfirmCollectionRequestDto,
    user: UserEntity,
  ) {
    try {
      const az = await this.ycService.acceptCollectionRequest({ id });
      console.log(az);
    } catch (error) {
      console.log(error);
    }
  }

  async handleCryptoFeeEstimator() {}

  async handleActivateYcWebhook() {
    try {
      const az = await this.ycService.createWebhook({
        active: true,
        url: 'https://webhook.site/9df281f6-0cbd-4e60-a9ab-c01dfe16046a', //[x] upate payload later
      });

      console.log(az);
    } catch (error) {
      console.log(error);
    }
  }
}
