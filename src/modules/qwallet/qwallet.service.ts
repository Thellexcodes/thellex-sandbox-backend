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
  GetSwapTransactionResponse,
  GetTemporarySwapQuoteResponse,
  GetUserWalletResponse,
  GetUserWalletsResponse,
  QWalletWithdrawalFeeResponse,
  RefreshSwapQuoteResponse,
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

@Injectable()
export class QwalletService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    @InjectRepository(QwalletEntity)
    private readonly qwalletRepo: Repository<QwalletEntity>,
  ) {}

  /**
   * Check if subaccount already exists for a user.
   */
  async lookupSubaccount(user: UserEntity): Promise<QwalletEntity | null> {
    return this.qwalletRepo.findOne({ where: { user } });
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
      newSubAccountRecord.quidaxId = subAccountRes.data.id;
      newSubAccountRecord.user = user;
      newSubAccountRecord.quidaxSn = subAccountRes.data.sn;
      await this.qwalletRepo.save(newSubAccountRecord);

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
      return await this.httpService.get(`${this.qwalletUrl}/users`, {
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
    currency: string,
  ): Promise<CreateUserWalletResponse> {
    try {
      return await this.httpService.get(
        `${this.qwalletUrl}/users/${uuid}/wallets/${currency}`,
        { headers: this.getAuthHeaders() },
      );
    } catch (error) {
      //TODO: properly handle errors for 404 / 400 / 500
      throw new CustomHttpException(
        QwalletErrorEnum.CREATE_USER_WALLET_FAILED,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getPaymentAddress(uuid: string, currency: string) {
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
  //  Promise<CreateWithdrawalResponse> {
  async createWithdrawal(uuid: string, dto: any) {
    try {
      return await this.httpService.post(
        `${this.qwalletUrl}/users/${uuid}/withdraw`,
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
