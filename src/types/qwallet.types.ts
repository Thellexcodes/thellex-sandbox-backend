import { SupportedBlockchainType } from '@/config/settings';
import { ApiResponse } from './request.types';

//Sub Account
export interface ISubAccountData {
  id: string;
  sn: string;
  email: string;
  reference: string;
  first_name: string;
  last_name: string;
  display_name: string;
  created_at: string;
  updated_at: string;
}
export type CreateSubAccountResponse = Promise<ApiResponse<ISubAccountData>>;
export type GetSubAccountResponse = Promise<ISubAccountData | null>;

// Wallets
export interface IWalletData {
  id: string;
  reference: string | null;
  currency: string;
  address: string;
  network: SupportedBlockchainType;
  user: ISubAccountData;
  destination_tag: string | null;
  total_payments: string | null;
  created_at: Date;
  updated_at: Date;
}

export type GetPaymentAddressResponse = Promise<ApiResponse<IWalletData>>;
export type CreatePaymentAddressResponse = Promise<ApiResponse<IWalletData>>;

//unkown
export type HandleWithdrawPaymentResponse = ApiResponse<any>;
export type CreateSwapResponse = ApiResponse<any>;
export type ConfirmSwapResponse = ApiResponse<any>;
export type RefreshSwapQuoteResponse = ApiResponse<any>;
export type GetTemporarySwapQuoteResponse = ApiResponse<any>;
export type GetSwapTransactionResponse = ApiResponse<any>;
export type GetAllSwapsResponse = ApiResponse<any>;
