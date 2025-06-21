export const LOG_MESSAGE_EVENT = 'logEventMessage';
export const ENV_DEVELOPMENT = 'development' as const;
export const ENV_TESTING = 'testing' as const;
export const ENV_TESTNET = 'testnet' as const;
export const ENV_STAGING = 'staging' as const;
export const ENV_QA = 'qa' as const;
export const ENV_PRODUCTION = 'production' as const;

export const ENVIRONMENTS = [
  ENV_DEVELOPMENT,
  ENV_TESTING,
  ENV_TESTNET,
  ENV_STAGING,
  ENV_QA,
  ENV_PRODUCTION,
];

export type EnvType =
  | typeof ENV_DEVELOPMENT
  | typeof ENV_TESTING
  | typeof ENV_TESTNET
  | typeof ENV_STAGING
  | typeof ENV_QA
  | typeof ENV_PRODUCTION;

export const ENV_KYC_ENCRYPTION = process.env.ENV_KYC_ENCRYPTION;

type ApiConfig = {
  DOJAH_KYC_API: string;
  QWALLET_API: string;
  YC_PAYMENT_API: string;
  KYC_ENCRYPTION_KEY: string;
};

export function getAppConfig(): ApiConfig {
  const isSandbox = process.env.NODE_ENV === ENV_TESTNET;

  const DOJAH_KYC_API = isSandbox
    ? 'https://api.dojah.io'
    : 'https://api.dojah.io';

  const QWALLET_API = 'https://app.quidax.io/api/v1';

  const YC_PAYMENT_API = isSandbox
    ? 'https://sandbox.api.yellowcard.io'
    : 'https://sandbox.api.yellowcard.io';

  const KYC_ENCRYPTION_KEY = process.env.KYC_ENCRYPTION_KEY;

  return {
    DOJAH_KYC_API,
    QWALLET_API,
    YC_PAYMENT_API,
    KYC_ENCRYPTION_KEY,
  };
}

export function getEnv(): EnvType {
  const env = process.env.NODE_ENV?.toLowerCase();

  switch (env) {
    case ENV_DEVELOPMENT:
      return ENV_DEVELOPMENT;

    case ENV_TESTING:
      return ENV_TESTING;

    case ENV_TESTNET:
      return ENV_TESTNET;

    case ENV_STAGING:
      return ENV_STAGING;

    case ENV_QA:
      return ENV_QA;

    case ENV_PRODUCTION:
      return ENV_PRODUCTION;

    default:
      return ENV_PRODUCTION;
  }
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
