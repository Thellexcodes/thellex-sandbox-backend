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

// ==============================
// ENUMS & TYPES
// ==============================

// --- Supported blockchain types in the system ---
export enum SupportedBlockchainType {
  BEP20 = 'bep20',
  TRC20 = 'trc20',
  MATIC = 'matic',
  MATIC_AMOY = 'matic-amoy',
  AVAX = 'avax',
  AVAX_FUJI = 'avax-fuji',
  SOL = 'sol',
  SOL_DEVNET = 'sol-devnet',
  STELLAR = 'stellar',
  CELO = 'celo',
  BITCOIN = 'btc',
  ETHEREUM = 'erc20',
  SUI = 'sui',
  SOLANA = 'solana',
  BASE = 'base',
}

// --- Supported token types handled by the platform ---
export enum TokenEnum {
  USDC = 'usdc',
  USDT = 'usdt',
  XLM = 'xlm',
  BTC = 'btc',
  ETH = 'eth',
}

// --- Alias for blockchain type used across the app ---
export type BLOCKCHAIN_TYPE = SupportedBlockchainType;

// --- Types of fee calculation supported in the system ---
export type FEEType = 'flat' | 'percentage';

// ==============================
// ENVIRONMENT-BASED CHAIN MAPPINGS
// ==============================

// // --- Mainnet/Production-supported chains for each token ---
// export const MAINNET_CHAINS: Record<TokenEnum, SupportedBlockchainType[]> = {
//   [TokenEnum.USDC]: [SupportedBlockchainType.MATIC],
//   [TokenEnum.USDT]: [SupportedBlockchainType.BEP20],
// };

// export const TESTNET_CHAINS: Record<TokenEnum, SupportedBlockchainType[]> = {
//   [TokenEnum.USDC]: [SupportedBlockchainType.MATIC_AMOY],
//   [TokenEnum.USDT]: [SupportedBlockchainType.TRC20],
// };

// ==============================
// RUNTIME BLOCKCHAIN SUPPORT CONFIGS
// ==============================

// --- Blockchains currently used in production environments ---
export const SUPPORTED_BLOCKCHAINS: SupportedBlockchainType[] = [
  SupportedBlockchainType.BEP20,
  SupportedBlockchainType.TRC20,
];

// // --- Blockchains used in test/dev environments ---
// export const OPTIONAL_BLOCKCHAINS: SupportedBlockchainType[] = [
//   SupportedBlockchainType.MATIC_AMOY,
//   SupportedBlockchainType.AVAX_FUJI,
//   SupportedBlockchainType.SOL_DEVNET,
// ];

// // --- All chains known to the system (including testnets and extras) ---
// export const ALL_KNOWN_BLOCKCHAINS: SupportedBlockchainType[] = [
//   ...SUPPORTED_BLOCKCHAINS,
//   ...OPTIONAL_BLOCKCHAINS,
//   SupportedBlockchainType.AVAX,
//   SupportedBlockchainType.SOL,
// ];

// ==============================
// TOKEN MAPPINGS
// ==============================

// // --- Tokens assigned to C-wallets (e.g., USDC tokens) ---
// export const CWALLET_TOKENS: TokenEnum[] = [TokenEnum.USDC];

// // --- Tokens assigned to Q-wallets (e.g., USDT tokens) ---
// export const QWALLET_TOKENS: TokenEnum[] = [TokenEnum.USDT];

// --- Supported tokens per blockchain ---
// export const ChainTokens: Record<BLOCKCHAIN_TYPE, TokenEnum[]> = {
//   [SupportedBlockchainType.BEP20]: [TokenEnum.USDT],
//   [SupportedBlockchainType.TRC20]: [TokenEnum.USDT],
//   [SupportedBlockchainType.MATIC]: [TokenEnum.USDC],
//   [SupportedBlockchainType.MATIC_AMOY]: [TokenEnum.USDC],
//   [SupportedBlockchainType.AVAX]: [TokenEnum.USDC],
//   [SupportedBlockchainType.AVAX_FUJI]: [TokenEnum.USDC],
//   [SupportedBlockchainType.SOL]: [TokenEnum.USDC],
//   [SupportedBlockchainType.SOL_DEVNET]: [TokenEnum.USDC],
// };

// // --- Token contract addresses per blockchain ---
// export const tokenAddresses: Record<
//   TokenEnum,
//   Partial<Record<SupportedBlockchainType, string>>
// > = {
//   [TokenEnum.USDC]: {
//     [SupportedBlockchainType.BEP20]: '',
//     [SupportedBlockchainType.MATIC]: '',
//     [SupportedBlockchainType.MATIC_AMOY]: '',
//     [SupportedBlockchainType.AVAX]: '',
//     [SupportedBlockchainType.AVAX_FUJI]: '',
//     [SupportedBlockchainType.SOL]: '',
//     [SupportedBlockchainType.SOL_DEVNET]: '',
//   },
//   [TokenEnum.USDT]: {
//     [SupportedBlockchainType.BEP20]: '',
//     [SupportedBlockchainType.TRC20]: '',
//   },
// };

// // --- Token IDs used in external APIs like Circle ---
// export const tokenIds: Record<
//   TokenEnum,
//   Partial<Record<SupportedBlockchainType, string>>
// > = {
//   [TokenEnum.USDC]: {
//     [SupportedBlockchainType.MATIC]: 'db6905b9-8bcd-5537-8b08-f5548bdf7925',
//     [SupportedBlockchainType.MATIC_AMOY]:
//       '36b6931a-873a-56a8-8a27-b706b17104ee',
//     [SupportedBlockchainType.AVAX]: '7efdfdbf-1799-5089-a588-31beb97ba755',
//     [SupportedBlockchainType.AVAX_FUJI]: 'ff47a560-9795-5b7c-adfc-8f47dad9e06a',
//     [SupportedBlockchainType.SOL]: '33ca4ef6-2500-5d79-82bf-e3036139cc29',
//     [SupportedBlockchainType.SOL_DEVNET]:
//       '8fb3cadb-0ef4-573d-8fcd-e194f961c728',
//   },
//   [TokenEnum.USDT]: {
//     [SupportedBlockchainType.BEP20]: 'usdt-token-id-bep20',
//     [SupportedBlockchainType.TRC20]: 'usdt-token-id-trc20',
//   },
// };

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

// export function mapNetworkToWalletType(
//   network: SupportedBlockchainType,
// ): SupportedWalletTypes {
//   switch (network) {
//     case SupportedBlockchainType.BEP20:
//       return SupportedWalletTypes.EVM;
//     // case SupportedBlockchainType.ERC20:
//     // case SupportedBlockchainType.POLYGON:
//     // case SupportedBlockchainType.ARBITRUM:
//     // case SupportedBlockchainType.OPTIMISM:
//     //   return SupportedWalletTypes.EVM;

//     // case SupportedBlockchainType.SOLANA:
//     //   return SupportedWalletTypes.SOLANA;

//     // case SupportedBlockchainType.TRON:
//     //   return SupportedWalletTypes.TRON;

//     // case SupportedBlockchainType.STELLAR:
//     //   return SupportedWalletTypes.STELLAR;

//     default:
//       return SupportedWalletTypes.EVM;
//   }
// }

export enum SupportedFiatCurrency {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  NGN = 'NGN',
}

const qwalletSupportedNetworks: SupportedBlockchainType[] = [
  SupportedBlockchainType.ETHEREUM,
  SupportedBlockchainType.BEP20,
];
