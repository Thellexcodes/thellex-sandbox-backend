import { getAppConfig } from '@/constants/env';
import { HttpService } from '@/middleware/http.service';
import { AnyObject } from '@/types/any.types';
import {
  IYCChannelsResponseType,
  IYCNetworksResponseType,
  IYCPaymentRequestResponse,
  IYCPaymentRequestResponseType,
} from '@/types/yellocard.models';

import { generateYcSignature } from '@/utils/helpers';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class YellowCardService {
  private readonly publicKey: string;
  private readonly secretKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.publicKey = this.configService.get<string>('YC_PUBLIC_KEY')!;
    this.secretKey = this.configService.get<string>('YC_SECRET_KEY')!;
  }

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
  async getRates() {
    const method = 'GET';
    const path = '/business/rates';
    const url = `${this.ycUrl}${path}`;
    const headers = this.generateAuthHeaders(method, path);
    return await this.httpService.get(url, { headers });
  }

  // Get Account
  async getAccount() {
    // const method = 'GET';
    // const path = '/business/account';
    // const url = `${this.ycUrl}/account`;
    // const headers = this.generateAuthHeaders(method, path);
    // const response$ = this.httpService.get(url, { headers });
    // return await firstValueFrom(response$);
  }

  // Resolve Bank Account
  async resolveBankAccount(body: object) {
    // const method = 'POST';
    // const path = '/business/bank/resolve';
    // const url = `${this.ycUrl}/bank/resolve`;
    // const headers = this.generateAuthHeaders(method, path, body);
    // const response$ = this.httpService.post(url, body, { headers });
    // return await firstValueFrom(response$);
  }

  // Widget Quote
  async widgetQuote(body: object) {
    // const method = 'POST';
    // const path = '/business/widget/quote';
    // const url = `${this.ycUrl}/widget/quote`;
    // const headers = this.generateAuthHeaders(method, path, body);
    // const response$ = this.httpService.post(url, body, { headers });
    // return await firstValueFrom(response$);
  }

  // --- Payments ---

  async submitPaymentRequest(body: object) {
    // const method = 'POST';
    // const path = '/payments/submit';
    // const url = `${this.ycUrl}/payments/submit`;
    // const headers = this.generateAuthHeaders(method, path, body);
    // const response$ = this.httpService.post(url, body, { headers });
    // return await firstValueFrom(response$);
  }

  async acceptPaymentRequest(body: object) {
    // const method = 'POST';
    // const path = '/payments/accept';
    // const url = `${this.ycUrl}/payments/accept`;
    // const headers = this.generateAuthHeaders(method, path, body);
    // const response$ = this.httpService.post(url, body, { headers });
    // return await firstValueFrom(response$);
  }

  async denyPaymentRequest(body: object) {
    // const method = 'POST';
    // const path = '/payments/deny';
    // const url = `${this.ycUrl}/payments/deny`;
    // const headers = this.generateAuthHeaders(method, path, body);
    // const response$ = this.httpService.post(url, body, { headers });
    // return await firstValueFrom(response$);
  }

  async lookupPayment(queryParams: Record<string, any>) {
    // const method = 'GET';
    // const path = '/payments/lookup';
    // const url = new URL(`${this.ycUrl}/payments/lookup`);
    // Object.entries(queryParams).forEach(([key, val]) =>
    //   url.searchParams.append(key, String(val)),
    // );
    // const headers = this.generateAuthHeaders(method, path);
    // const response$ = this.httpService.get(url.toString(), { headers });
    // return await firstValueFrom(response$);
  }

  async lookupPaymentBySequenceId(sequenceId: string) {
    // const method = 'GET';
    // const path = `/payments/lookup/${sequenceId}`;
    // const url = `${this.ycUrl}/payments/lookup/${sequenceId}`;
    // const headers = this.generateAuthHeaders(method, path);
    // const response$ = this.httpService.get(url, { headers });
    // return await firstValueFrom(response$);
  }

  async listPayments() {
    // const method = 'GET';
    // const path = '/payments/list';
    // const url = `${this.ycUrl}/payments/list`;
    // const headers = this.generateAuthHeaders(method, path);
    // const response$ = this.httpService.get(url, { headers });
    // return await firstValueFrom(response$);
  }

  // --- Collections ---
  async submitCollectionRequest(
    body: AnyObject,
  ): IYCPaymentRequestResponseType {
    const method = 'POST';
    const path = '/business/collections';
    const url = `${this.ycUrl}${path}`;
    const headers = this.generateAuthHeaders(method, path, body);
    return await this.httpService.post(url, body, { headers });
  }

  async acceptCollectionRequest(body: object) {
    // const method = 'POST';
    // const path = '/collections/accept';
    // const url = `${this.ycUrl}/collections/accept`;
    // const headers = this.generateAuthHeaders(method, path, body);
    // const response$ = this.httpService.post(url, body, { headers });
    // return await firstValueFrom(response$);
  }

  async denyCollectionRequest(body: object) {
    // const method = 'POST';
    // const path = '/collections/deny';
    // const url = `${this.ycUrl}/collections/deny`;
    // const headers = this.generateAuthHeaders(method, path, body);
    // const response$ = this.httpService.post(url, body, { headers });
    // return await firstValueFrom(response$);
  }

  async cancelCollection(body: object) {
    // const method = 'POST';
    // const path = '/collections/cancel';
    // const url = `${this.ycUrl}/collections/cancel`;
    // const headers = this.generateAuthHeaders(method, path, body);
    // const response$ = this.httpService.post(url, body, { headers });
    // return await firstValueFrom(response$);
  }

  async refundCollection(body: object) {
    // const method = 'POST';
    // const path = '/collections/refund';
    // const url = `${this.ycUrl}/collections/refund`;
    // const headers = this.generateAuthHeaders(method, path, body);
    // const response$ = this.httpService.post(url, body, { headers });
    // return await firstValueFrom(response$);
  }

  async lookupCollection(queryParams: Record<string, any>) {
    // const method = 'GET';
    // const path = '/collections/lookup';
    // const url = new URL(`${this.ycUrl}/collections/lookup`);
    // Object.entries(queryParams).forEach(([key, val]) =>
    //   url.searchParams.append(key, String(val)),
    // );
    // const headers = this.generateAuthHeaders(method, path);
    // const response$ = this.httpService.get(url.toString(), { headers });
    // return await firstValueFrom(response$);
  }

  async lookupCollectionBySequenceId(sequenceId: string) {
    // const method = 'GET';
    // const path = `/collections/lookup/${sequenceId}`;
    // const url = `${this.ycUrl}/collections/lookup/${sequenceId}`;
    // const headers = this.generateAuthHeaders(method, path);
    // const response$ = this.httpService.get(url, { headers });
    // return await firstValueFrom(response$);
  }

  async listCollections() {
    // const method = 'GET';
    // const path = '/collections/list';
    // const url = `${this.ycUrl}/collections/list`;
    // const headers = this.generateAuthHeaders(method, path);
    // const response$ = this.httpService.get(url, { headers });
    // return await firstValueFrom(response$);
  }

  // --- Webhooks ---

  async createWebhook(body: object) {
    // const method = 'POST';
    // const path = '/webhooks';
    // const url = `${this.ycUrl}/webhooks`;
    // const headers = this.generateAuthHeaders(method, path, body);
    // const response$ = this.httpService.post(url, body, { headers });
    // return await firstValueFrom(response$);
  }

  async updateWebhook(body: object) {
    // const method = 'PUT';
    // const path = '/webhooks';
    // const url = `${this.ycUrl}/webhooks`;
    // const headers = this.generateAuthHeaders(method, path, body);
    // const response$ = this.httpService.put(url, body, { headers });
    // return await firstValueFrom(response$);
  }

  async removeWebhook(webhookId: string) {
    // const method = 'DELETE';
    // const path = `/webhooks/${webhookId}`;
    // const url = `${this.ycUrl}/webhooks/${webhookId}`;
    // const headers = this.generateAuthHeaders(method, path);
    // const response$ = this.httpService.delete(url, { headers });
    // return await firstValueFrom(response$);
  }

  async listWebhooks() {
    // const method = 'GET';
    // const path = '/webhooks';
    // const url = `${this.ycUrl}/webhooks`;
    // const headers = this.generateAuthHeaders(method, path);
    // const response$ = this.httpService.get(url, { headers });
    // return await firstValueFrom(response$);
  }

  // --- Settlement ---

  async lookupSettlementBySequenceId(sequenceId: string) {
    // const method = 'GET';
    // const path = `/settlements/lookup/${sequenceId}`;
    // const url = `${this.ycUrl}/settlements/lookup/${sequenceId}`;
    // const headers = this.generateAuthHeaders(method, path);
    // const response$ = this.httpService.get(url, { headers });
    // return await firstValueFrom(response$);
  }

  async submitSettlementRequest(body: object) {
    // const method = 'POST';
    // const path = '/settlements/submit';
    // const url = `${this.ycUrl}/settlements/submit`;
    // const headers = this.generateAuthHeaders(method, path, body);
    // const response$ = this.httpService.post(url, body, { headers });
    // return await firstValueFrom(response$);
  }

  private get ycUrl(): string {
    return getAppConfig().YC_PAYMENT_API;
  }

  private generateAuthHeaders(
    method: HttpMethod,
    path: string,
    body?: object | string,
  ): Record<string, string> {
    const { headers } = generateYcSignature({
      method,
      path,
      publicKey: this.publicKey,
      secretKey: this.secretKey,
      body,
    });
    return headers;
  }
}
