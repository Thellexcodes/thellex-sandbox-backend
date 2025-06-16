import { FEEType } from '@/config/settings';

export interface CreateSubAccountRequest {
  email: string;
}

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

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export interface IQwalletNetwork {
  id: string;
  name: string;
  deposits_enabled: boolean;
  withdraws_enabled: boolean;
}

export interface IQwalletBalance {
  id: string;
  name: string;
  currency: string;
  balance: string;
  locked: string;
  staked: string;
  user: ISubAccountData;
  converted_balance: string;
  reference_currency: string;
  is_crypto: boolean;
  created_at: string;
  updated_at: string;
  blockchain_enabled: boolean;
  default_network: string | null;
  networks: IQwalletNetwork[];
  destination_tag: string | null;
}

export class QWalletWithdrawalFeeResponse {
  fee: number;
  type: FEEType;
}

// Responses
export type CreateSubAccountResponse = ApiResponse<ISubAccountData>;

//Wallet
// export type CreateUserWalletResponse = ApiResponse<IQWallet>;
// export type GetUserWalletResponse = ApiResponse<IQWallet>;
// export type GetUserWalletsResponse = ApiResponse<IQwalletBalance[]>;
// export type GetPaymentAddressResponse = ApiResponse<IQWallet[]>;
// : Promise<ValidateAddressResponse>
//  Promise<CreateWithdrawalResponse> {
// : Promise<GetWithdrawalResponse>

//Swap
interface ISwapData {
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
  user: ISubAccountData;
}

export type CreateSwapResponse = ApiResponse<ISwapData>;
export type ConfirmSwapResponse = ApiResponse<any>;
export type RefreshSwapQuoteResponse = ApiResponse<any>;
export type GetTemporarySwapQuoteResponse = ApiResponse<any>;
export type GetSwapTransactionResponse = ApiResponse<any>;
export type GetAllSwapsResponse = ApiResponse<any>;

//Order
interface OrderData {}
export type CreateOrderResponse = ApiResponse<OrderData>;
export type GetAllOrdersResponse = ApiResponse<any>;
export type GetOrderDetailsResponse = ApiResponse<any>;
export type CancelOrderResponse = ApiResponse<any>;

//Withdraw
export interface WithdrawRecipient {
  type: string;
  details: {
    address: string;
    destination_tag: string | null;
    name: string | null;
  };
}

export interface IWithdrawWallet {
  id: string;
  currency: string;
  balance: string;
  locked: string;
  staked: string;
  converted_balance: string;
  reference_currency: string;
  is_crypto: boolean;
  created_at: string;
  updated_at: string;
  deposit_address: string;
  destination_tag: string | null;
}

export interface IWithdrawData {
  id: string;
  reference: string | null;
  type: string;
  currency: string;
  amount: string;
  fee: string;
  total: string;
  txid: string | null;
  transaction_note: string;
  narration: string;
  status: string;
  reason: string | null;
  created_at: string;
  done_at: string | null;
  recipient: WithdrawRecipient;
  wallet: IWithdrawWallet;
  user: ISubAccountData;
}

export type HandleWithdrawPaymentResponse = ApiResponse<IWithdrawData>;
