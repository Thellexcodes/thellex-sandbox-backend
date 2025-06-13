export const ENV_TESTNET = 'testnet' as const;
export const ENV_PRODUCTION = 'production' as const;
export const LOG_MESSAGE_EVENT = 'logEventMessage';

export const DOJAH_KYC_API = {
  production: 'https://api.dojah.io',
  sandbox: 'https://sandbox.dojah.io',
};

export const QWALLET_API = {
  sandbox: 'https://app.quidax.io/api/v1',
  production: 'https://app.quidax.io/api/v1',
};

export const YELLOWCARD_API = {
  sandbox: 'https://sandbox.api.yellowcard.io/business/payments',
  production: 'https://sandbox.api.yellowcard.io/business/payments',
};

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
