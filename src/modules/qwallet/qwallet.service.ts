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
  CreateUserWalletResponse,
  GetAllOrdersResponse,
  GetAllSwapsResponse,
  GetOrderDetailsResponse,
  GetPaymentAddressResponse,
  GetSwapTransactionResponse,
  GetTemporarySwapQuoteResponse,
  GetUserWalletResponse,
  GetUserWalletsResponse,
  HandleWithdrawPaymentResponse,
  QWallet,
  QWalletWithdrawalFeeResponse,
  RefreshSwapQuoteResponse,
  SubAccountData,
} from '@/types/qwallet.types';
import { QwalletErrorEnum } from '@/types/qwallet-error.enum';
import { QwalletEntity } from '@/utils/typeorm/entities/qwallet.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '@/utils/typeorm/entities/user.entity';
import { CustomHttpException } from '@/middleware/custom.http.exception';
import { CreateSubAccountDto } from './dto/create-qwallet.dto';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import { CreateSwapDto } from './dto/create-swap.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { SupportedBlockchain, Token } from '@/config/settings';
import { GetWalletBalanceResponse } from 'dojah-typescript-sdk';

@Injectable()
export class QwalletService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    @InjectRepository(QwalletEntity)
    private readonly qwalletRepo: Repository<QwalletEntity>,
  ) {}

  // >>>>>>>>>>>>>>> SubAcocunts <<<<<<<<<<<<<<<

  async lookupSubaccount(user: UserEntity): Promise<QwalletEntity | null> {
    const localSubaccount = await this.qwalletRepo.findOne({
      where: { user: { id: user.id } },
      relations: ['user'],
    });

    if (localSubaccount) {
      return localSubaccount;
    }

    // If not found, optionally try to fetch from QWallet server
    try {
      const allSubaccountsResponse: ApiResponse<SubAccountData[]> =
        await this.httpService.get(`${this.qwalletUrl}/users`, {
          headers: this.getAuthHeaders(),
        });

      const subaccounts = allSubaccountsResponse.data;

      const found = subaccounts.find(
        (acc: SubAccountData) =>
          acc.email?.toLowerCase() === user.email?.toLowerCase(),
      );

      if (found) {
        const data = new QwalletEntity();
        data.user = user;
        data.qid = found.id;
        data.qsn = found.sn;

        // Reuse existing wallets if they exist
        const existingQwallet = await this.qwalletRepo.findOne({
          where: { qid: found.id },
        });

        data.wallets = existingQwallet?.wallets ?? [];

        // Get USDT wallets
        let usdtWalletResponse = await this.getPaymentAddress(
          data.qid,
          Token.USDT,
        );

        let usdtWallets: QWallet[] = [];

        if (usdtWalletResponse && Array.isArray(usdtWalletResponse.data)) {
          usdtWallets = usdtWalletResponse.data;
        } else {
          // Create wallet if not found or invalid response
          const newWalletResponse = await this.createUserWallet(
            found.id,
            Token.USDT,
          );
          if (newWalletResponse?.data) {
            usdtWallets = [newWalletResponse.data];
          }
        }

        // Update or insert USDT wallet(s)
        for (const wallet of usdtWallets) {
          const index = data.wallets.findIndex(
            (w) => w.currency === wallet.currency,
          );
          if (index >= 0) {
            data.wallets[index] = wallet;
          } else {
            data.wallets.push(wallet);
          }
        }

        const qwallet = await this.qwalletRepo.save(data);
        return qwallet;
      }

      return null;
    } catch (error) {
      console.log(error);
      throw new CustomHttpException(
        QwalletErrorEnum.FETCH_SUBACCOUNTS_FAILED,
        HttpStatus.BAD_REQUEST,
      );
    }
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

      const newSubAccountRecord = new QwalletEntity();
      newSubAccountRecord.user = user;
      newSubAccountRecord.qid = subAccountRes.data.id;
      newSubAccountRecord.qsn = subAccountRes.data.sn;

      console.log(newSubAccountRecord);

      // await this.qwalletRepo.save(newSubAccountRecord);

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
  async getUserWallets(uuid: string): Promise<GetUserWalletsResponse> {
    try {
      const userWallets: GetUserWalletsResponse = await this.httpService.get(
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

  async getUserWallet(
    uuid: string,
    currency: string,
  ): Promise<GetUserWalletResponse> {
    try {
      return await this.httpService.get(
        `${this.qwalletUrl}/users/${uuid}/wallets/${currency}`,
        { headers: this.getAuthHeaders() },
      );

      //   "networks": [
      //   {
      //     "id": "bep20",
      //     "name": "Binance Smart Chain",
      //     "deposits_enabled": true,
      //     "withdraws_enabled": true
      //   },
      //   {
      //     "id": "erc20",
      //     "name": "Ethereum Network",
      //     "deposits_enabled": true,
      //     "withdraws_enabled": true
      //   },
      //   {
      //     "id": "trc20",
      //     "name": "Tron Network",
      //     "deposits_enabled": true,
      //     "withdraws_enabled": true
      //   },
      //   {
      //     "id": "polygon",
      //     "name": "Polygon Network",
      //     "deposits_enabled": true,
      //     "withdraws_enabled": true
      //   },
      //   {
      //     "id": "solana",
      //     "name": "Solana Network",
      //     "deposits_enabled": true,
      //     "withdraws_enabled": true
      //   },
      //   {
      //     "id": "celo",
      //     "name": "Celo Network",
      //     "deposits_enabled": true,
      //     "withdraws_enabled": true
      //   },
      //   {
      //     "id": "optimism",
      //     "name": "Optimism Network",
      //     "deposits_enabled": true,
      //     "withdraws_enabled": true
      //   },
      //   {
      //     "id": "ton",
      //     "name": "Ton Network",
      //     "deposits_enabled": true,
      //     "withdraws_enabled": true
      //   },
      //   {
      //     "id": "arbitrum",
      //     "name": "Arbitrum Network",
      //     "deposits_enabled": true,
      //     "withdraws_enabled": false
      //   }
      // ],
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
    currency: Token,
  ): Promise<CreateUserWalletResponse> {
    try {
      const response: CreateUserWalletResponse = await this.httpService.get(
        `${this.qwalletUrl}/users/${uuid}/wallets/${currency}`,
        { headers: this.getAuthHeaders() },
      );

      // Find QwalletEntity
      const qwallet = await this.qwalletRepo.findOne({ where: { qid: uuid } });

      if (qwallet) {
        // Initialize wallets array if null
        if (!qwallet.wallets) {
          qwallet.wallets = [];
        }

        // Avoid adding duplicates
        const alreadyExists = qwallet.wallets.some(
          (w) => w.currency === response.data.currency,
        );

        if (!alreadyExists) {
          qwallet.wallets.push(response.data);
          await this.qwalletRepo.save(qwallet);
        }
      }

      return response;
    } catch (error) {
      console.log(error);
      //TODO: properly handle errors for 404 / 400 / 500
      throw new CustomHttpException(
        QwalletErrorEnum.CREATE_USER_WALLET_FAILED,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getPaymentAddress(
    uuid: string,
    currency: Token,
  ): Promise<GetPaymentAddressResponse> {
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
  //  Promise<CreateWithdrawalResponse> {
  async createWithdrawal(
    uuid: string,
    dto: any,
  ): Promise<HandleWithdrawPaymentResponse> {
    try {
      return await this.httpService.post<HandleWithdrawPaymentResponse>(
        `${this.qwalletUrl}/users/${uuid}/withdraws`,
        dto,
        { headers: this.getAuthHeaders() },
      );
    } catch (error) {
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
    network: SupportedBlockchain,
    assetCode: Token,
  ): Promise<QWallet | null> {
    if (!user.qwallet || !user.qwallet.wallets) {
      return null;
    }

    // Look for wallet matching the network and assetCode
    const matchedWallet = user.qwallet.wallets.find(
      (wallet) => wallet.network === network && wallet.currency === assetCode,
    );

    return matchedWallet || null;
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
