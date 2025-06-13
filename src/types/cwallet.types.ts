import {
  Balances,
  Blockchain,
  CreateTransferTransactionForDeveloperResponse,
  EstimateTransactionFeeData,
  TrimDataResponse,
  ValidateAddressData,
  WalletResponse,
  Wallets,
  WalletSetResponse,
} from '@circle-fin/developer-controlled-wallets';

export type CwalletSetResponse = TrimDataResponse<WalletSetResponse>;

export type CwalletsResponse = TrimDataResponse<Wallets>;

export type CwalletResponse = TrimDataResponse<WalletResponse>;

export type CwalletBalanceResponse = TrimDataResponse<Balances>;

export type CwalletTransactionResponse =
  TrimDataResponse<CreateTransferTransactionForDeveloperResponse>;

export type ValidateAddressDataResponse = Promise<ValidateAddressData>;

export type EstimateTransactionFeeDataResponse =
  Promise<EstimateTransactionFeeData>;

export interface IWalletSet {
  id: string;
  custodyType: 'DEVELOPER';
  name: string;
  updateDate: string;
  createDate: string;
}

export type CreateWalletSetResponse = {
  walletSet: IWalletSet;
};

export interface IValidateAddress {
  address: string;
  blockchain: Blockchain;
}

export interface IEstimateTransferFee {
  tokenAddress: string;
  destinationAddress: string;
  amount: string[];
}
