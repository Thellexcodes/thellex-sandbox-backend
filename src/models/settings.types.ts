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
    AUTH_PUBLIC_KEY: string;
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
  ALCHEMY_API: string;
  KYC_ENCRYPTION_KEY: string;
  IPINFO_TOKEN: string;
};

export type Env =
  | 'development'
  | 'testing'
  | 'testnet'
  | 'staging'
  | 'qa'
  | 'production';

// Server
export const serverPortMap = getEnvVarMap('SERVER_PORT');
export const serverIpMap = getEnvVarMap('SERVER_IP');

// Postgres
export const postgresHostMap = getEnvVarMap('POSTGRES_HOST');
export const postgresPortMap = getEnvVarMap('POSTGRES_PORT');
export const postgresUserMap = getEnvVarMap('POSTGRES_USER');
export const postgresDbMap = getEnvVarMap('POSTGRES_DB');
export const postgresPasswordMap = getEnvVarMap('POSTGRES_PASSWORD');

// Auth & Client
export const authJwtSecretMap = getEnvVarMap('AUTH_JWT_SECRET');
export const clientRpIdMap = getEnvVarMap('CLIENT_RP_ID');
export const clientUrlMap = getEnvVarMap('CLIENT_URL');

// APIs
export const alchemyApiMap = getEnvVarMap('ALCHEMY_API');
export const kycEncryptionKeyMap = getEnvVarMap('KYC_ENCRYPTION_KEY');

//Yellow card
export const ycPaymentApiMap = getEnvVarMap('YC_PAYMENT_API');
export const ycSecretKeyMap = getEnvVarMap('YC_SECRET_KEY');
export const ycPublicKeyMap = getEnvVarMap('YC_PUBLIC_KEY');

// Qwallet
export const qwalletApiMap = getEnvVarMap('QWALLET_API');
export const qwalletSecretMap = getEnvVarMap('QWALLET_SECRET_KEY');

// CWallet
export const cwalletApiKeyMap = getEnvVarMap('CWALLET_API_KEY');
export const cwalletEntitySecretMap = getEnvVarMap('CWALLET_ENTITY_SECRET');
export const cwalletEntityPublicKeyMap = getEnvVarMap(
  'CWALLET_ENTITY_PUBLIC_KEY',
);
export const cwalletEntityCypherTextMap = getEnvVarMap(
  'CWALLET_ENTITY_CYPHER_TEXT',
);

// Blockchain
export const ethereumRpcUrlMap = getEnvVarMap('ETHEREUM_RPC_URL');
export const baseRpcUrlMap = getEnvVarMap('BASE_RPC_URL');
export const stellarRpcEndpointMap = getEnvVarMap('STELLAR_RPC_ENDPOINT');
export const tronRpcUrlMap = getEnvVarMap('TRON_FULL_NODE');
export const bscRpcUrlMap = getEnvVarMap('BSC_RPC_URL');
export const maticPolRpcUrlMap = getEnvVarMap('MATIC_POL_RPC_URL');

// Email
export const emailUserMap = getEnvVarMap('EMAIL_USER');
export const emailAppPasswordMap = getEnvVarMap('EMAIL_APP_PASSWORD');
export const emailAppNameMap = getEnvVarMap('EMAIL_APPLICATION_NAME');

//Dojah
export const dojahApiMap = getEnvVarMap('DOJAH_KYC_API');
export const dojahAppIdMap = getEnvVarMap('DOJAH_APP_ID');
export const dojahPublicKeyMap = getEnvVarMap('DOJAH_AUTH_PUBLIC_KEY');

// Other
export const ipinfoTokenMap = getEnvVarMap('IPINFO_TOKEN');

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
