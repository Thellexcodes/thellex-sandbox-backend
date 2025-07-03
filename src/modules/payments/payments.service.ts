import { HttpStatus, Injectable } from '@nestjs/common';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { SupportedWalletTypes, WalletProviderEnum } from '@/config/settings';
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
import { PaymentErrorEnum } from '@/models/payments.types';
import { walletConfig } from '@/utils/tokenChains';
import { UserErrorEnum } from '@/models/user-error.enum';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly qwalletService: QwalletService,
    private readonly cwalletService: CwalletService,
    private readonly ycService: YellowCardService,
  ) {}

  /**
   * Handles a cryptocurrency withdrawal request dynamically based on walletConfig.
   * @param {CreateCryptoWithdrawPaymentDto} withdrawCryptoPaymentDto - The withdrawal request details.
   * @returns {Promise<TransactionHistoryEntity | null>} A promise that resolves to the withdrawal transaction record.
   */
  async handleWithdrawCryptoPayment(
    withdrawCryptoPaymentDto: CreateCryptoWithdrawPaymentDto,
  ): Promise<TransactionHistoryEntity | null> {
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

    return null;
  }

  async handleGetPaymentChannels(): Promise<IYCChannel[] | any> {
    //[x] check the supported channels with settings
    const paymentChannelResponse = await this.ycService.getChannels();
    return paymentChannelResponse.channels;
  }

  async handleGetCryptoChannels(): Promise<any> {}

  async handleYcOnRamp(
    user: UserEntity,
    fiatCollectionRequestDto: FiatCollectionRequestDto,
  ) {
    const { channels } = await this.ycService.getChannels();
    const { networks } = await this.ycService.getNetworks();

    let activeChannels = channels.filter(
      (c) => c.status === 'active' && c.rampType === 'deposit',
    );
    let supportedCountries = [...new Set(activeChannels.map((c) => c.country))];

    if (!supportedCountries.includes(fiatCollectionRequestDto.country))
      throw new CustomHttpException(
        PaymentErrorEnum.COUNTRY_NOT_ACTIVE,
        HttpStatus.FORBIDDEN,
      );

    // Select channel
    let channel = activeChannels[0];
    let supportedNetworks = networks.filter(
      (n) => n.status === 'active' && n.channelIds.includes(channel.id),
    );
    let network = supportedNetworks[0];

    const userKycData = user.kyc;

    const localAmount = 500;
    // const amountUSD = 50;

    const [year, month, day] = userKycData.dob.split('-');
    userKycData.dob = `${month}/${day}/${year}`;

    //[x] enforce user phone number setup
    const recipient = {
      name: `${userKycData.firstName} ${userKycData.lastName}`,
      country: fiatCollectionRequestDto.country,
      phone: userKycData.phone ?? '+2348140979877',
      address: userKycData.address ?? '',
      dob: userKycData.dob ?? '',
      email: user.email,
      idNumber: userKycData.nin,
      idType: IdTypeEnum.NIN,
      additionalIdType: IdTypeEnum.BVN,
      additionalIdNumber: userKycData.bvn,
    };

    let request = {
      sequenceId: uuidV4(),
      channelId: channel.id,
      currency: channel.currency,
      country: channel.country,
      reason: 'other', //[x] enable reason
      // amount: amountUSD, //Amount in USD to transact or
      localAmount,
      recipient,
      forceAccept: false,
      source: { accountType: 'bank' },
      customerType: 'retail',
    };

    const collectionResponse =
      await this.ycService.submitCollectionRequest(request);

    return collectionResponse;
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
