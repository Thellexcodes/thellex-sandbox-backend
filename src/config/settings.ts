import { Blockchain } from '@circle-fin/developer-controlled-wallets';

// --- Basic Settings ---
export const ENVIRONMENT = 'beta';
export const DEBUG_MODE = true;
export const LOG_LEVEL = 'debug'; // 'info' in staging, 'warn' in production

export const SHOW_BETA_BANNER = true;
export const ENABLE_FEEDBACK_BUTTON = true;

// --- Countries / Access Control ---
export const SUPPORTED_COUNTRIES = ['NG']; // Start with Nigeria
export const ENABLE_WHITELISTED_USERS_ONLY = true; // Recommended for beta
export const ALLOW_TRANSACTIONS = true;

// --- Feature Flags ---
export const ENABLE_CRYPTO_DEPOSITS = true;
export const ENABLE_CRYPTO_WITHDRAWALS = false; // Disable to avoid testnet leaks
export const ENABLE_TOKEN_SWAP = false;
export const ENABLE_ESCROW_SERVICE = true;
export const ENABLE_WALLET_CREATION = true;

// --- Transaction Limits ---
export const MIN_TRANSACTION_AMOUNT = 1; // $1 minimum
export const MAX_TRANSACTION_AMOUNT = 1000;
export const DAILY_LIMIT_PER_USER = 5000;

// --- Security & KYC ---
export const ENABLE_KYC = true; // Connect to sandbox KYC APIs
export const ENABLE_DEVICE_VERIFICATION = false; // Optional
export const ENABLE_EMAIL_VERIFICATION = true;

// --- Monitoring ---
export const ENABLE_TRANSACTION_LOGGING = true;
export const ENABLE_TEST_MODE_RECEIPTS = true; // Fake receipt for beta
export const ENABLE_EMAIL_ALERTS = false;
export const ENABLE_ADMIN_OVERRIDE = true; // Allow manual fix/debug

// --- Developer Only ---
export const DEV_MODE_TOOLS = {
  enableFakeWallets: true,
  enableSandboxPayments: true,
  allowManualTokenCredit: true,
  enableWebhookLogging: true,
};

// --- Supported blockchain types in the system ---
export enum SupportedBlockchainType {
  BEP20 = 'bep20', // Binance Smart Chain BEP20 tokens
  TRC20 = 'trc20', // Tron TRC20 tokens
  MATIC = 'matic', // Polygon (Matic) tokens
}

// --- Supported token types handled by the platform ---
export enum TokenEnum {
  USDC = 'usdc',
  USDT = 'usdt',
}

// --- Alias for blockchain type used across the app (currently just SupportedBlockchainType) ---
export type BLOCKCHAIN_TYPE = SupportedBlockchainType;

// -- List of blockchains currently supported by the platform or client libraries ---
export const SUPPORTED_BLOCKCHAINS: SupportedBlockchainType[] | Blockchain[] = [
  SupportedBlockchainType.BEP20,
  SupportedBlockchainType.TRC20,
  SupportedBlockchainType.MATIC,
];

//  --- Mapping of each supported blockchain to its list of supported tokens ---
export const ChainTokens: Record<BLOCKCHAIN_TYPE, TokenEnum[]> = {
  [SupportedBlockchainType.BEP20]: [TokenEnum.USDT],
  [SupportedBlockchainType.TRC20]: [TokenEnum.USDT],
  [SupportedBlockchainType.MATIC]: [TokenEnum.USDC],
};

// --- Tokens assigned to C-wallets (e.g., USDC tokens) ---
export const CWALLET_TOKENS: TokenEnum[] = [TokenEnum.USDC];

// --- Tokens assigned to Q-wallets (e.g., USDT tokens) ---
export const QWALLET_TOKENS: TokenEnum[] = [TokenEnum.USDT];

// --- Mapping of token addresses per blockchain for on-chain interaction ---
export const tokenAddresses: Record<
  TokenEnum,
  Partial<Record<SupportedBlockchainType, string>>
> = {
  [TokenEnum.USDC]: {
    [SupportedBlockchainType.BEP20]:
      '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
    [SupportedBlockchainType.MATIC]:
      '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
  },
  [TokenEnum.USDT]: {
    [SupportedBlockchainType.BEP20]:
      '0x55d398326f99059fF775485246999027B3197955',
    [SupportedBlockchainType.TRC20]: 'TXYZ1234567890abcde',
  },
};

// Types of fee calculation supported in the system
export type FEEType = 'flat' | 'percentage';
