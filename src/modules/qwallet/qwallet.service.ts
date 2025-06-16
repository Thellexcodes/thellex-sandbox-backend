import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QWALLET_API } from '@/constants/env';
import { HttpService } from '@/middleware/http.service';
import {
  ApiResponse,
  CancelOrderResponse,
  ConfirmSwapResponse,
  CreateOrderResponse,
  CreateSubAccountResponse,
  CreateSwapResponse,
  GetAllOrdersResponse,
  GetAllSwapsResponse,
  GetOrderDetailsResponse,
  GetSwapTransactionResponse,
  GetTemporarySwapQuoteResponse,
  HandleWithdrawPaymentResponse,
  ISubAccountData,
  QWalletWithdrawalFeeResponse,
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
import { QWalletsEntity } from '@/utils/typeorm/entities/qwallet/qwallets.entity';
import { CreateCryptoWithdrawPaymentDto } from '../payments/dto/create-withdraw-crypto.dto';
import { TransactionHistoryService } from '../transaction-history/transaction-history.service';
import { ITransactionHistory } from '../transaction-history/dto/create-transaction-history.dto';
import { FeeLevel, WalletWebhookEventType } from '@/types/wallet-manager.types';
import { PaymentStatus, PaymentType } from '@/types/payment.types';
import { TransactionHistoryEntity } from '@/utils/typeorm/entities/transaction-history.entity';
import {
  IToken,
  TokenEntity,
} from '@/utils/typeorm/entities/token/token.entity';

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
    const localSubaccount = await this.qwalletProfilesRepo.findOne({
      where: { user: { id: user.id } },
      relations: ['user'],
    });

    if (localSubaccount) return localSubaccount;

    try {
      const found = await this.fetchSubAccountFromRemote(user.email);
      if (!found) return null;

      const profile = new QWalletProfileEntity();
      profile.user = user;
      profile.qid = found.id;
      profile.qsn = found.sn;
      profile.walletProvider = WalletProviderEnum.QUIDAX;

      const savedProfile = await this.qwalletProfilesRepo.save(profile);

      const evmChains: SupportedBlockchainType[] = [
        SupportedBlockchainType.BEP20,
      ];

      const evmWallets = await this.fetchOrCreateEvmWallets(profile.qid);

      for (const walletData of evmWallets) {
        const walletType = mapNetworkToWalletType(walletData.defaultNetwork);

        let wallet = await this.qwalletsRepo.findOne({
          where: {
            address: walletData.address,
            walletType,
            profile: { id: savedProfile.id },
          },
          relations: ['tokens'],
        });

        const isNew = !wallet;

        if (!wallet) {
          wallet = new QWalletsEntity();
          wallet.address = walletData.address;
          wallet.walletType = walletType;
          wallet.walletProvider = WalletProviderEnum.QUIDAX;
          wallet.defaultNetwork = walletData.defaultNetwork;
          wallet.networks = evmChains;
          wallet.profile = savedProfile;
          wallet.tokens = [];
        }

        const tokenMap: Map<TokenEnum, TokenEntity> = new Map();

        for (const chain of evmChains) {
          const symbols = ChainTokens[chain] ?? [];

          for (const symbol of symbols) {
            let existing = wallet.tokens?.find((t) => t.assetCode === symbol);

            if (existing) {
              if (!existing.networks.includes(chain)) {
                existing.networks.push(chain);
              }
              tokenMap.set(symbol, existing);
            } else {
              if (!tokenMap.has(symbol)) {
                const token = new TokenEntity();
                token.assetCode = symbol;
                token.walletProvider = WalletProviderEnum.QUIDAX;
                token.qwallet = wallet;
                token.balance = token.walletType = SupportedWalletTypes.EVM;
                token.networks = [chain];
                tokenMap.set(symbol, token);
              } else {
                const token = tokenMap.get(symbol)!;
                if (!token.networks.includes(chain)) {
                  token.networks.push(chain);
                }
              }
            }
          }
        }

        // Save wallet
        isNew ? await this.qwalletsRepo.save(wallet) : wallet;

        // Save tokens one by one
        for (const token of tokenMap.values()) {
          await this.tokenRepo.save(token);
        }
      }

      return savedProfile;
    } catch (error) {
      console.error(error);
      throw new CustomHttpException(
        QwalletErrorEnum.FETCH_SUBACCOUNTS_FAILED,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async lookupSubWallet(address: string): Promise<QWalletsEntity> {
    const wallet = await this.qwalletsRepo.findOne({
      where: { address },
      relations: ['profile', 'profile.user'],
    });
    return wallet;
  }

  private async fetchSubAccountFromRemote(
    email: string,
  ): Promise<ISubAccountData | null> {
    const response: ApiResponse<ISubAccountData[]> = await this.httpService.get(
      `${this.qwalletUrl}/users`,
      { headers: this.getAuthHeaders() },
    );

    return (
      response.data.find(
        (acc) => acc.email?.toLowerCase() === email.toLowerCase(),
      ) ?? null
    );
  }

  private async fetchOrCreateEvmWallets(qid: string): Promise<any> {
    let usdtWalletResponse = await this.getPaymentAddress(qid, TokenEnum.USDT);

    if (Array.isArray(usdtWalletResponse?.data)) {
      return usdtWalletResponse.data;
    }

    const newWalletResponse = await this.createUserWallet(qid, TokenEnum.USDT);
    return newWalletResponse?.data ? [newWalletResponse.data] : [];
  }

  async createSubAccount(
    dto: CreateSubAccountDto,
    user: UserEntity,
  ): Promise<CreateSubAccountResponse> {
    try {
      const subAccountRes =
        await this.httpService.post<CreateSubAccountResponse>(
          `${this.qwalletUrl}/users`,
          dto,
          { headers: this.getAuthHeaders() },
        );

      const record = new QWalletProfileEntity();
      record.user = user;
      record.qid = subAccountRes.data.id;
      record.qsn = subAccountRes.data.sn;
      record.walletProvider = WalletProviderEnum.QUIDAX;

      await this.qwalletProfilesRepo.save(record);

      return subAccountRes;
    } catch (error) {
      //TODO: properly handle errors for 404 / 400 / 500
      throw new CustomHttpException(
        QwalletErrorEnum.SUBACCOUNT_CREATE_FAILED,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async fetchParentAccount() {
    try {
      return await this.httpService.get(`${this.qwalletUrl}/users/me`, {
        headers: this.getAuthHeaders(),
      });
    } catch (error) {
      //TODO: properly handle errors for 404 / 400 / 500
      throw new CustomHttpException(
        QwalletErrorEnum.FETCH_PARENT_ACCOUNT_FAILED,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async fetchAllSubAccounts() {
    try {
      return await this.httpService.get(`${this.qwalletUrl}/api/v1/users`, {
        headers: this.getAuthHeaders(),
      });
    } catch (error) {
      //TODO: properly handle errors for 404 / 400 / 500
      throw new CustomHttpException(
        QwalletErrorEnum.FETCH_SUBACCOUNTS_FAILED,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async fetchSubAccountDetails(uuid: string) {
    try {
      return await this.httpService.get(`${this.qwalletUrl}/users/${uuid}`, {
        headers: this.getAuthHeaders(),
      });
    } catch (error) {
      //TODO: properly handle errors for 404 / 400 / 500
      throw new CustomHttpException(
        QwalletErrorEnum.FETCH_SUBACCOUNT_DETAILS_FAILED,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // >>>>>>>>>>>>>>> Wallets <<<<<<<<<<<<<<<
  async getUserWallets(uuid: string): Promise<any> {
    try {
      const userWallets: any = await this.httpService.get(
        `${this.qwalletUrl}/users/${uuid}/wallets`,
        {
          headers: this.getAuthHeaders(),
        },
      );

      return userWallets;
    } catch (error) {
      //TODO: properly handle errors for 404 / 400 / 500
      throw new CustomHttpException(
        QwalletErrorEnum.GET_USER_WALLETS_FAILED,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getUserWallet(uuid: string, currency: string): Promise<any> {
    try {
      return await this.httpService.get(
        `${this.qwalletUrl}/users/${uuid}/wallets/${currency}`,
        { headers: this.getAuthHeaders() },
      );
    } catch (error) {
      //TODO: properly handle errors for 404 / 400 / 500
      throw new CustomHttpException(
        QwalletErrorEnum.GET_USER_WALLET_FAILED,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async createUserWallet(
    uuid: string,
    currency: TokenEnum,
    network: SupportedBlockchainType = SupportedBlockchainType.BEP20,
  ): Promise<QWalletsEntity | null> {
    try {
      const response = await this.httpService.get<any>(
        `${this.qwalletUrl}/users/${uuid}/wallets/${currency}/addresses?network=${network}`,
        { headers: this.getAuthHeaders() },
      );

      const walletData = response.data;

      // Fetch QWalletProfile with wallets
      const qwalletProfile = await this.qwalletProfilesRepo.findOne({
        where: { qid: uuid },
        relations: ['wallets'],
      });

      if (!qwalletProfile) {
        throw new Error(`No QWalletProfile found for UUID: ${uuid}`);
      }

      // Initialize wallets array if missing
      if (!Array.isArray(qwalletProfile.wallets)) {
        qwalletProfile.wallets = [];
      }

      // Check if wallet for this network and provider already exists
      const exists = qwalletProfile.wallets.some((wallet) =>
        wallet.networks.includes(walletData.network),
      );

      if (exists) {
        return null;
      }

      // Save profile first (required)
      await this.qwalletProfilesRepo.save(qwalletProfile);

      // Create and save new wallet
      const newWallet = this.qwalletsRepo.create({
        ...walletData,
        profile: qwalletProfile,
      });

      const savedWallet: any = await this.qwalletsRepo.save(newWallet);

      return savedWallet;
    } catch (error) {
      console.error('Failed to create user wallet:', error);
      throw error;
    }
  }

  async getPaymentAddress(uuid: string, currency: TokenEnum): Promise<any> {
    try {
      return await this.httpService.get(
        `${this.qwalletUrl}/users/${uuid}/wallets/${currency}/addresses`,
        { headers: this.getAuthHeaders() },
      );
    } catch (error) {
      //TODO: properly handle errors for 404 / 400 / 500
      throw new CustomHttpException(
        QwalletErrorEnum.GET_PAYMENT_ADDRESS_FAILED,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // : Promise<ValidateAddressResponse>
  async validateAddress(address: string, currency: string) {
    try {
      return await this.httpService.get(
        `${this.qwalletUrl}/addresses/validate?currency=${currency}&address=${address}`,
        { headers: this.getAuthHeaders() },
      );
    } catch (error) {
      //TODO: properly handle errors for 404 / 400 / 500
      throw new CustomHttpException(
        QwalletErrorEnum.VALIDATE_ADDRESS_FAILED,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

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

      const transactionData: ITransactionHistory = {
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
  // : Promise<GetWithdrawalResponse>
  async getWithdrawal(uuid: string, reference: string) {
    try {
      return await this.httpService.get(
        `${this.qwalletUrl}/users/${uuid}/withdraw/${reference}`,
        { headers: this.getAuthHeaders() },
      );
    } catch (error) {
      //TODO: properly handle errors for 404 / 400 / 500
      throw new CustomHttpException(
        QwalletErrorEnum.GET_WITHDRAWAL_FAILED,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getCryptoWithdrawalFees(
    currency: string,
  ): Promise<ApiResponse<QWalletWithdrawalFeeResponse>> {
    return firstValueFrom(
      await this.httpService.get(`${this.qwalletUrl}/fee}`, {
        headers: this.getAuthHeaders(),
        params: { currency },
      }),
    );
  }

  async fetchOffRampTransaction(
    transactionId: string,
  ): Promise<AxiosResponse<any>> {
    const url = `${this.qwalletUrl}/off-ramp/transactions/${transactionId}`;
    return firstValueFrom(
      await this.httpService.get(url, { headers: this.getAuthHeaders() }),
    );
  }

  async getPaymentMethods(): Promise<AxiosResponse<any>> {
    const url = `${this.qwalletUrl}/payment-methods`;
    return firstValueFrom(
      await this.httpService.get(url, { headers: this.getAuthHeaders() }),
    );
  }

  async getPurchaseLimitsBuy(): Promise<AxiosResponse<any>> {
    const url = `${this.qwalletUrl}/purchase-limits/buy`;
    return firstValueFrom(
      await this.httpService.get(url, { headers: this.getAuthHeaders() }),
    );
  }

  async getPurchaseLimitsSell(): Promise<AxiosResponse<any>> {
    const url = `${this.qwalletUrl}/purchase-limits/sell`;
    return firstValueFrom(
      await this.httpService.get(url, { headers: this.getAuthHeaders() }),
    );
  }

  async getPurchaseQuoteBuy(params: {
    currency: string;
    amount: string;
  }): Promise<AxiosResponse<any>> {
    const url = `${this.qwalletUrl}/purchase-quotes/buy`;
    return await firstValueFrom(
      await this.httpService.get(this.qwalletUrl, {
        headers: this.getAuthHeaders(),
        params,
      }),
    );
  }

  async getPurchaseQuoteSell(params: {
    currency: string;
    amount: string;
  }): Promise<AxiosResponse<any>> {
    const url = `${this.qwalletUrl}/purchase-quotes/sell`;
    return firstValueFrom(
      await this.httpService.get(url, {
        headers: this.getAuthHeaders(),
        params,
      }),
    );
  }

  // >>>>>>>>>>>>>>> Swaps - Off-Ramp <<<<<<<<<<<<<<<
  async createSwap(createSwapDto: CreateSwapDto): Promise<CreateSwapResponse> {
    const url = `${this.qwalletUrl}/swaps`;
    return firstValueFrom(
      await this.httpService.post(url, createSwapDto, {
        headers: this.getAuthHeaders(),
      }),
    );
  }
  async confirmSwap(swapId: string): Promise<ConfirmSwapResponse> {
    const url = `${this.qwalletUrl}/swaps/${swapId}/confirm`;
    return firstValueFrom(
      await this.httpService.post(url, {}, { headers: this.getAuthHeaders() }),
    );
  }
  async refreshSwapQuote(swapId: string): Promise<RefreshSwapQuoteResponse> {
    const url = `${this.qwalletUrl}/swaps/${swapId}/refresh`;
    return firstValueFrom(
      await this.httpService.get(url, { headers: this.getAuthHeaders() }),
    );
  }
  async getTemporarySwapQuote(
    dto: CreateSwapDto,
  ): Promise<GetTemporarySwapQuoteResponse> {
    const url = `${this.qwalletUrl}/swaps/quote`;
    return firstValueFrom(
      await this.httpService.get(url, { headers: this.getAuthHeaders() }),
    );
  }
  async getSwapTransaction(
    swapId: string,
  ): Promise<GetSwapTransactionResponse> {
    const url = `${this.qwalletUrl}/swaps/${swapId}`;
    return firstValueFrom(
      await this.httpService.get(url, { headers: this.getAuthHeaders() }),
    );
  }
  async getAllSwaps(): Promise<GetAllSwapsResponse[]> {
    const url = `${this.qwalletUrl}/swaps`;
    return firstValueFrom(
      await this.httpService.get(url, { headers: this.getAuthHeaders() }),
    );
  }

  // >>>>>>>>>>>>>>> Orders - Off-Ramp <<<<<<<<<<<<<<<
  async createOrder(dto: CreateOrderDto): Promise<CreateOrderResponse> {
    const url = `${this.qwalletUrl}/orders`;
    return firstValueFrom(
      await this.httpService.post(url, dto, { headers: this.getAuthHeaders() }),
    );
  }

  async getAllOrders(user_id: string = 'me'): Promise<GetAllOrdersResponse> {
    const url = `${this.qwalletUrl}/orders?user_id=${user_id}`;
    return firstValueFrom(
      await this.httpService.get(url, { headers: this.getAuthHeaders() }),
    );
  }

  async getOrderDetails(orderId: string): Promise<GetOrderDetailsResponse> {
    const url = `${this.qwalletUrl}/orders/${orderId}`;
    return firstValueFrom(
      await this.httpService.get(url, { headers: this.getAuthHeaders() }),
    );
  }

  async cancelOrder(orderId: string): Promise<CancelOrderResponse> {
    const url = `${this.qwalletUrl}/orders/${orderId}/cancel`;
    return firstValueFrom(
      await this.httpService.post(url, null, {
        headers: this.getAuthHeaders(),
      }),
    );
  }

  // >>>>>>>>>>>>>>> Asset Request <<<<<<<<<<<<<<<
  async findWalletByUserAndNetwork(
    user: UserEntity,
    network: SupportedBlockchainType,
    assetCode: TokenEnum,
  ): Promise<IQWallet | null> {
    const profile = user.qWalletProfile;

    if (!profile || !profile.wallets) {
      return null;
    }

    for (const wallet of profile.wallets) {
      // Make sure tokens are loaded
      if (!wallet.tokens) continue;

      // Find token matching assetCode
      const token = wallet.tokens.find(
        (t) =>
          t.assetCode === assetCode &&
          Array.isArray(t.networks) &&
          t.networks.includes(network),
      );

      if (token) return wallet;
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

  async storeTokensForWallet(wallet: IQWallet): Promise<void> {
    const tokenSymbols =
      ChainTokens[wallet.defaultNetwork as SupportedBlockchainType] || [];

    const tokenEntities = tokenSymbols.map((symbol) => {
      const token = new TokenEntity();
      token.assetCode = symbol;
      token.name = symbol;
      token.balance = '0';
      token.qwallet = wallet as any;
      return token;
    });

    await this.tokenRepo.save(tokenEntities);
  }
}
