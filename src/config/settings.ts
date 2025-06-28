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

// --- Payments Only ---
export const NAIRA_RATE = 1650;

// ==============================
// ENUMS & TYPES
// ==============================

// --- Supported blockchain types in the system ---
export enum SupportedBlockchainType {
  BEP20 = 'bep20',
  TRC20 = 'trc20',
  MATIC = 'matic',
  // MATIC_AMOY = 'matic-amoy',
  // AVAX = 'avax',
  // AVAX_FUJI = 'avax-fuji',
  // SOL = 'sol',
  // SOL_DEVNET = 'sol-devnet',
  // STELLAR = 'stellar',
  // CELO = 'celo',
  // BITCOIN = 'btc',
  // ETHEREUM = 'erc20',
  // SUI = 'sui',
  // SOLANA = 'solana',
  // BASE = 'base',
}

// --- Supported token types handled by the platform ---
export enum TokenEnum {
  USDC = 'usdc',
  USDT = 'usdt',
  // XLM = 'xlm',
  // BTC = 'btc',
  // ETH = 'eth',
}

// --- Alias for blockchain type used across the app ---
export type BLOCKCHAIN_TYPE = SupportedBlockchainType;

// --- Types of fee calculation supported in the system ---
export type FEEType = 'flat' | 'percentage';

// --- Blockchains currently used in production environments ---
export const SUPPORTED_BLOCKCHAINS: SupportedBlockchainType[] = [
  SupportedBlockchainType.BEP20,
  SupportedBlockchainType.TRC20,
];
export enum SupportedWalletTypes {
  EVM = 'evm',
  STELLAR = 'stellar',
  BTC = 'btc',
}

export enum WalletProviderEnum {
  QUIDAX = 'quidax',
  CIRCLE = 'circle',
}

export enum CustomerTypesEnum {
  Retail = 'retail',
  Institution = 'institution',
}

export enum SupportedFiatCurrency {
  USD = 'USD',
  // EUR = 'EUR',
  // GBP = 'GBP',
  NGN = 'NGN',
}
