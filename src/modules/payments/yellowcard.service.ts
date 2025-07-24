import { getAppConfig } from '@/constants/env';
import { HttpService } from '@/middleware/http.service';
import { AnyObject } from '@/models/any.types';
import {
  IYCAcceptCollectionRequestPayload,
  IYCAcceptPaymentResponse,
  IYCChannelsResponseType,
  IYCNetworksResponseType,
  IYCollectionRequestResponseType,
  IYCPaymentRequestResponse,
  IYellowCardWebhookConfig,
} from '@/models/yellocard.models';

import { generateYcSignature } from '@/utils/helpers';
import { Injectable } from '@nestjs/common';
import { rateCache } from '@/utils/constants';
import {
  IYellowCardRateDto,
  IYellowCardRatesResponseDto,
} from './dto/yellocard.dto';
import axios, { AxiosRequestHeaders } from 'axios';

@Injectable()
export class YellowCardService {
  constructor(private readonly httpService: HttpService) {}

  // --- Payments API ---

  // Get Channels
  async getChannels(crypto?: boolean): IYCChannelsResponseType {
    const method = 'GET';
    const path = crypto ? '/business/channels/crypto' : '/business/channels';
    const url = crypto
      ? `${this.ycUrl}${path}`
      : `${this.ycUrl}${path}?country=NG`;
    const headers = this.generateAuthHeaders(method, path);
    return await this.httpService.get<IYCChannelsResponseType>(url, {
      headers,
    });
  }

  // Get Networks
  async getNetworks(): IYCNetworksResponseType {
    const method = 'GET';
    const path = '/business/networks';
    const url = `${this.ycUrl}${path}`;
    const headers = this.generateAuthHeaders(method, path);
    return await this.httpService.get<IYCNetworksResponseType>(url, {
      headers,
    });
  }

  // Get Rates
  async getRates(): Promise<IYellowCardRatesResponseDto> {
    const method = 'GET';
    const path = '/business/rates';
    const url = `${this.ycUrl}${path}`;
    const headers = this.generateAuthHeaders(method, path);
    return await this.httpService.get(url, { headers });
  }

  // Get Account
  async getAccount() {
    const method = 'GET';
    const path = '/business/account';
    const url = `${this.ycUrl}${path}`;
    const headers = this.generateAuthHeaders(method, path);
    return await this.httpService.get(url, { headers });
  }

  // Resolve Bank Account
  async resolveBankAccount(body: AnyObject) {
    const method = 'POST';
    const path = '/business/details/bank';
    const url = `${this.ycUrl}${path}`;
    const headers = this.generateAuthHeaders(method, path, body);
    return await this.httpService.post(url, body, { headers });
  }

  // Widget Quote
  async widgetQuote(body: AnyObject) {
    // const method = 'POST';
    // const path = '/business/widget/quote';
    // const url = `${this.ycUrl}/widget/quote`;
    // const headers = this.generateAuthHeaders(method, path, body);
    // return  this.httpService.post(url, body, { headers });
  }

  // --- Payments ---
  async submitPaymentRequest(
    body: AnyObject,
  ): Promise<IYCPaymentRequestResponse | undefined> {
    try {
      const method = 'POST';
      const path = '/business/payments';
      const url = `${this.ycUrl}${path}`;
      const headers = this.generateAuthHeaders(method, path, body);
      const response = await axios.post<IYCPaymentRequestResponse>(url, body, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error('submitPaymentRequest error:', error);
      // Optionally rethrow or handle error as needed
    }
  }

  // async submitPaymentRequest(
  //   body: AnyObject,
  // ): Promise<IYCPaymentRequestResponse> {
  //   try {
  //     const method = 'POST';
  //     const path = '/business/payments';
  //     const url = `${this.ycUrl}${path}`;
  //     const headers = this.generateAuthHeaders(method, path, body);
  //     return await this.httpService.post(url, body, { headers });
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  async acceptPaymentRequest({
    id,
  }: AnyObject): Promise<IYCAcceptPaymentResponse> {
    const method = 'POST';
    const path = `/business/payments/${id}/accept`;
    const url = `${this.ycUrl}${path}`;
    const headers = this.generateAuthHeaders(method, path);
    return await this.httpService.post(url, {}, { headers });
  }

  async denyPaymentRequest({ id }: AnyObject) {
    const method = 'POST';
    const path = `/business/payments/${id}/deny`;
    const url = `${this.ycUrl}${path}`;
    const headers = this.generateAuthHeaders(method, path);
    return await this.httpService.post(url, {}, { headers });
  }

  async lookupPayment(id: string) {
    const method = 'GET';
    const path = `/business/payments/${id}`;
    const url = `${this.ycUrl}${path}`;
    const headers = this.generateAuthHeaders(method, path);
    return await this.httpService.get(url, { headers });
  }

  async lookupPaymentBySequenceId(sequenceId: string) {
    const method = 'GET';
    const path = `/payments/lookup/${sequenceId}`;
    const url = `${this.ycUrl}/payments/lookup/${sequenceId}`;
    const headers = this.generateAuthHeaders(method, path);
    return this.httpService.get(url, { headers });
  }

  async listPayments() {
    const method = 'GET';
    const path = '/payments/list';
    const url = `${this.ycUrl}/payments/list`;
    const headers = this.generateAuthHeaders(method, path);
    return this.httpService.get(url, { headers });
  }

  // --- Collections ---
  async submitCollectionRequest(
    body: AnyObject,
  ): IYCollectionRequestResponseType {
    const method = 'POST';
    const path = '/business/collections';
    const url = `${this.ycUrl}${path}`;
    const headers = this.generateAuthHeaders(method, path, body);
    return await this.httpService.post(url, body, { headers });
  }

  async acceptCollectionRequest(body: IYCAcceptCollectionRequestPayload) {
    const method = 'POST';
    const path = '/collections/accept';
    const url = `${this.ycUrl}${path}`;
    const headers = this.generateAuthHeaders(method, path);
    return await this.httpService.post(url, body, { headers });
  }

  async denyCollectionRequest(body: object) {
    const method = 'POST';
    const path = '/collections/deny';
    const url = `${this.ycUrl}/collections/deny`;
    const headers = this.generateAuthHeaders(method, path, body);
    return this.httpService.post(url, body, { headers });
  }

  async cancelCollection(body: object) {
    const method = 'POST';
    const path = '/collections/cancel';
    const url = `${this.ycUrl}/collections/cancel`;
    const headers = this.generateAuthHeaders(method, path, body);
    return this.httpService.post(url, body, { headers });
  }

  async refundCollection(body: object) {
    const method = 'POST';
    const path = '/collections/refund';
    const url = `${this.ycUrl}/collections/refund`;
    const headers = this.generateAuthHeaders(method, path, body);
    return this.httpService.post(url, body, { headers });
  }

  async lookupCollection(queryParams: Record<string, any>) {
    const method = 'GET';
    const path = '/collections/lookup';
    const url = new URL(`${this.ycUrl}/collections/lookup`);
    Object.entries(queryParams).forEach(([key, val]) =>
      url.searchParams.append(key, String(val)),
    );
    const headers = this.generateAuthHeaders(method, path);
    return this.httpService.get(url.toString(), { headers });
  }

  async lookupCollectionBySequenceId(sequenceId: string) {
    const method = 'GET';
    const path = `/collections/lookup/${sequenceId}`;
    const url = `${this.ycUrl}/collections/lookup/${sequenceId}`;
    const headers = this.generateAuthHeaders(method, path);
    return this.httpService.get(url, { headers });
  }

  async listCollections() {
    const method = 'GET';
    const path = '/collections/list';
    const url = `${this.ycUrl}/collections/list`;
    const headers = this.generateAuthHeaders(method, path);
    return this.httpService.get(url, { headers });
  }

  // --- Webhooks ---
  async createWebhook(body: IYellowCardWebhookConfig) {
    const method = 'POST';
    const path = '/business/webhooks';
    const url = `${this.ycUrl}${path}`;
    const headers = this.generateAuthHeaders(method, path, body);
    return await this.httpService.post(url, body, { headers });
  }

  async updateWebhook(body: object) {
    const method = 'PUT';
    const path = '/webhooks';
    const url = `${this.ycUrl}${path}`;
    const headers = this.generateAuthHeaders(method, path, body);
    return this.httpService.put(url, body, { headers });
  }

  async removeWebhook(body: AnyObject) {
    const method = 'DELETE';
    const path = '/business/webhooks';
    const url = `${this.ycUrl}${path}`;
    const headers = this.generateAuthHeaders(method, path, body);
    return await this.httpService.post(url, body, { headers });
  }

  async listWebhooks() {
    const method = 'GET';
    const path = '/business/webhooks';
    const url = `${this.ycUrl}${path}`;
    const headers = this.generateAuthHeaders(method, path);
    return await this.httpService.get(url, { headers });
  }

  // --- Settlement ---

  async lookupSettlementBySequenceId(sequenceId: string) {
    const method = 'GET';
    const path = `/settlements/lookup/${sequenceId}`;
    const url = `${this.ycUrl}/settlements/lookup/${sequenceId}`;
    const headers = this.generateAuthHeaders(method, path);
    return this.httpService.get(url, { headers });
  }

  async submitSettlementRequest(body: object) {
    const method = 'POST';
    const path = '/business/settlement';
    const url = `${this.ycUrl}${path}`;
    const headers = this.generateAuthHeaders(method, path, body);
    return this.httpService.post(url, body, { headers });
  }

  async convertFiatToCrypto(
    fiatCode: string,
    cryptoCode: string,
    amount: number,
  ): Promise<{
    convertedAmount: number | null;
    rateUsed?: {
      fiatSell: number;
      cryptoSell: number;
    };
    expiresAt?: string;
  }> {
    const fiatRate = await this.getRateFromCache(fiatCode);
    const cryptoRate = await this.getRateFromCache(cryptoCode);

    // If either is an array (unexpected here), return null
    if (Array.isArray(fiatRate) || Array.isArray(cryptoRate)) {
      return { convertedAmount: null };
    }

    if (!fiatRate?.rate.sell || !cryptoRate?.rate.sell) {
      return { convertedAmount: null };
    }

    const fiatSell = fiatRate.rate.sell;
    const cryptoSell = cryptoRate.rate.sell;

    const converted = amount / fiatSell / cryptoSell;

    return {
      convertedAmount: Number(converted.toFixed(6)),
      rateUsed: {
        fiatSell,
        cryptoSell,
      },
      expiresAt: fiatRate.expiresAt,
    };
  }

  async getRateFromCache(code?: string): Promise<{
    expiresAt: string;
    rate: IYellowCardRateDto | any;
  }> {
    const cached = rateCache.get('y_rates') as
      | { expiresAt: string; data: IYellowCardRateDto[] }
      | undefined;

    if (!cached || !cached.data) {
      return { expiresAt: null, rate: null };
    }

    if (!code) {
      return {
        expiresAt: cached.expiresAt,
        rate: cached.data,
      };
    }

    const rate = cached.data.find(
      (rate: IYellowCardRateDto) =>
        rate.code.toUpperCase() === code.toUpperCase(),
    );

    return {
      expiresAt: cached.expiresAt,
      rate: rate,
      // || {
      //   buy: 1531.5428,
      //   sell: 1632.5428,
      //   locale: 'NG',
      //   rateId: 'nigerian-naira',
      //   code: 'NGN',
      //   updatedAt: '2025-07-22T16:34:34.773Z',
      // },
    };
  }

  private generateAuthHeaders(
    method: HttpMethod,
    path: string,
    body?: object | string,
  ): Record<string, string> {
    const { headers } = generateYcSignature({
      method,
      path,
      publicKey: getAppConfig().YC.PUBLIC_KEY,
      secretKey: getAppConfig().YC.SECRET_KEY,
      body,
    });
    return headers;
  }

  private get ycUrl(): string {
    return getAppConfig().YC.PAYMENT_API;
  }
}
