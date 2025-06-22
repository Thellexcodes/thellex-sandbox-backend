import {
  SupportedBlockchainType,
  SupportedWalletTypes,
  TokenEnum,
  WalletProviderEnum,
} from '@/config/settings';

export const walletConfig = {
  [SupportedWalletTypes.EVM]: {
    providers: {
      [WalletProviderEnum.QUIDAX]: {
        networks: {
          [SupportedBlockchainType.BEP20]: {
            tokens: [TokenEnum.USDT],
            tokenIds: { [TokenEnum.USDT]: 'usdt-quidax-bep20-id' },
            mainnet: true,
          },
        },
      },
      [WalletProviderEnum.CIRCLE]: {
        networks: {
          [SupportedBlockchainType.BASE]: {
            tokens: [TokenEnum.USDC],
            tokenIds: {
              [TokenEnum.USDC]: 'usdc-circle-base-id',
            },
            mainnet: true,
          },
          [SupportedBlockchainType.SOLANA]: {
            tokens: [TokenEnum.USDC],
            tokenIds: {
              [TokenEnum.USDC]: 'usdc-circle-solana-id',
            },
            mainnet: true,
          },
          [SupportedBlockchainType.SUI]: {
            tokens: [TokenEnum.USDC],
            tokenIds: {
              [TokenEnum.USDC]: 'usdc-circle-sui-id',
            },
            mainnet: true,
          },
          [SupportedBlockchainType.CELO]: {
            tokens: [TokenEnum.USDC],
            tokenIds: {
              [TokenEnum.USDC]: 'usdc-circle-celo-id',
            },
            mainnet: true,
          },
        },
      },
    },
  },
  [SupportedWalletTypes.STELLAR]: {
    providers: {
      [WalletProviderEnum.CIRCLE]: {
        networks: {
          [SupportedBlockchainType.STELLAR]: {
            tokens: [TokenEnum.XLM],
            tokenIds: {
              [TokenEnum.XLM]: 'xlm-circle-id',
            },
            mainnet: true,
          },
        },
      },
    },
  },
};
