import { getAppConfig } from '@/constants/env';
import { NetworkSettings } from '@/models/network-settings';
import { TransactionPolicyDto } from '@/modules/users/dto/transaction-settings.dto';

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
export const NAIRA_RATE = 0.0;

// ==============================
// ENUMS & TYPES
// ==============================

// --- Supported blockchain types in the system ---
export enum SupportedBlockchainTypeEnum {
  BEP20 = 'bep20',
  // TRC20 = 'trc20',
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

export enum FiatEnum {
  NGN = 'ngn',
  GHC = 'ghc',
}

export enum CountryEnum {
  NG = 'ng',
  GH = 'gh',
}

// --- Alias for blockchain type used across the app ---
export type BLOCKCHAIN_TYPE = SupportedBlockchainTypeEnum;

// --- Types of fee calculation supported in the system ---
export type FEEType = 'flat' | 'percentage';

// --- Blockchains currently used in production environments ---
export const SUPPORTED_BLOCKCHAINS: Partial<SupportedBlockchainTypeEnum[]> = [
  SupportedBlockchainTypeEnum.BEP20,
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

export enum BankingNetworkProviderEnum {
  MAPLERAD = 'maplerad',
}

export enum CustomerTypesEnum {
  Retail = 'retail',
  Institution = 'institution',
}

export enum SupportedFiatCurrencyEnum {
  USD = 'usd',
  // EUR = 'EUR',
  // GBP = 'GBP',
  NGN = 'ngn',
}

export const AUTH_VERIFICATION_CODE_TTL = 120; // TTL = Time To Live
export const FILE_UPLOAD_LIMIT = '10mb'; // Use string for bodyParser
export const FILE_UPLOAD_LIMIT_BYTES = 10 * 1024 * 1024; // For Fastify or byte-level limits
export const KYC_EXPIRATION_DURATION_MS = 18 * 30 * 24 * 60 * 60 * 1000;
export const SUPPORTED_RAMP_COUNTRIES: string[] = ['NIGERIA'];
export const THIRTY_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000;
export const SERVER_REQUEST_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes in milliseconds
export const EVERY_15_SECONDS_CRON = '*/20 * * * * *';
export const DIRECT_SETTLEMENT_THRESHOLD = 100;

export const BlockchainNetworkSettings: Record<
  Partial<SupportedBlockchainTypeEnum>,
  NetworkSettings
> = {
  [SupportedBlockchainTypeEnum.BEP20]: {
    name: 'Binance Smart Chain',
    treasuryAddress: process.env.EVM_TREASURY_ADDRESS!,
    rpcUrl: getAppConfig().BLOCKCHAIN.BEP20_RPC_URL,
    explorerUrl: 'https://bscscan.com/address/',
    decimals: 18,
    secretKey: process.env.EVM_TREASURY_SECRET_KEY!,
  },
  // [SupportedBlockchainTypeEnum.TRC20]: {
  //   name: 'Tron TRC20',
  //   treasuryAddress: process.env.EVM_TREASURY_ADDRESS!,
  //   rpcUrl: getAppConfig().BLOCKCHAIN.TRON_RPC_URL,
  //   explorerUrl: '',
  //   decimals: 6,
  //   secretKey: process.env.TRC20_TREASURY_SECRET_KEY!,
  // },
  [SupportedBlockchainTypeEnum.MATIC]: {
    name: 'Polygon',
    treasuryAddress: process.env.EVM_TREASURY_ADDRESS!,
    rpcUrl: getAppConfig().BLOCKCHAIN.MATIC_POL_RPC_URL,
    explorerUrl: 'https://polygonscan.com/address/',
    decimals: 18,
    secretKey: process.env.EVM_TREASURY_SECRET_KEY!,
  },
  // [SupportedBlockchainTypeEnum.ETHEREUM]: {
  //   name: 'Ethereum ERC20',
  //   treasuryAddress: '0xYourERC20TreasuryAddressHere',
  //   rpcUrl: '',
  //   explorerUrl: 'https://etherscan.io/address/',
  //   decimals: 18,
  //   secretKey: process.env.EVM_TREASURY_SECRET_KEY!,
  // },
};

export const TokenAddresses: Record<
  SupportedBlockchainTypeEnum,
  Partial<Record<TokenEnum, string>>
> = {
  [SupportedBlockchainTypeEnum.BEP20]: {
    [TokenEnum.USDT]: '0x55d398326f99059fF775485246999027B3197955',
    [TokenEnum.USDC]: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
  },
  // [SupportedBlockchainTypeEnum.TRC20]: {
  //   [TokenEnum.USDT]: 'TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj',
  //   [TokenEnum.USDC]: 'TC4d9vQ9zV8PskcF1CgrFz1E1T7J3VaAaM',
  // },
  [SupportedBlockchainTypeEnum.MATIC]: {
    [TokenEnum.USDT]: '0x3813e82e6f7098b9583FC0F33a962D02018B6803',
    [TokenEnum.USDC]: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
  },
  // [SupportedBlockchainTypeEnum.ETHEREUM]: {
  //   [TokenEnum.USDT]: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  //   [TokenEnum.USDC]: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  // },
};

export const TRANSACTION_POLICY: TransactionPolicyDto = {
  //crypto deposits
  cryptoDepositAllowed: true,
  cryptoWithdrawalAllowed: true,
  cryptoDepositRequiresKyc: false,
  cryptoWithdrawalRequiresKyc: false,
  //crypto-on/off-ramp
  fiatToCryptoDepositAllowed: true,
  cryptoToFiatWithdrawalAllowed: true,
  fiatToCryptoDepositRequiresKyc: true,
  cryptoToFiatWithdrawalRequiresKyc: true,
  //fiat-to-fiat
  fiatToFiatDepositAllowed: true,
  fiatToFiatWithdrawalAllowed: true,
  fiatToFiatDepositRequiresKyc: true,
  fiatToFiatWithdrawalRequiresKyc: true,
};
