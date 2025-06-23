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
          [SupportedBlockchainType.MATIC]: {
            tokens: [TokenEnum.USDC],
            tokenIds: {
              [TokenEnum.USDC]: 'db6905b9-8bcd-5537-8b08-f5548bdf7925',
            },
            mainnet: true,
          },
        },
      },
    },
  },
  // [SupportedWalletTypes.STELLAR]: {
  //   providers: {
  //     [WalletProviderEnum.CIRCLE]: {
  //       networks: {
  //         [SupportedBlockchainType.STELLAR]: {
  //           tokens: [TokenEnum.XLM],
  //           tokenIds: {
  //             [TokenEnum.XLM]: 'xlm-circle-id',
  //           },
  //           mainnet: true,
  //         },
  //       },
  //     },
  //   },
  // },
};
