import {
  IYCAcceptCollectionRequestPayload,
  IYCAcceptPaymentResponse,
  IYCChannelsResponseType,
  IYCNetworksResponseType,
  IYCollectionRequestResponseType,
  IYCPaymentRequestResponse,
  IYellowCardWebhookConfig,
} from '@/models/yellocard.models';
import {
  IYellowCardRateDto,
  IYellowCardRatesResponseDto,
} from '../dto/yellocard.dto';
import { AnyObject } from '@/models/any.types';

export abstract class AbstractYellowCardService {
  /**
   * Payments API
   */
  abstract getChannels(crypto?: boolean): Promise<IYCChannelsResponseType>;
  abstract getNetworks(): Promise<IYCNetworksResponseType>;
  abstract getRates(): Promise<IYellowCardRatesResponseDto>;
  abstract getAccount(): Promise<any>;
  abstract resolveBankAccount(body: AnyObject): Promise<any>;
  abstract widgetQuote(body: AnyObject): Promise<any>;
  abstract submitPaymentRequest(
    body: AnyObject,
  ): Promise<IYCPaymentRequestResponse | undefined>;
  abstract acceptPaymentRequest(
    body: AnyObject,
  ): Promise<IYCAcceptPaymentResponse>;
  abstract denyPaymentRequest(body: AnyObject): Promise<any>;
  abstract lookupPayment(id: string): Promise<any>;
  abstract lookupPaymentBySequenceId(sequenceId: string): Promise<any>;
  abstract listPayments(): Promise<any>;

  /**
   * Collections API
   */
  abstract submitCollectionRequest(
    body: AnyObject,
  ): Promise<IYCollectionRequestResponseType>;
  abstract acceptCollectionRequest(
    body: IYCAcceptCollectionRequestPayload,
  ): Promise<any>;
  abstract denyCollectionRequest(body: object): Promise<any>;
  abstract cancelCollection(body: object): Promise<any>;
  abstract refundCollection(body: object): Promise<any>;
  abstract lookupCollection(queryParams: Record<string, any>): Promise<any>;
  abstract lookupCollectionBySequenceId(sequenceId: string): Promise<any>;
  abstract listCollections(): Promise<any>;

  /**
   * Webhooks
   */
  abstract createWebhook(body: IYellowCardWebhookConfig): Promise<any>;
  abstract updateWebhook(body: object): Promise<any>;
  abstract removeWebhook(body: AnyObject): Promise<any>;
  abstract listWebhooks(): Promise<any>;

  /**
   * Settlement
   */
  abstract lookupSettlementBySequenceId(sequenceId: string): Promise<any>;
  abstract submitSettlementRequest(body: object): Promise<any>;

  /**
   * Rates / Conversion
   */
  abstract convertFiatToCrypto(
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
  }>;

  abstract getRateFromCache(code?: string): Promise<{
    expiresAt: string;
    rate: IYellowCardRateDto | any;
  }>;
}
