import {
  Balances,
  CreateTransferTransactionForDeveloperResponse,
  TrimDataResponse,
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

export interface WalletSet {
  id: string;
  custodyType: 'DEVELOPER';
  name: string;
  updateDate: string;
  createDate: string;
}

export type CreateWalletSetResponse = {
  walletSet: WalletSet;
};
