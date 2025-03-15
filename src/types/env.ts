import { ENV_PRODUCTION, ENV_TESTNET } from '../constants/env';

export const NEXT_PUBLIC_GOOGLE_PROJECT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_PROJECT_ID;
export const NEXT_PUBLIC_GOOGLE_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
export const NEXT_PUBLIC_WALLET_CONNECT = process.env
  .NEXT_PUBLIC_WALLET_CONNECT as string;

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
