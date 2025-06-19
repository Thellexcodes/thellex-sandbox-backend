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

export interface IYCChannelsResult {
  channels: IYCChannel[];
}

export type IYCChannelsResultResponse = Promise<IYCChannelsResult>;
