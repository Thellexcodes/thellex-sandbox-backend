export const ENV_TESTNET = 'testnet' as const;
export const ENV_PRODUCTION = 'production' as const;
export const LOG_MESSAGE_EVENT = 'logEventMessage';
export const ENV_KYC_ENCRYPTION = process.env.ENV_KYC_ENCRYPTION;

type ApiConfig = {
  DOJAH_KYC_API: string;
  QWALLET_API: string;
  YELLOWCARD_API: string;
  KYC_ENCRYPTION_KEY: string;
};

export function getAppConfig(): ApiConfig {
  const isSandbox =
    process.env.NODE_ENV === ENV_TESTNET || process.env.NODE_ENV === 'test';

  const DOJAH_KYC_API = isSandbox
    ? 'https://sandbox.dojah.io'
    : 'https://api.dojah.io';

  const QWALLET_API = 'https://app.quidax.io/api/v1';

  const YELLOWCARD_API = isSandbox
    ? 'https://sandbox.api.yellowcard.io/business/payments'
    : 'https://api.yellowcard.io/business/payments';

  const KYC_ENCRYPTION_KEY = isSandbox
    ? 'your_32_characters_long_key'
    : (process.env.ENV_KYC_ENCRYPTION ?? '');

  return {
    DOJAH_KYC_API,
    QWALLET_API,
    YELLOWCARD_API,
    KYC_ENCRYPTION_KEY,
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
