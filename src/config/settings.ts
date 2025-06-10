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

// --- Blockchain Types ---
export type SupportedBlockchainType =
  | 'bep20'
  | 'trc20'
  | 'matic'
  | 'MATIC-AMOY';

export type BlockchainNetworkMap = {
  [key in SupportedBlockchainType]: string;
};

// --- Token Support ---
export enum TokenEnum {
  USDC = 'usdc',
  USDT = 'usdt',
}

// --- Blockchain Network Support ---
export const SUPPORTED_BLOCKCHAINS: SupportedBlockchainType[] = [
  'bep20',
  'trc20',
];

export const SUPPORTED_CIRCLE_BLOCKCHAINS: Blockchain[] = ['MATIC-AMOY'];

// --- Chain Tokens Support ---
export const ChainTokens: Record<SupportedBlockchainType, TokenEnum[]> = {
  bep20: [TokenEnum.USDT],
  trc20: [TokenEnum.USDT],
  matic: [TokenEnum.USDC],
  'MATIC-AMOY': [TokenEnum.USDC],
};

export const USE_TESTNET: boolean = true;
export type FEEType = 'flat' | 'percentage';

// Define wallet responsibilities
export const QWALLET_TOKENS: TokenEnum[] = [TokenEnum.USDT];
export const CWALLET_TOKENS: TokenEnum[] = [TokenEnum.USDC];
