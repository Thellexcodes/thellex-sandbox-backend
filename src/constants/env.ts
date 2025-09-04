import { ConfigService } from '@/config/config.service';
import {
  ApiConfig,
  Env,
  ENV_DEVELOPMENT,
  ENV_PRODUCTION,
  ENV_QA,
  ENV_STAGING,
  ENV_TESTING,
  ENV_TESTNET,
} from '@/models/settings.types';

export type EnvType =
  | typeof ENV_DEVELOPMENT
  | typeof ENV_TESTING
  | typeof ENV_TESTNET
  | typeof ENV_STAGING
  | typeof ENV_QA
  | typeof ENV_PRODUCTION;

export const ENV_KYC_ENCRYPTION = process.env.ENV_KYC_ENCRYPTION;

export function getAppConfig(): ApiConfig {
  const config = new ConfigService();

  return {
    KYC_ENCRYPTION_KEY: config.get('KYC_ENCRYPTION_KEY'),
    ALCHEMY_API: config.get('ALCHEMY_API'),
    SERVER: {
      PORT: config.getNumber('SERVER_PORT'),
      IP: config.get('SERVER_IP'),
    },
    POSTGRES: {
      HOST: config.get('POSTGRES_HOST'),
      PORT: config.getNumber('POSTGRES_PORT'),
      USER: config.get('POSTGRES_USER'),
      DATABASE: config.get('POSTGRES_DB'),
      PASSWORD: config.get('POSTGRES_PASSWORD'),
    },
    AUTH_JWT_SECRET: config.get('AUTH_JWT_SECRET'),
    CLIENT: {
      RP_ID: config.get('CLIENT_RP_ID'),
      URL: config.get('CLIENT_URL'),
    },
    EMAIL: {
      MAIL_USER: config.get('EMAIL_USER'),
      MAIL_APP_PASSWORD: config.get('EMAIL_APP_PASSWORD'),
      APPLICATION_NAME: config.get('EMAIL_APPLICATION_NAME'),
      NOREPLY_USER: config.get('NOREPLY_USER'),
      NOREPLY_PASSWORD: config.get('NOREPLY_PASSWORD'),
      SUPPORT_USER: config.get('SUPPORT_USER'),
      SUPPORT_PASSWORD: config.get('SUPPORT_PASSWORD'),
      CEO_USER: config.get('CEO_USER'),
      CEO_PASSWORD: config.get('CEO_PASSWORD'),
    },
    BLOCKCHAIN: {
      ETHEREUM_RPC_URL: config.get('ETHEREUM_RPC_URL'),
      BASE_RPC_URL: config.get('BASE_RPC_URL'),
      BEP20_RPC_URL: config.get('BSC_RPC_URL'),
      STELLAR_RPC_URL: config.get('STELLAR_RPC_URL'),
      TRON_RPC_URL: config.get('TRON_RPC_URL'),
      MATIC_POL_RPC_URL: config.get('MATIC_POL_RPC_URL'),
    },
    DOJAH: {
      APP_ID: config.get('DOJAH_APP_ID'),
      AUTH_PRIVATE_KEY: config.get('DOJAH_AUTH_PRIVATE_KEY'),
      API: config.get('DOJAH_API'),
    },
    CWALLET: {
      API_KEY: config.get('CWALLET_API_KEY'),
      ENTITY_SECRET: config.get('CWALLET_ENTITY_SECRET'),
      ENTITY_PUBLIC_KEY: config.get('CWALLET_ENTITY_PUBLIC_KEY'),
      ENTITY_CYPHER_TEXT: config.get('CWALLET_ENTITY_CYPHER_TEXT'),
    },
    QWALLET: {
      SECRET_KEY: config.get('QWALLET_SECRET_KEY'),
      API: config.get('QWALLET_API'),
    },
    MPR: {
      PUBLIC_KEY: config.get('MPR_PUBLIC_KEY'),
      SECRET_KEY: config.get('MPR_SECRET_KEY'),
    },
    YC: {
      PUBLIC_KEY: config.get('YC_PUBLIC_KEY'),
      SECRET_KEY: config.get('YC_SECRET_KEY'),
      PAYMENT_API: config.get('YC_PAYMENT_API'),
    },
    FIREBASE: {
      SERVICE_ACCOUNT: config.get('FIREBASE_SERVICE_ACCOUNT'),
    },
    TREASURER: {
      EVM_WALLET: config.get('EVM_TREASURY_ADDRESS'),
    },
    IPINFO_TOKEN: config.get('IPINFO_TOKEN'),
    ENABLE_HTTPS: config.get('ENABLE_HTTPS'),
    APP_CERTIFICATE_FINGERPRINT: config.get('APP_CERTIFICATE_FINGERPRINT'),
  };
}

export type Environment = typeof ENV_TESTNET | typeof ENV_PRODUCTION;

type AquaAssetData = {
  aquaCode: string;
  aquaIssuer: string;
  aquaAssetString: string;
};

type UsdcAssetData = {
  usdcCode: string;
  usdcIssuer: string;
  usdcAssetString: string;
};

export type AssetsEnvData = {
  [key in Environment]: {
    aqua: AquaAssetData;
    usdc: UsdcAssetData;
  };
};

export function getEnv(): Env {
  const env = process.env.NODE_ENV?.toLowerCase();

  switch (env) {
    case ENV_DEVELOPMENT:
    case ENV_TESTING:
    case ENV_TESTNET:
    case ENV_STAGING:
    case ENV_QA:
    case ENV_PRODUCTION:
      return env;
    default:
      throw new Error(`Unsupported environment: ${env}`);
  }
}
