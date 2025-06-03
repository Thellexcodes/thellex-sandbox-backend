import { FEE, SUPPORTED_NETWORKS } from '@/config/settings';

export interface CreateSubAccountRequest {
  email: string;
}

export interface SubAccountData {
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

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export interface QwalletNetwork {
  id: string;
  name: string;
  deposits_enabled: boolean;
  withdraws_enabled: boolean;
}

export interface QWallet {
  id: string;
  reference: string | null;
  currency: string;
  address: string;
  network: SUPPORTED_NETWORKS;
  user: SubAccountData;
  destination_tag: string | null;
  total_payments: string | null;
  created_at: string;
  updated_at: string;
}

export interface QwalletBalance {
  id: string;
  name: string;
  currency: string;
  balance: string;
  locked: string;
  staked: string;
  user: SubAccountData;
  converted_balance: string;
  reference_currency: string;
  is_crypto: boolean;
  created_at: string;
  updated_at: string;
  blockchain_enabled: boolean;
  default_network: string | null;
  networks: QwalletNetwork[];
  deposit_address: string | null;
  destination_tag: string | null;
}

export class QWalletWithdrawalFeeResponse {
  fee: number;
  type: FEE;
}

// Responses
export type CreateSubAccountResponse = ApiResponse<SubAccountData>;
export type CreateUserWalletResponse = ApiResponse<QWallet>;
export type GetUserWalletResponse = ApiResponse<QwalletBalance>;
export type GetUserWalletsResponse = ApiResponse<QwalletBalance[]>;
// : Promise<GetPaymentAddressResponse>
// : Promise<ValidateAddressResponse>
//  Promise<CreateWithdrawalResponse> {
// : Promise<GetWithdrawalResponse>

interface SwapData {
  id: string;
  from_currency: string;
  to_currency: string;
  quoted_price: string;
  quoted_currency: string;
  from_amount: string;
  to_amount: string;
  confirmed: boolean;
  expires_at: string; // ISO date string
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  user: SubAccountData;
}

export type CreateSwapResponse = ApiResponse<SwapData>;
export type ConfirmSwapResponse = ApiResponse<any>;
export type RefreshSwapQuoteResponse = ApiResponse<any>;
export type GetTemporarySwapQuoteResponse = ApiResponse<any>;
export type GetSwapTransactionResponse = ApiResponse<any>;
export type GetAllSwapsResponse = ApiResponse<any>;

interface OrderData {}
export type CreateOrderResponse = ApiResponse<OrderData>;
export type GetAllOrdersResponse = ApiResponse<any>;
export type GetOrderDetailsResponse = ApiResponse<any>;
export type CancelOrderResponse = ApiResponse<any>;
