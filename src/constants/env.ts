import {
  alchemyApiMap,
  ApiConfig,
  authJwtSecretMap,
  baseRpcUrlMap,
  bscRpcUrlMap,
  clientRpIdMap,
  clientUrlMap,
  cwalletApiKeyMap,
  cwalletEntityCypherTextMap,
  cwalletEntityPublicKeyMap,
  cwalletEntitySecretMap,
  dojahApiMap,
  dojahAppIdMap,
  dojahPublicKeyMap,
  emailAppNameMap,
  emailAppPasswordMap,
  emailUserMap,
  Env,
  ENV_DEVELOPMENT,
  ENV_PRODUCTION,
  ENV_QA,
  ENV_STAGING,
  ENV_TESTING,
  ENV_TESTNET,
  ethereumRpcUrlMap,
  ipinfoTokenMap,
  kycEncryptionKeyMap,
  maticPolRpcUrlMap,
  postgresDbMap,
  postgresHostMap,
  postgresPasswordMap,
  postgresPortMap,
  postgresUserMap,
  qwalletApiMap,
  qwalletSecretMap,
  serverIpMap,
  serverPortMap,
  stellarRpcEndpointMap,
  tronRpcUrlMap,
  ycPaymentApiMap,
  ycPublicKeyMap,
  ycSecretKeyMap,
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
  const env = getEnv();

  return {
    KYC_ENCRYPTION_KEY: kycEncryptionKeyMap[env] || '',
    ALCHEMY_API: alchemyApiMap[env] || '',
    SERVER: {
      PORT: Number(serverPortMap[env]) || 0,
      IP: serverIpMap[env] || '',
    },
    POSTGRES: {
      HOST: postgresHostMap[env] || '',
      PORT: Number(postgresPortMap[env]) || 0,
      USER: postgresUserMap[env] || '',
      DATABASE: postgresDbMap[env] || '',
      PASSWORD: postgresPasswordMap[env] || '',
    },
    AUTH_JWT_SECRET: authJwtSecretMap[env] || '',
    CLIENT: {
      RP_ID: clientRpIdMap[env] || '',
      URL: clientUrlMap[env] || '',
    },
    EMAIL: {
      MAIL_USER: emailUserMap[env] || '',
      MAIL_APP_PASSWORD: emailAppPasswordMap[env] || '',
      APPLICATION_NAME: emailAppNameMap[env] || '',
    },
    BLOCKCHAIN: {
      ETHEREUM_RPC_URL: ethereumRpcUrlMap[env] || '',
      BASE_RPC_URL: baseRpcUrlMap[env] || '',
      BEP20_RPC_URL: bscRpcUrlMap[env] || '',
      STELLAR_RPC_URL: stellarRpcEndpointMap[env] || '',
      TRON_RPC_URL: tronRpcUrlMap[env] || '',
      MATIC_POL_RPC_URL: maticPolRpcUrlMap[env] || '',
    },
    DOJAH: {
      APP_ID: dojahAppIdMap[env] || '',
      AUTH_PUBLIC_KEY: dojahPublicKeyMap[env] || '',
      API: dojahApiMap[env] || '',
    },
    CWALLET: {
      API_KEY: cwalletApiKeyMap[env] || '',
      ENTITY_SECRET: cwalletEntitySecretMap[env] || '',
      ENTITY_PUBLIC_KEY: cwalletEntityPublicKeyMap[env] || '',
      ENTITY_CYPHER_TEXT: cwalletEntityCypherTextMap[env] || '',
    },
    QWALLET: {
      SECRET_KEY: qwalletSecretMap[env] || '',
      API: qwalletApiMap[env] || '',
    },
    YC: {
      PUBLIC_KEY: ycPublicKeyMap[env] || '',
      SECRET_KEY: ycSecretKeyMap[env] || '',
      PAYMENT_API: ycPaymentApiMap[env] || '',
    },
    IPINFO_TOKEN: ipinfoTokenMap[env] || '',
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
