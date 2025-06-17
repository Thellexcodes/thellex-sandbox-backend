import {
  Balances,
  Blockchain,
  CreateTransferTransactionForDeveloperResponse,
  EstimateTransactionFeeData,
  TokenResponse,
  TransactionResponseData,
  TrimDataResponse,
  ValidateAddressData,
  WalletResponse,
  Wallets,
  WalletSetResponse,
} from '@circle-fin/developer-controlled-wallets';

// -----------------------------
// WALLET TYPES
// -----------------------------

/**
 * Represents a Circle Custody Wallet Set
 */
export interface ICWalletSet {
  id: string;
  custodyType: 'DEVELOPER'; // Developer custody type
  name: string;
  updateDate: string;
  createDate: string;
}

/**
 * Response after creating a new wallet set
 */
export type ICCreateWalletSetResponse = {
  walletSet: ICWalletSet;
};

/**
 * Trimmed response for fetching all wallet sets
 */
export type ICWalletSetResponse = TrimDataResponse<WalletSetResponse>;

/**
 * Trimmed response for fetching multiple wallets
 */
export type ICWalletsResponse = TrimDataResponse<Wallets>;

/**
 * Trimmed response for fetching a specific wallet
 */
export type ICWalletResponse = TrimDataResponse<WalletResponse>;

/**
 * Trimmed response for fetching a wallet's balances
 */
export type ICWalletBalanceResponse = TrimDataResponse<Balances>;

// -----------------------------
// TRANSACTION TYPES
// -----------------------------

/**
 * Response after creating a transfer transaction for a developer wallet
 */
export type ICWalletTransactionResponse =
  TrimDataResponse<CreateTransferTransactionForDeveloperResponse>;

/**
 * Response for retrieving a transaction by its ID
 */
export type ICGetTransactionResponse = Promise<
  TransactionResponseData['transaction']
>;

/**
 * Response for retrieving token metadata by its ID
 */
export type ICGetTokenResponse = Promise<TrimDataResponse<TokenResponse>>;

// -----------------------------
// ADDRESS VALIDATION
// -----------------------------

/**
 * Payload for validating a blockchain address
 */
export interface ICValidateAddress {
  address: string;
  blockchain: Blockchain;
}

/**
 * Response after validating an address
 */
export type ICValidateAddressDataResponse = Promise<ValidateAddressData>;

// -----------------------------
// FEE ESTIMATION
// -----------------------------

/**
 * Payload for estimating the gas/fee for a token transfer
 */
export interface ICEstimateTransferFee {
  tokenAddress: string;
  destinationAddress: string;
  amount: string[]; // Amount(s) to transfer
}

/**
 * Response after estimating the transaction fee
 */
export type ICEstimateTransactionFeeDataResponse =
  Promise<EstimateTransactionFeeData>;
