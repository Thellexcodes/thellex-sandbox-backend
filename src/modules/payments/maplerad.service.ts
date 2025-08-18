import { getAppConfig } from '@/constants/env';
import { HttpService } from '@/middleware/http.service';
import {
  IMapleradTransferResponseDto,
  IMapleradWalletDto,
  IMapleradWalletResponseDto,
  IMRBankAccountResponseDto,
  IMRCreateCustomerResponseDto,
  IMRCustomerDataDto,
  IMRInstitutionResponseDto,
} from '@/models/maplerad.types';
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { ICreateMalperadFiatWithdrawPaymentDto } from './dto/create-withdraw-fiat.dto';
import { FiatEnum } from '@/config/settings';

@Injectable()
export class MapleradService {
  private readonly logger = new Logger(MapleradService.name);
  private readonly baseUrl = 'https://api.maplerad.com/v1';

  constructor(private readonly httpService: HttpService) {}

  // Customers
  async getCustomer(customerId: string) {
    const path = `/customers/${customerId}`;
    const url = `${this.baseUrl}${path}`;
    const headers = this.generateAuthHeaders(RequestMethodsEnum.GET, path);
    return await this.httpService.get(url, { headers });
  }

  async upgradeCustomer(customerId: string, tier: 1 | 2) {
    const path = `/customers/${customerId}`;
    const url = `${this.baseUrl}${path}`;
    const headers = this.generateAuthHeaders(RequestMethodsEnum.PATCH, path);
    return await this.httpService.patch(url, { tier }, { headers });
  }

  async enrollCustomer(
    payload: Record<string, any>,
  ): Promise<IMRCreateCustomerResponseDto<IMRCustomerDataDto>> {
    const path = '/customers/enroll';
    const url = `${this.baseUrl}${path}`;
    const headers = this.generateAuthHeaders(RequestMethodsEnum.POST, path);
    return await this.httpService.post(url, payload, { headers });
  }

  async whitelistCustomer(customerId: string, whitelist: boolean) {
    const path = `/customers/whitelist`; // or /blacklist based on flag
    const url = `${this.baseUrl}${path}`;
    const headers = this.generateAuthHeaders(RequestMethodsEnum.POST, path);
    return await this.httpService.post(
      url,
      { customer_id: customerId, whitelist },
      { headers },
    );
  }

  async getAllCustomers() {
    const path = '/customers';
    const url = `${this.baseUrl}${path}`;
    const headers = this.generateAuthHeaders(RequestMethodsEnum.GET, path);
    return await this.httpService.get(url, { headers });
  }

  async getCustomerAccounts(customerId: string) {
    const path = `/customers/${customerId}/accounts`;
    const url = `${this.baseUrl}${path}`;
    const headers = this.generateAuthHeaders(RequestMethodsEnum.GET, path);
    return await this.httpService.get(url, { headers });
  }

  async getCustomerTransactions(customerId: string) {
    const path = `/customers/${customerId}/transactions`;
    const url = `${this.baseUrl}${path}`;
    const headers = this.generateAuthHeaders(RequestMethodsEnum.GET, path);
    return await this.httpService.get(url, { headers });
  }

  async getCustomerVirtualAccounts(customerId: string) {
    const path = `/customers/${customerId}/virtual-accounts`;
    const url = `${this.baseUrl}${path}`;
    const headers = this.generateAuthHeaders(RequestMethodsEnum.GET, path);
    return await this.httpService.get(url, { headers });
  }

  // Banking
  async createBankingAccount(
    payload: Record<string, any>,
  ): Promise<IMRBankAccountResponseDto> {
    const path = '/collections/virtual-account';
    const url = `${this.baseUrl}${path}`;
    const headers = this.generateAuthHeaders(RequestMethodsEnum.POST, path);
    return await this.httpService.post(url, payload, { headers });
  }

  async verifyBankingTransaction(transactionId: string): Promise<any> {
    const path = `/banking/transactions/${transactionId}`;
    const url = `${this.baseUrl}${path}`;
    const headers = this.generateAuthHeaders(RequestMethodsEnum.GET, path);

    const response = await axios.get(url, { headers });
    return response.data;
  }

  async sendMobileMoney(payload: Record<string, any>): Promise<any> {
    const path = '/banking/mobile-money';
    const url = `${this.baseUrl}${path}`;
    const headers = this.generateAuthHeaders(RequestMethodsEnum.POST, path);

    const response = await axios.post(url, payload, { headers });
    return response.data;
  }

  async createUsdAccount(payload: Record<string, any>): Promise<any> {
    const path = '/banking/usd/accounts';
    const url = `${this.baseUrl}${path}`;
    const headers = this.generateAuthHeaders(RequestMethodsEnum.POST, path);

    const response = await axios.post(url, payload, { headers });
    return response.data;
  }

  async checkAccountRequestStatus(requestId: string): Promise<any> {
    const path = `/accounts/request-status/${requestId}`;
    const url = `${this.baseUrl}${path}`;
    const headers = this.generateAuthHeaders(RequestMethodsEnum.GET, path);

    const response = await axios.get(url, { headers });
    return response.data;
  }

  async getVirtualAccountById(accountId: string): Promise<any> {
    const path = `/accounts/${accountId}`;
    const url = `${this.baseUrl}${path}`;
    const headers = this.generateAuthHeaders(RequestMethodsEnum.GET, path);

    const response = await axios.get(url, { headers });
    return response.data;
  }

  async createCounterparty(payload: Record<string, any>): Promise<any> {
    const path = '/counterparty';
    const url = `${this.baseUrl}${path}`;
    const headers = this.generateAuthHeaders(RequestMethodsEnum.POST, path);

    const response = await axios.post(url, payload, { headers });
    return response.data;
  }

  async getCounterparty(counterpartyId: string): Promise<any> {
    const path = `/counterparty/${counterpartyId}`;
    const url = `${this.baseUrl}${path}`;
    const headers = this.generateAuthHeaders(RequestMethodsEnum.GET, path);

    const response = await axios.get(url, { headers });
    return response.data;
  }

  async getSupportedRails(): Promise<any> {
    const path = '/rails/supported';
    const url = `${this.baseUrl}${path}`;
    const headers = this.generateAuthHeaders(RequestMethodsEnum.GET, path);

    const response = await axios.get(url, { headers });
    return response.data;
  }

  async getCounterpartyByAccountId(accountId: string): Promise<any> {
    const path = `/counterparty/account/${accountId}`;
    const url = `${this.baseUrl}${path}`;
    const headers = this.generateAuthHeaders(RequestMethodsEnum.GET, path);

    const response = await axios.get(url, { headers });
    return response.data;
  }

  // Bills

  // Transfers
  async localTransferAfrica(
    payload: ICreateMalperadFiatWithdrawPaymentDto,
  ): Promise<IMapleradTransferResponseDto> {
    try {
      const path = '/transfers';
      const url = `${this.baseUrl}${path}`;
      const headers = this.generateAuthHeaders(RequestMethodsEnum.POST, path);
      const response: IMapleradTransferResponseDto =
        await this.httpService.post(url, payload, { headers });
      return response;
    } catch (err) {
      console.log(err);
    }
  }

  async usTransfer(data, apiKey) {
    try {
      const response = await axios.post(
        'https://api.example.com/transfer/us',
        data,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error(
        'US Transfer Error:',
        error.response?.data || error.message,
      );
      throw error;
    }
  }

  async getTransfers(apiKey) {
    try {
      const response = await axios.get('https://api.example.com/transfers', {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error(
        'Get Transfers Error:',
        error.response?.data || error.message,
      );
      throw error;
    }
  }

  async verifyTransfer(identifier, apiKey) {
    try {
      const response = await axios.get(
        `https://api.example.com/transfers/verify/${identifier}`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error(
        'Verify Transfer Error:',
        error.response?.data || error.message,
      );
      throw error;
    }
  }

  // Virtual Account
  async createVirtualAccount(customerId: string, currency: string = 'NGN') {
    const path = '/collections/virtual-account';
    const url = `${this.baseUrl}${path}`;
    const headers = this.generateAuthHeaders(RequestMethodsEnum.POST, path);
    return await this.httpService.post(
      url,
      { customer_id: customerId, currency },
      { headers },
    );
  }

  // Cards
  async createCard(payload: Record<string, any>) {
    const path = '/issuing/card';
    const url = `${this.baseUrl}${path}`;
    const headers = this.generateAuthHeaders(RequestMethodsEnum.POST, path);
    return await this.httpService.post(url, payload, { headers });
  }

  async createBusinessCard(payload: Record<string, any>) {
    const path = '/issuing/business-card';
    const url = `${this.baseUrl}${path}`;
    const headers = this.generateAuthHeaders(RequestMethodsEnum.POST, path);
    return await this.httpService.post(url, payload, { headers });
  }

  async fundCard(cardId: string, amount: number, currency: string = 'USD') {
    const path = '/issuing/fund';
    const url = `${this.baseUrl}${path}`;
    const headers = this.generateAuthHeaders(RequestMethodsEnum.POST, path);
    return await this.httpService.post(
      url,
      { card_id: cardId, amount, currency },
      { headers },
    );
  }

  async withdrawFromCard(cardId: string, amount: number) {
    const path = '/issuing/withdraw';
    const url = `${this.baseUrl}${path}`;
    const headers = this.generateAuthHeaders(RequestMethodsEnum.POST, path);
    return await this.httpService.post(
      url,
      { card_id: cardId, amount },
      { headers },
    );
  }

  async getAllCards() {
    const path = '/issuing/cards';
    const url = `${this.baseUrl}${path}`;
    const headers = this.generateAuthHeaders(RequestMethodsEnum.GET, path);
    return await this.httpService.get(url, { headers });
  }

  async getCard(cardId: string) {
    const path = `/issuing/cards/${cardId}`;
    const url = `${this.baseUrl}${path}`;
    const headers = this.generateAuthHeaders(RequestMethodsEnum.GET, path);
    return await this.httpService.get(url, { headers });
  }

  async freezeCard(cardId: string) {
    const path = `/issuing/cards/${cardId}/freeze`;
    const url = `${this.baseUrl}${path}`;
    const headers = this.generateAuthHeaders(RequestMethodsEnum.PATCH, path);
    return await this.httpService.patch(url, {}, { headers });
  }

  async unfreezeCard(cardId: string) {
    const path = `/issuing/cards/${cardId}/unfreeze`;
    const url = `${this.baseUrl}${path}`;
    const headers = this.generateAuthHeaders(RequestMethodsEnum.PATCH, path);
    return await this.httpService.patch(url, {}, { headers });
  }

  async getCardTransactions(cardId: string) {
    const path = `/issuing/cards/${cardId}/transactions`;
    const url = `${this.baseUrl}${path}`;
    const headers = this.generateAuthHeaders(RequestMethodsEnum.GET, path);
    return await this.httpService.get(url, { headers });
  }

  // Airtime/Data/Bill Payment
  async getBillers() {
    const path = '/bills/billers';
    const url = `${this.baseUrl}${path}`;
    const headers = this.generateAuthHeaders(RequestMethodsEnum.GET, path);
    return await this.httpService.get(url, { headers });
  }

  async buyAirtime(payload: Record<string, any>) {
    const path = '/bills/airtime';
    const url = `${this.baseUrl}${path}`;
    const headers = this.generateAuthHeaders(RequestMethodsEnum.POST, path);
    return await this.httpService.post(url, payload, { headers });
  }

  async buyData(payload: Record<string, any>) {
    const path = '/bills/data';
    const url = `${this.baseUrl}${path}`;
    const headers = this.generateAuthHeaders(RequestMethodsEnum.POST, path);
    return await this.httpService.post(url, payload, { headers });
  }

  async buyElectricity(payload: Record<string, any>) {
    const path = '/bills/electricity';
    const url = `${this.baseUrl}${path}`;
    const headers = this.generateAuthHeaders(RequestMethodsEnum.POST, path);
    return await this.httpService.post(url, payload, { headers });
  }

  // FX
  async generateFXQuote(payload: Record<string, any>) {
    const path = '/fx/quote';
    const url = `${this.baseUrl}${path}`;
    const headers = this.generateAuthHeaders(RequestMethodsEnum.POST, path);
    return await this.httpService.post(url, payload, { headers });
  }

  async exchangeCurrency(payload: Record<string, any>) {
    const path = '/fx/exchange';
    const url = `${this.baseUrl}${path}`;
    const headers = this.generateAuthHeaders(RequestMethodsEnum.POST, path);
    return await this.httpService.post(url, payload, { headers });
  }

  async getFXHistory() {
    const path = '/fx/history';
    const url = `${this.baseUrl}${path}`;
    const headers = this.generateAuthHeaders(RequestMethodsEnum.GET, path);
    return await this.httpService.get(url, { headers });
  }

  private generateAuthHeaders(method: RequestMethodsEnum, path: string) {
    return {
      Authorization: `Bearer ${getAppConfig().MPR.SECRET_KEY}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
  }

  // Identity

  //Institutions
  async getAllInstitutions(): Promise<IMRInstitutionResponseDto> {
    const path = '/institutions?country=NG';
    const url = `${this.baseUrl}${path}`;
    const headers = this.generateAuthHeaders(RequestMethodsEnum.GET, path);

    const response = await axios.get(url, { headers });
    return response.data?.data;
  }

  async fetchBankDetails(payload: { identifier: string }): Promise<any> {
    const path = '/institutions/details';
    const url = `${this.baseUrl}${path}`;
    this.logger.log({ payload });
    const headers = this.generateAuthHeaders(RequestMethodsEnum.POST, path);
    const response = await axios.post(url, payload, { headers });
    return response.data;
  }

  async resolveInstitutionAccount(payload: {
    bank_code: string;
    account_number: string;
  }): Promise<{ account_number: string; account_name: string }> {
    const path = '/institutions/resolve';

    const url = `${this.baseUrl}${path}`;

    const headers = this.generateAuthHeaders(RequestMethodsEnum.POST, path);
    const response = await this.httpService.post(url, payload, { headers });

    return response.data;
  }

  // Simulation API Functions
  async creditTestWallet(payload: {
    currency: string;
    amount: number;
    description: string;
  }): Promise<any> {
    const path = '/simulations/wallet/credit';
    const url = `${this.baseUrl}${path}`;
    const headers = this.generateAuthHeaders(RequestMethodsEnum.POST, path);

    const response = await this.httpService.post(url, payload, { headers });
    return response.data;
  }

  async mockCardTransaction(payload: {
    amount: number;
    currency: string;
    card_last4: string;
    card_type: string;
    status: 'successful' | 'failed';
  }): Promise<any> {
    const path = '/simulations/transactions/card';
    const url = `${this.baseUrl}${path}`;
    const headers = this.generateAuthHeaders(RequestMethodsEnum.POST, path);

    const response = await axios.post(url, payload, { headers });
    return response.data;
  }

  async mockCollectionTransaction(payload: {
    amount: number;
    currency: string;
    account_number: string;
    bank_code: string;
    status: 'successful' | 'failed';
  }): Promise<any> {
    const path = '/simulations/transactions/collection';
    const url = `${this.baseUrl}${path}`;
    const headers = this.generateAuthHeaders(RequestMethodsEnum.POST, path);

    const response = await axios.post(url, payload, { headers });
    return response.data;
  }

  async checkLiquidity(currency: FiatEnum): Promise<IMapleradWalletDto> {
    const path = `/wallets`;
    const url = `${this.baseUrl}${path}`;
    const headers = this.generateAuthHeaders(RequestMethodsEnum.GET, path);
    const result = (await this.httpService.get(url, {
      headers,
    })) as IMapleradWalletResponseDto;
    return result.data.find((c) => c.currency === 'NGN');
  }
}

export enum RequestMethodsEnum {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
  OPTIONS = 'OPTIONS',
  HEAD = 'HEAD',
}
