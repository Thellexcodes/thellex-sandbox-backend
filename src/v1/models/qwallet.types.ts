import { SupportedBlockchainTypeEnum } from '@/v1/config/settings';
import { ApiResponse } from './request.types';

// network
interface IQNetwork {
  id: string;
  name: string;
  deposits_enabled: boolean;
  withdraws_enabled: boolean;
}

//Sub Account
export interface IQSubAccountData {
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
export type IQCreateSubAccountResponse = Promise<ApiResponse<IQSubAccountData>>;
export type IQGetSubAccountResponse = Promise<IQSubAccountData | null>;

// Wallets
export interface IQWallet {
  id: string;
  name: string;
  currency: string;
  balance: string;
  locked: string;
  staked: string;
  user: IQSubAccountData;
  converted_balance: string;
  reference_currency: string;
  is_crypto: boolean;
  created_at: string;
  updated_at: string;
  blockchain_enabled: boolean;
  default_network: string;
  networks: IQNetwork[];
  deposit_address: string;
  destination_tag: string | null;
}

export interface IQWalletResponseData {
  id: string;
  reference: string | null;
  currency: string;
  address: string;
  network: SupportedBlockchainTypeEnum;
  user: IQSubAccountData;
  destination_tag: string | null;
  total_payments: string | null;
  created_at: Date;
  updated_at: Date;
}

export type IQGetPaymentAddressResponse = Promise<
  ApiResponse<IQWalletResponseData>
>;
export type IQCreatePaymentAddressResponse = Promise<
  ApiResponse<IQWalletResponseData>
>;
export type IQValidateAddressResponse = Promise<ApiResponse<any>>;
export type IQGetUserWalletResponse = Promise<ApiResponse<IQWallet>>;

//Withdrawals
interface IQRecipientDetails {
  address: string;
  destination_tag: string | null;
  name: string | null;
}

interface IQRecipient {
  type: string;
  details: IQRecipientDetails;
}

interface IQWithdrawPaymentResponseData {
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
  recipient: IQRecipient;
  wallet: IQWallet;
  user: IQSubAccountData;
}

export type IQWithdrawPaymentResponse =
  ApiResponse<IQWithdrawPaymentResponseData>;
