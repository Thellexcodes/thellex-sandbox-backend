// Channels
export interface IYCChannel {
  max: number;
  currency: string;
  countryCurrency: string;
  status: string;
  feeLocal: number;
  createdAt: string; // ISO date string
  vendorId: string;
  country: string;
  widgetStatus: string;
  feeUSD: number;
  min: number;
  channelType: string;
  rampType: string;
  updatedAt: string; // ISO date string
  apiStatus: string;
  settlementType: string;
  estimatedSettlementTime: number;
  id: string;
}

export interface IYCChannelsResponse {
  channels: IYCChannel[];
}

export type IYCChannelsResponseType = Promise<IYCChannelsResponse>;

// Networks
export interface IYCNetwork {
  code: string;
  updatedAt: string; // ISO date string
  status: string;
  channelIds: string[]; // assuming array of strings
  createdAt: string; // ISO date string
  accountNumberType: string;
  id: string;
  country: string;
  name: string;
  countryAccountNumberType: string;
}

export interface IYCNetworksResponse {
  networks: IYCNetwork[];
}

export type IYCNetworksResponseType = Promise<IYCNetworksResponse>;

// collection
interface IYCRecipient {
  country: string;
  address: string;
  idType: string;
  phone: string;
  dob: string;
  name: string;
  idNumber: string;
  email: string;
}

interface IYCBankInfo {
  name: string;
  accountNumber: string;
  accountName: string;
}

interface IYCSource {
  accountType: string;
}

//submit collection request response interface
export interface IYCCollectionRequestResponse {
  currency: string;
  status: string;
  serviceFeeAmountUSD: number;
  partnerFeeAmountLocal: number;
  country: string;
  reference: string;
  recipient: IYCRecipient;
  expiresAt: Date;
  requestSource: string;
  directSettlement: boolean;
  refundRetry: number;
  id: string;
  partnerId: string;
  rate: number;
  bankInfo: IYCBankInfo;
  tier0Active: boolean;
  createdAt: string;
  forceAccept: boolean;
  source: IYCSource;
  sequenceId: string;
  reason: string;
  convertedAmount: number;
  channelId: string;
  serviceFeeAmountLocal: number;
  updatedAt: string;
  partnerFeeAmountUSD: number;
  amount: number;
  depositId: string;
}

export interface IYCAcceptCollectionRequestPayload {
  id: string;
}

export type IYCollectionRequestResponseType =
  Promise<IYCCollectionRequestResponse>;

//webhooks
export interface IYellowCardWebhookConfig {
  active: boolean;
  url: string;
}

//payout response interface
export interface IYCPayoutRequestResponseDestination {
  accountNumber: string;
  accountType: string;
  networkId: string;
  accountBank: string;
  accountName: string;
  networkName: string;
}

export interface IYCPayoutRequestResponseSender {
  name: string;
  country: string;
  phone: string;
  address: string;
  dob: string;
  email: string;
  idNumber: string;
  idType: string;
}

export interface IYCPaymentRequestResponse {
  sequenceId: string;
  channelId: string;
  currency: string;
  country: string;
  reason: string;
  destination: IYCPayoutRequestResponseDestination;
  sender: IYCPayoutRequestResponseSender;
  forceAccept: boolean;
  customerUID: string;
  partnerId: string;
  requestSource: string;
  id: string;
  attempt: number;
  status: string;
  amount: number;
  convertedAmount: number;
  rate: number;
  expiresAt: Date;
  settlementInfo: Record<string, unknown>;
  tier0Active: boolean;
  createdAt: string;
  updatedAt: string;
  directSettlement: boolean;
}
