import { Injectable } from '@nestjs/common';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { RequestCryptoPaymentResponse } from '@/types/request.types';
import { SupportedBlockchainType } from '@/config/settings';
import { CreateCryptoWithdrawPaymentDto } from './dto/create-withdraw-crypto.dto';
import { TransactionHistoryEntity } from '@/utils/typeorm/entities/transaction-history.entity';
import { QwalletService } from '../wallets/qwallet/qwallet.service';
import { CwalletService } from '../wallets/cwallet/cwallet.service';
import { CreateRequestPaymentDto } from './dto/create-payment.dto';
import { YellowCardService } from './yellowcard.service';
import { HttpService } from '@/middleware/http.service';
import { IYCChannel } from '@/types/yellocard.models';
import { v4 as uuidV4 } from 'uuid';
import { IdTypeEnum } from '@/types/kyc.types';

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

  async handleYcOnRamp(data, user: UserEntity) {
    const { channels } = await this.ycService.getChannels();
    const { networks } = await this.ycService.getNetworks();

    let activeChannels = channels.filter(
      (c) => c.status === 'active' && c.rampType === 'deposit',
    );
    let supportedCountries = [...new Set(activeChannels.map((c) => c.country))];

    // Select channel
    let channel = activeChannels[0];
    let supportedNetworks = networks.filter(
      (n) => n.status === 'active' && n.channelIds.includes(channel.id),
    );
    let network = supportedNetworks[0];

    const userKycData = user.kyc;

    const localAmount = 5000;
    const amountUSD = 50;

    const recipient = {
      name: userKycData.firstName ?? '',
      country: 'US',
      phone: userKycData.phone ?? '',
      address: userKycData.address ?? '',
      dob: userKycData.dob ?? '',
      email: user.email,
      idNumber: userKycData.nin,
      idType: IdTypeEnum.NIN,
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
      forceAccept: true,
      source: {
        accountType: 'bank',
      },
    };

    const collectionResponse =
      await this.ycService.submitCollectionRequest(request);

    //[x] keep track of payment record

    // // const response = await axios.post('/business/collections', request);
    // // console.log(`response: ${JSON.stringify(response.data)}`);
    // // return response;
  }

  async handleCryptoFeeEstimator() {}
}
