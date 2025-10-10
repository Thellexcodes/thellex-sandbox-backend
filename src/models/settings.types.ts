export const LOG_MESSAGE_EVENT = 'logEventMessage';
export const ENV_DEVELOPMENT = 'development' as const;
export const ENV_TESTING = 'testing' as const;
export const ENV_TESTNET = 'testnet' as const;
export const ENV_STAGING = 'staging' as const;
export const ENV_QA = 'qa' as const;
export const ENV_PRODUCTION = 'production' as const;

export enum SettingsErrorEnum {
  STORE_SETTINGS_NOT_FOUND = 'STORE_SETTINGS_NOT_FOUND',
  TAX_SETTINGS_INVALID = 'TAX_SETTINGS_INVALID',
  PAYMENT_SETTINGS_INVALID = 'PAYMENT_SETTINGS_INVALID',
  PAYOUT_SETTINGS_INVALID = 'PAYOUT_SETTINGS_INVALID',
  SETTINGS_UPDATE_FAILED = 'SETTINGS_UPDATE_FAILED',
}

export enum BankAccountErrorEnum {
  BANK_ACCOUNT_NOT_FOUND = 'BANK_ACCOUNT_NOT_FOUND',
  BANK_ACCOUNT_ALREADY_EXISTS = 'BANK_ACCOUNT_ALREADY_EXISTS',
  INVALID_ACCOUNT_NUMBER = 'INVALID_ACCOUNT_NUMBER',
  FAILED_TO_CREATE_BANK_ACCOUNT = 'FAILED_TO_CREATE_BANK_ACCOUNT',
  FAILED_TO_UPDATE_BANK_ACCOUNT = 'FAILED_TO_UPDATE_BANK_ACCOUNT',
  FAILED_TO_DELETE_BANK_ACCOUNT = 'FAILED_TO_DELETE_BANK_ACCOUNT',
}

export type ApiConfig = {
  SERVER: {
    PORT: number;
    IP: string;
  };
  POSTGRES: {
    HOST: string;
    PORT: number;
    USER: string;
    DATABASE: string;
    PASSWORD: string;
  };
  AUTH_JWT_SECRET: string;
  CLIENT: {
    RP_ID: string;
    URL: string;
  };
  EMAIL: {
    MAIL_USER: string;
    MAIL_APP_PASSWORD: string;
    APPLICATION_NAME: string;
    NOREPLY_USER: string;
    NOREPLY_PASSWORD: string;
    SUPPORT_USER: string;
    SUPPORT_PASSWORD: string;
    CEO_USER: string;
    CEO_PASSWORD: string;
  };
  BLOCKCHAIN: {
    ETHEREUM_RPC_URL: string;
    BASE_RPC_URL: string;
    STELLAR_RPC_URL: string;
    TRON_RPC_URL: string;
    BEP20_RPC_URL: string;
    MATIC_POL_RPC_URL: string;
  };
  DOJAH: {
    APP_ID: string;
    API: string;
    AUTH_PRIVATE_KEY: string;
  };
  QWALLET: {
    SECRET_KEY: string;
    API: string;
  };
  CWALLET: {
    API_KEY: string;
    ENTITY_SECRET: string;
    ENTITY_PUBLIC_KEY: string;
    ENTITY_CYPHER_TEXT: string;
  };
  YC: {
    PUBLIC_KEY: string;
    SECRET_KEY: string;
    PAYMENT_API: string;
  };
  Vfd: {
    API: string;
    AUTH_TOKEN: string;
  };
  MPR: {
    PUBLIC_KEY: string;
    SECRET_KEY: string;
  };
  FIREBASE: {
    SERVICE_ACCOUNT: string;
    PROJECT_NUMBER: string;
    APP_ID: string;
  };
  ALCHEMY_API: string;
  KYC_ENCRYPTION_KEY: string;
  IPINFO_TOKEN: string;
  ENABLE_HTTPS: string;
  APP_CERTIFICATE_FINGERPRINT: string;
  TREASURER: {
    EVM_WALLET: string;
  };
};

export type Env =
  | 'development'
  | 'testing'
  | 'testnet'
  | 'staging'
  | 'qa'
  | 'production';

export function getEnvVarMap(prefix: string): Record<Env, string> {
  const upperPrefix = prefix.toUpperCase();

  return {
    [ENV_DEVELOPMENT]:
      process.env[`${ENV_DEVELOPMENT.toUpperCase()}_${upperPrefix}`] || '',
    [ENV_TESTING]:
      process.env[`${ENV_TESTING.toUpperCase()}_${upperPrefix}`] || '',
    [ENV_TESTNET]:
      process.env[`${ENV_TESTNET.toUpperCase()}_${upperPrefix}`] || '',
    [ENV_STAGING]:
      process.env[`${ENV_STAGING.toUpperCase()}_${upperPrefix}`] || '',
    [ENV_QA]: process.env[`${ENV_QA.toUpperCase()}_${upperPrefix}`] || '',
    [ENV_PRODUCTION]:
      process.env[`${ENV_PRODUCTION.toUpperCase()}_${upperPrefix}`] || '',
  };
}
