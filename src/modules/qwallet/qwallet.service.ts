import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QWALLET_API } from '@/constants/env';
import { HttpService } from '@/middleware/http.service';
import {
  ConfirmSwapResponse,
  CreatePaymentAddressResponse,
  CreateSubAccountResponse,
  CreateSwapResponse,
  GetAllSwapsResponse,
  GetPaymentAddressResponse,
  GetSubAccountResponse,
  GetSwapTransactionResponse,
  GetTemporarySwapQuoteResponse,
  HandleWithdrawPaymentResponse,
  ISubAccountData,
  IWalletData,
  RefreshSwapQuoteResponse,
} from '@/types/qwallet.types';
import { QwalletErrorEnum } from '@/types/qwallet-error.enum';
import { QWalletProfileEntity } from '@/utils/typeorm/entities/qwallet/qwallet-profile.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { CustomHttpException } from '@/middleware/custom.http.exception';
import { CreateSubAccountDto } from './dto/create-qwallet.dto';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import { CreateSwapDto } from './dto/create-swap.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import {
  ChainTokens,
  mapNetworkToWalletType,
  SupportedBlockchainType,
  SupportedWalletTypes,
  TokenEnum,
  WalletProviderEnum,
} from '@/config/settings';
import {
  IQWalletEntity,
  QWalletsEntity,
} from '@/utils/typeorm/entities/qwallet/qwallets.entity';
import { CreateCryptoWithdrawPaymentDto } from '../payments/dto/create-withdraw-crypto.dto';
import { TransactionHistoryService } from '../transaction-history/transaction-history.service';
import {
  ITransactionHistory,
  TransactionHistoryDto,
} from '../transaction-history/dto/create-transaction-history.dto';
import { FeeLevel, WalletWebhookEventType } from '@/types/wallet-manager.types';
import { PaymentStatus, PaymentType } from '@/types/payment.types';
import { TransactionHistoryEntity } from '@/utils/typeorm/entities/transaction-history.entity';
import { TokenEntity } from '@/utils/typeorm/entities/token/token.entity';
import { ApiResponse } from '@/types/request.types';
import { GetPassportResponse } from 'dojah-typescript-sdk';

//TODO: handle errors with enum
@Injectable()
export class QwalletService {
  constructor(
    @InjectRepository(QWalletProfileEntity)
    private readonly qwalletProfilesRepo: Repository<QWalletProfileEntity>,
    @InjectRepository(QWalletsEntity)
    private readonly qwalletsRepo: Repository<QWalletsEntity>,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly transactionHistoryService: TransactionHistoryService,
    @InjectRepository(TokenEntity)
    private readonly tokenRepo: Repository<TokenEntity>,
  ) {}

  // >>>>>>>>>>>>>>> SubAcocunts <<<<<<<<<<<<<<<
  async lookupSubAccount(
    user: UserEntity,
  ): Promise<QWalletProfileEntity | null> {
    const local = await this.qwalletProfilesRepo.findOne({
      where: { user: { id: user.id } },
      relations: ['user'],
    });

    if (local) return local;

    const remote = await this.fetchSubAccountFromRemote(user.email);

    return remote
      ? this.qwalletProfilesRepo.create({
          user,
          qid: remote.id,
          qsn: remote.sn,
          walletProvider: WalletProviderEnum.QUIDAX,
        })
      : null;
  }

  async fetchSubAccountFromRemote(email: string): GetSubAccountResponse {
    const res: ApiResponse<ISubAccountData[]> = await this.httpService.get(
      `${this.qwalletUrl}/users`,
      { headers: this.getAuthHeaders() },
    );
    return (
      res.data.find(
        (acc) => acc.email?.toLowerCase() === email.toLowerCase(),
      ) ?? null
    );
  }

  async lookupSubWallet(address: string): Promise<QWalletsEntity | null> {
    return this.qwalletsRepo.findOne({
      where: { address },
      relations: ['profile', 'profile.user'],
    });
  }

  async lookupUserWallets(qid: string): Promise<IQWalletEntity[]> {
    const response = await this.getPaymentAddress(qid, TokenEnum.USDT);
    return Array.isArray(response.data) ? response.data : [];
  }

  private async getPaymentAddress(uuid: string, currency: TokenEnum) {
    return this.httpService.get(
      `${this.qwalletUrl}/users/${uuid}/wallets/${currency}/addresses`,
      { headers: this.getAuthHeaders() },
    );
  }

  async saveSubAccount(
    user: UserEntity,
    sub: ISubAccountData,
  ): Promise<QWalletProfileEntity> {
    const profile = this.qwalletProfilesRepo.create({
      user,
      qid: sub.id,
      qsn: sub.sn,
      walletProvider: WalletProviderEnum.QUIDAX,
    });
    return this.qwalletProfilesRepo.save(profile);
  }

  async createAndStoreWalletsWithTokens(
    qid: string,
    profile: QWalletProfileEntity,
    networks: SupportedBlockchainType[] = [SupportedBlockchainType.BEP20],
  ) {
    const walletResponses = await this.lookupUserWallets(qid);
    const newWallets: QWalletsEntity[] = [];
    for (const walletData of walletResponses) {
      const walletType = mapNetworkToWalletType(walletData.defaultNetwork);
      const existing = await this.qwalletsRepo.findOne({
        where: {
          address: walletData.address,
          walletType,
          profile: { id: profile.id },
        },
        relations: ['tokens'],
      });
      if (existing) continue;
      const newWallet = this.qwalletsRepo.create({
        address: walletData.address,
        walletType,
        walletProvider: WalletProviderEnum.QUIDAX,
        defaultNetwork: walletData.defaultNetwork,
        networks,
        profile,
        tokens: [],
      });
      newWallets.push(newWallet);
    }
    const savedWallets = await this.qwalletsRepo.save(newWallets);
    await this.tokenRepo.save(
      savedWallets.flatMap((wallet) =>
        this.buildTokensForWallet(wallet, networks),
      ),
    );
    return savedWallets;
  }

  private buildTokensForWallet(
    wallet: QWalletsEntity,
    networks: SupportedBlockchainType[],
  ): TokenEntity[] {
    const tokens: TokenEntity[] = [];

    for (const net of networks) {
      const symbols = ChainTokens[net] || [];

      for (const symbol of symbols) {
        tokens.push(
          this.tokenRepo.create({
            assetCode: symbol,
            name: symbol,
            qwallet: wallet,
            walletProvider: WalletProviderEnum.QUIDAX,
            walletType: SupportedWalletTypes.EVM,
          }),
        );
      }
    }

    return tokens;
  }

  async createSubAccount(
    dto: CreateSubAccountDto,
    user: UserEntity,
  ): Promise<QWalletProfileEntity> {
    try {
      const remote = await this.httpService.post<CreateSubAccountResponse>(
        `${this.qwalletUrl}/users`,
        dto,
        { headers: this.getAuthHeaders() },
      );

      const profile = this.qwalletProfilesRepo.create({
        user,
        qid: remote.data.id,
        qsn: remote.data.sn,
        walletProvider: WalletProviderEnum.QUIDAX,
      });

      return await this.qwalletProfilesRepo.save(profile);
    } catch (err) {
      console.error(err);
      throw new CustomHttpException(
        QwalletErrorEnum.SUBACCOUNT_CREATE_FAILED,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async ensureUserHasProfileAndWallets(
    user: UserEntity,
  ): Promise<QWalletProfileEntity> {
    let profile = await this.lookupSubAccount(user);

    // If profile exists but wasn't saved yet (no ID), save it
    if (profile && !profile.id) {
      profile = await this.qwalletProfilesRepo.save(profile);
    }

    // If profile doesn't exist even after lookup
    if (!profile) {
      const remote = await this.fetchSubAccountFromRemote(user.email);

      if (remote) {
        profile = await this.saveSubAccount(user, remote);
      } else {
        const created = await this.createSubAccount(
          { email: user.email },
          user,
        );
        profile = await this.qwalletProfilesRepo.save(created);
      }
    }

    // Check if wallets already exist
    const walletsExist = await this.qwalletsRepo.findOne({
      where: { profile: { id: profile.id } },
    });

    // Create wallets + tokens only if none exist
    if (!walletsExist) {
      await this.createAndStoreWalletsWithTokens(profile.qid, profile);
    }

    return profile;
  }

  async findOne(walletID: string): Promise<QWalletsEntity> {
    return await this.qwalletsRepo.findOne({
      where: { id: walletID },
      relations: ['tokens'],
    });
  }

  // async fetchParentAccount() {
  //   try {
  //     return await this.httpService.get(`${this.qwalletUrl}/users/me`, {
  //       headers: this.getAuthHeaders(),
  //     });
  //   } catch (error) {
  //     //TODO: properly handle errors for 404 / 400 / 500
  //     throw new CustomHttpException(
  //       QwalletErrorEnum.FETCH_PARENT_ACCOUNT_FAILED,
  //       HttpStatus.BAD_REQUEST,
  //     );
  //   }
  // }

  // async fetchAllSubAccounts() {
  //   try {
  //     return await this.httpService.get(`${this.qwalletUrl}/api/v1/users`, {
  //       headers: this.getAuthHeaders(),
  //     });
  //   } catch (error) {
  //     //TODO: properly handle errors for 404 / 400 / 500
  //     throw new CustomHttpException(
  //       QwalletErrorEnum.FETCH_SUBACCOUNTS_FAILED,
  //       HttpStatus.BAD_REQUEST,
  //     );
  //   }
  // }

  // async fetchSubAccountDetails(uuid: string) {
  //   try {
  //     return await this.httpService.get(`${this.qwalletUrl}/users/${uuid}`, {
  //       headers: this.getAuthHeaders(),
  //     });
  //   } catch (error) {
  //     //TODO: properly handle errors for 404 / 400 / 500
  //     throw new CustomHttpException(
  //       QwalletErrorEnum.FETCH_SUBACCOUNT_DETAILS_FAILED,
  //       HttpStatus.BAD_REQUEST,
  //     );
  //   }
  // }

  // // >>>>>>>>>>>>>>> Wallets <<<<<<<<<<<<<<<
  // async getUserWallets(uuid: string): Promise<any> {
  //   try {
  //     const userWallets: any = await this.httpService.get(
  //       `${this.qwalletUrl}/users/${uuid}/wallets`,
  //       {
  //         headers: this.getAuthHeaders(),
  //       },
  //     );

  //     return userWallets;
  //   } catch (error) {
  //     //TODO: properly handle errors for 404 / 400 / 500
  //     throw new CustomHttpException(
  //       QwalletErrorEnum.GET_USER_WALLETS_FAILED,
  //       HttpStatus.BAD_REQUEST,
  //     );
  //   }
  // }

  // async getUserWallet(uuid: string, currency: string): Promise<any> {
  //   try {
  //     return await this.httpService.get(
  //       `${this.qwalletUrl}/users/${uuid}/wallets/${currency}`,
  //       { headers: this.getAuthHeaders() },
  //     );
  //   } catch (error) {
  //     //TODO: properly handle errors for 404 / 400 / 500
  //     throw new CustomHttpException(
  //       QwalletErrorEnum.GET_USER_WALLET_FAILED,
  //       HttpStatus.BAD_REQUEST,
  //     );
  //   }
  // }

  // // : Promise<ValidateAddressResponse>
  // async validateAddress(address: string, currency: string) {
  //   try {
  //     return await this.httpService.get(
  //       `${this.qwalletUrl}/addresses/validate?currency=${currency}&address=${address}`,
  //       { headers: this.getAuthHeaders() },
  //     );
  //   } catch (error) {
  //     //TODO: properly handle errors for 404 / 400 / 500
  //     throw new CustomHttpException(
  //       QwalletErrorEnum.VALIDATE_ADDRESS_FAILED,
  //       HttpStatus.BAD_REQUEST,
  //     );
  //   }
  // }

  // >>>>>>>>>>>>>>> Withdrawals <<<<<<<<<<<<<<<
  async createCryptoWithdrawal(
    createCryptoWithdralPaymentDto: CreateCryptoWithdrawPaymentDto,
    wallet: QWalletsEntity,
  ): Promise<TransactionHistoryEntity | any> {
    const user = wallet.profile.user;
    const uuid = user.qWalletProfile.qid;

    try {
      const response =
        await this.httpService.post<HandleWithdrawPaymentResponse>(
          `${this.qwalletUrl}/users/${uuid}/withdraws`,
          createCryptoWithdralPaymentDto,
          { headers: this.getAuthHeaders() },
        );

      const txnData = response.data;

      const transactionData: TransactionHistoryDto = {
        event: WalletWebhookEventType.WithdrawPending,
        transactionId: txnData.id,
        currency: txnData.currency,
        amount: txnData.amount,
        fee: txnData.fee,
        blockchainTxId: txnData.txid,
        reason: txnData.reason,
        createdAt: new Date(txnData.created_at),
        walletId: txnData.wallet.id,
        paymentStatus: PaymentStatus.Processing,
        sourceAddress: '',
        destinationAddress: '',
        type: PaymentType.OUTBOUND,
        feeLevel: FeeLevel.HIGH,
        updatedAt: new Date(txnData.created_at),
        paymentNetwork: '',
        user,
      };

      const transactionHistory = await this.transactionHistoryService.create(
        transactionData,
        user,
      );

      return transactionHistory;
    } catch (error) {
      console.log(error);
      //TODO: properly handle errors for 404 / 400 / 500
      throw new CustomHttpException(
        QwalletErrorEnum.CREATE_WITHDRAWAL_FAILED,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // async getWithdrawal(uuid: string, reference: string) {
  //   try {
  //     return await this.httpService.get(
  //       `${this.qwalletUrl}/users/${uuid}/withdraw/${reference}`,
  //       { headers: this.getAuthHeaders() },
  //     );
  //   } catch (error) {
  //     //TODO: properly handle errors for 404 / 400 / 500
  //     throw new CustomHttpException(
  //       QwalletErrorEnum.GET_WITHDRAWAL_FAILED,
  //       HttpStatus.BAD_REQUEST,
  //     );
  //   }
  // }

  // async getCryptoWithdrawalFees(
  //   currency: string,
  // ): Promise<ApiResponse<QWalletWithdrawalFeeResponse>> {
  //   return firstValueFrom(
  //     await this.httpService.get(`${this.qwalletUrl}/fee}`, {
  //       headers: this.getAuthHeaders(),
  //       params: { currency },
  //     }),
  //   );
  // }

  // async fetchOffRampTransaction(
  //   transactionId: string,
  // ): Promise<AxiosResponse<any>> {
  //   const url = `${this.qwalletUrl}/off-ramp/transactions/${transactionId}`;
  //   return firstValueFrom(
  //     await this.httpService.get(url, { headers: this.getAuthHeaders() }),
  //   );
  // }

  // async getPaymentMethods(): Promise<AxiosResponse<any>> {
  //   const url = `${this.qwalletUrl}/payment-methods`;
  //   return firstValueFrom(
  //     await this.httpService.get(url, { headers: this.getAuthHeaders() }),
  //   );
  // }

  // async getPurchaseLimitsBuy(): Promise<AxiosResponse<any>> {
  //   const url = `${this.qwalletUrl}/purchase-limits/buy`;
  //   return firstValueFrom(
  //     await this.httpService.get(url, { headers: this.getAuthHeaders() }),
  //   );
  // }

  // async getPurchaseLimitsSell(): Promise<AxiosResponse<any>> {
  //   const url = `${this.qwalletUrl}/purchase-limits/sell`;
  //   return firstValueFrom(
  //     await this.httpService.get(url, { headers: this.getAuthHeaders() }),
  //   );
  // }

  // async getPurchaseQuoteBuy(params: {
  //   currency: string;
  //   amount: string;
  // }): Promise<AxiosResponse<any>> {
  //   const url = `${this.qwalletUrl}/purchase-quotes/buy`;
  //   return await firstValueFrom(
  //     await this.httpService.get(this.qwalletUrl, {
  //       headers: this.getAuthHeaders(),
  //       params,
  //     }),
  //   );
  // }

  // async getPurchaseQuoteSell(params: {
  //   currency: string;
  //   amount: string;
  // }): Promise<AxiosResponse<any>> {
  //   const url = `${this.qwalletUrl}/purchase-quotes/sell`;
  //   return firstValueFrom(
  //     await this.httpService.get(url, {
  //       headers: this.getAuthHeaders(),
  //       params,
  //     }),
  //   );
  // }

  // // >>>>>>>>>>>>>>> Swaps - Off-Ramp <<<<<<<<<<<<<<<
  // async createSwap(createSwapDto: CreateSwapDto): Promise<CreateSwapResponse> {
  //   const url = `${this.qwalletUrl}/swaps`;
  //   return firstValueFrom(
  //     await this.httpService.post(url, createSwapDto, {
  //       headers: this.getAuthHeaders(),
  //     }),
  //   );
  // }
  // async confirmSwap(swapId: string): Promise<ConfirmSwapResponse> {
  //   const url = `${this.qwalletUrl}/swaps/${swapId}/confirm`;
  //   return firstValueFrom(
  //     await this.httpService.post(url, {}, { headers: this.getAuthHeaders() }),
  //   );
  // }
  // async refreshSwapQuote(swapId: string): Promise<RefreshSwapQuoteResponse> {
  //   const url = `${this.qwalletUrl}/swaps/${swapId}/refresh`;
  //   return firstValueFrom(
  //     await this.httpService.get(url, { headers: this.getAuthHeaders() }),
  //   );
  // }
  // async getTemporarySwapQuote(
  //   dto: CreateSwapDto,
  // ): Promise<GetTemporarySwapQuoteResponse> {
  //   const url = `${this.qwalletUrl}/swaps/quote`;
  //   return firstValueFrom(
  //     await this.httpService.get(url, { headers: this.getAuthHeaders() }),
  //   );
  // }
  // async getSwapTransaction(
  //   swapId: string,
  // ): Promise<GetSwapTransactionResponse> {
  //   const url = `${this.qwalletUrl}/swaps/${swapId}`;
  //   return firstValueFrom(
  //     await this.httpService.get(url, { headers: this.getAuthHeaders() }),
  //   );
  // }
  // async getAllSwaps(): Promise<GetAllSwapsResponse[]> {
  //   const url = `${this.qwalletUrl}/swaps`;
  //   return firstValueFrom(
  //     await this.httpService.get(url, { headers: this.getAuthHeaders() }),
  //   );
  // }

  // // >>>>>>>>>>>>>>> Orders - Off-Ramp <<<<<<<<<<<<<<<
  // async createOrder(dto: CreateOrderDto): Promise<CreateOrderResponse> {
  //   const url = `${this.qwalletUrl}/orders`;
  //   return firstValueFrom(
  //     await this.httpService.post(url, dto, { headers: this.getAuthHeaders() }),
  //   );
  // }

  // async getAllOrders(user_id: string = 'me'): Promise<GetAllOrdersResponse> {
  //   const url = `${this.qwalletUrl}/orders?user_id=${user_id}`;
  //   return firstValueFrom(
  //     await this.httpService.get(url, { headers: this.getAuthHeaders() }),
  //   );
  // }

  // async getOrderDetails(orderId: string): Promise<GetOrderDetailsResponse> {
  //   const url = `${this.qwalletUrl}/orders/${orderId}`;
  //   return firstValueFrom(
  //     await this.httpService.get(url, { headers: this.getAuthHeaders() }),
  //   );
  // }

  // async cancelOrder(orderId: string): Promise<CancelOrderResponse> {
  //   const url = `${this.qwalletUrl}/orders/${orderId}/cancel`;
  //   return firstValueFrom(
  //     await this.httpService.post(url, null, {
  //       headers: this.getAuthHeaders(),
  //     }),
  //   );
  // }

  // // >>>>>>>>>>>>>>> Asset Request <<<<<<<<<<<<<<<
  async findWalletByUserAndNetwork(
    user: UserEntity,
    network: SupportedBlockchainType,
    assetCode: TokenEnum,
  ): Promise<IQWalletEntity | null> {
    const profile = user.qWalletProfile;

    if (!profile?.wallets?.length) {
      return null;
    }

    for (const wallet of profile.wallets) {
      // Check if wallet supports the network
      if (!wallet.networks?.includes(network)) continue;

      // Check for token match
      const tokenMatch = wallet.tokens?.find(
        (token) => token.assetCode === assetCode,
      );

      if (tokenMatch) {
        return wallet;
      }
    }

    return null;
  }

  private get qwalletUrl(): string {
    const env = this.configService.get<string>('NODE_ENV');
    return env === 'testnet' ? QWALLET_API.sandbox : QWALLET_API.production;
  }

  private getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.configService.get<string>('QWALLET_SECRET_KEY')}`,
    };
  }
}
