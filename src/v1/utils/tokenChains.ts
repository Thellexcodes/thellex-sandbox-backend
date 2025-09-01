import {
  SupportedBlockchainTypeEnum,
  SupportedWalletTypes,
  TokenEnum,
  WalletProviderEnum,
} from '@/v1/config/settings';

export const walletConfig = {
  [SupportedWalletTypes.EVM]: {
    providers: {
      [WalletProviderEnum.QUIDAX]: {
        networks: {
          [SupportedBlockchainTypeEnum.BEP20]: {
            tokens: [TokenEnum.USDT],
            tokenIds: { [TokenEnum.USDT]: 'usdt-quidax-bep20-id' },
            mainnet: true,
          },
        },
      },
      [WalletProviderEnum.CIRCLE]: {
        networks: {
          [SupportedBlockchainTypeEnum.MATIC]: {
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
  //         [SupportedBlockchainTypeEnum.STELLAR]: {
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
