import { ENV_PRODUCTION, ENV_TESTNET } from '@/models/settings.types';
import * as StellarSdk from '@stellar/stellar-sdk';

export const NETWORK_PASSPHRASES = {
  [ENV_PRODUCTION]: StellarSdk.Networks.PUBLIC,
  [ENV_TESTNET]: StellarSdk.Networks.TESTNET,
};
