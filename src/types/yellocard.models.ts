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
