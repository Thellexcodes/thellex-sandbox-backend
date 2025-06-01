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
export type SupportedBlockchain =
  | 'lisk'
  | 'base'
  | 'stellar'
  | 'polygon'
  | 'tron'
  | 'solana';

export type BlockchainNetworkMap = {
  [key in SupportedBlockchain]: string;
};

export type LiskToken = 'USDC' | 'USDT';
export type BaseToken = 'USDC';
export type StellarToken = 'USDC' | 'XLM';
export type PolygonToken = 'USDC' | 'MATIC';
export type TronToken = 'USDC' | 'USDT';
export type SolanaToken = 'USDC' | 'USDT';

export type TokenMap = {
  lisk: LiskToken[];
  base: BaseToken[];
  stellar: StellarToken[];
  polygon: PolygonToken[];
  tron: TronToken[];
  solana: SolanaToken[];
};

// --- Blockchain Network Support ---
export const SUPPORTED_BLOCKCHAINS: SupportedBlockchain[] = [
  'lisk',
  'base',
  'stellar',
  'polygon',
  'tron',
  'solana',
];

export const BLOCKCHAIN_NETWORKS: BlockchainNetworkMap = {
  lisk: 'lisk-testnet',
  base: 'base-goerli',
  stellar: 'stellar-testnet',
  polygon: 'polygon-mumbai',
  tron: 'tron-shasta',
  solana: 'solana-devnet',
};

export const USE_TESTNET: boolean = true;

// --- Token Support ---
export const SUPPORTED_TOKENS: TokenMap = {
  lisk: ['USDC', 'USDT'],
  base: ['USDC'],
  stellar: ['USDC', 'XLM'],
  polygon: ['USDC', 'MATIC'],
  tron: ['USDC', 'USDT'],
  solana: ['USDC', 'USDT'],
};
