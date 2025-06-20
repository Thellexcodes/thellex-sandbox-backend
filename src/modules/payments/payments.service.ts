import { HttpStatus, Injectable } from '@nestjs/common';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { RequestCryptoPaymentResponse } from '@/models/request.types';
import { SupportedBlockchainType } from '@/config/settings';
import { CreateCryptoWithdrawPaymentDto } from './dto/create-withdraw-crypto.dto';
import { TransactionHistoryEntity } from '@/utils/typeorm/entities/transaction-history.entity';
import { QwalletService } from '../wallets/qwallet/qwallet.service';
import { CwalletService } from '../wallets/cwallet/cwallet.service';
import { CreateRequestPaymentDto } from './dto/create-payment.dto';
import { YellowCardService } from './yellowcard.service';
import { HttpService } from '@/middleware/http.service';
import { IYCChannel } from '@/models/yellocard.models';
import { v4 as uuidV4 } from 'uuid';
import { IdTypeEnum } from '@/models/kyc.types';
import { ConfirmCollectionRequestDto } from './dto/confirm-collection-request.dto';
import { FiatCollectionRequestDto } from './dto/fiat-collection-request.dto';
import { CustomHttpException } from '@/middleware/custom.http.exception';
import { WalletErrorEnum } from '@/models/wallet-manager.types';
import { PaymentErrorEnum } from '@/models/payments.types';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly qwalletService: QwalletService,
    private readonly cwalletService: CwalletService,
    private readonly httpService: HttpService,
    private readonly ycService: YellowCardService,
  ) {}

  /**
   * Creates a request for a crypto wallet payment from a user.
   *
   * @param {CreateRequestPaymentDto} createRequestPaymentDto - The payment request details (amount, currency, network, etc.).
   * @param {UserEntity} user - The user who is making the request.
   * @returns {Promise<RequestCryptoPaymentResponse>} A promise that resolves to the crypto payment request response.
   */
  async requestCryptoWallet(
    createRequestPaymentDto: CreateRequestPaymentDto,
    user: UserEntity,
  ): Promise<RequestCryptoPaymentResponse> {
    const wallet = await this.qwalletService.findWalletByUserAndNetwork(
      user,
      createRequestPaymentDto.network,
      createRequestPaymentDto.assetCode,
    );

    return { wallet: wallet, assetCode: createRequestPaymentDto.assetCode };
  }

  /**
   * Handles a cryptocurrency withdrawal request.
   * @param {CreateCryptoWithdrawPaymentDto} withdrawCryptoPaymentDto - The withdrawal request details, including amount, currency, and blockchain network.
   * @returns {Promise<TransactionHistoryEntity>} A promise that resolves to the withdrawal handling response.
   */
  async handleWithdrawCryptoPayment(
    withdrawCryptoPaymentDto: CreateCryptoWithdrawPaymentDto,
  ): Promise<TransactionHistoryEntity | null> {
    if (
      [SupportedBlockchainType.BEP20, SupportedBlockchainType.TRC20].includes(
        withdrawCryptoPaymentDto.network,
      )
    ) {
      const wallet = await this.qwalletService.lookupSubWallet(
        withdrawCryptoPaymentDto.sourceAddress,
      );

      return await this.qwalletService.createCryptoWithdrawal(
        withdrawCryptoPaymentDto,
        wallet,
      );
    }

    if (
      [SupportedBlockchainType.MATIC].includes(withdrawCryptoPaymentDto.network)
    ) {
      const wallet = await this.cwalletService.lookupSubWallet(
        withdrawCryptoPaymentDto.sourceAddress,
      );

      return await this.cwalletService.createCryptoWithdrawal(
        withdrawCryptoPaymentDto,
        wallet,
      );
    }
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

    const localAmount = 3000;
    const amountUSD = 50;

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
    };

    console.log(recipient);

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

    //     {
    // [1]   partnerId: 'c2119ce9-2ee6-4ba6-9b12-67af1dcba485',
    // [1]   url: 'https://webhook.site/9df281f6-0cbd-4e60-a9ab-c01dfe16046a',
    // [1]   state: '',
    // [1]   active: true,
    // [1]   createdAt: '2025-06-19T19:55:04.202Z',
    // [1]   updatedAt: '2025-06-19T19:55:04.202Z',
    // [1]   id: 'ba1af894-b517-4a57-8364-f6c95cd06c72'
    // [1] }
  }
}

// 1] {
// [1]   currency: 'NGN',
// [1]   status: 'processing',
// [1]   serviceFeeAmountUSD: 0.03,
// [1]   partnerFeeAmountLocal: 0,
// [1]   country: 'NG',
// [1]   reference: 'TLX2567567',
// [1]   recipient: {
// [1]     country: 'US',
// [1]     address: '',
// [1]     idType: 'NIN',
// [1]     phone: '',
// [1]     dob: '1994-03-17',
// [1]     name: 'SAMUEL',
// [1]     idNumber: '86474618432',
// [1]     email: 'boltdsg@gmail.com'
// [1]   },
// [1]   expiresAt: '2025-06-19T20:13:39.366Z',
// [1]   requestSource: 'api',
// [1]   directSettlement: false,
// [1]   refundRetry: 0,
// [1]   id: '9b4fba6b-1d71-5aeb-9c0c-f1f2b1adda30',
// [1]   partnerId: 'c2119ce9-2ee6-4ba6-9b12-67af1dcba485',
// [1]   rate: 1615,
// [1]   bankInfo: {
// [1]     name: 'PAGA',
// [1]     accountNumber: '7641290419',
// [1]     accountName: 'Ken Adams'
// [1]   },
// [1]   tier0Active: false,
// [1]   createdAt: '2025-06-19T20:03:39.370Z',
// [1]   forceAccept: true,
// [1]   source: { accountType: 'bank' },
// [1]   sequenceId: '61c11389-89a2-4f4f-947e-d1c0cd9f84b3',
// [1]   reason: 'other',
// [1]   convertedAmount: 3000,
// [1]   channelId: 'af944f0c-ba70-47c7-86dc-1bad5a6ab4e4',
// [1]   serviceFeeAmountLocal: 48.45,
// [1]   updatedAt: '2025-06-19T20:03:41.977Z',
// [1]   partnerFeeAmountUSD: 0,
// [1]   amount: 1.86,
// [1]   depositId: 'e2a4a45b-954e-5205-b303-e5f454c7dca3'
// [1] }

//     {
// [1]   partnerId: 'c2119ce9-2ee6-4ba6-9b12-67af1dcba485',
// [1]   url: 'https://webhook.site/9df281f6-0cbd-4e60-a9ab-c01dfe16046a',
// [1]   state: '',
// [1]   active: true,
// [1]   createdAt: '2025-06-19T19:55:04.202Z',
// [1]   updatedAt: '2025-06-19T19:55:04.202Z',
// [1]   id: 'ba1af894-b517-4a57-8364-f6c95cd06c72'
// [1] }
