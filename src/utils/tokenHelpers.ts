// utils/tokenHelpers.ts

// import {
//   SupportedBlockchainType,
//   SupportedWalletTypes,
//   TokenEnum,
// } from '@/config/settings';
// import { TOKEN_CHAIN_CONFIG } from './tokenChains';

// export function getChainsForToken(
//   token: TokenEnum,
//   isTestnet = false,
// ): SupportedBlockchainType[] {
//   const config = TOKEN_CHAIN_CONFIG[token];
//   return Object.entries(config.chains)
//     .filter(([_, data]) => !!data && !!data.testnet === isTestnet)
//     .map(([chain]) => chain as SupportedBlockchainType);
// }

// export function getTokensForChain(chain: SupportedBlockchainType): TokenEnum[] {
//   return Object.entries(TOKEN_CHAIN_CONFIG)
//     .filter(([_, cfg]) => chain in cfg.chains)
//     .map(([token]) => token as TokenEnum);
// }

// export function getTokenId(
//   token: TokenEnum,
//   chain: SupportedBlockchainType,
// ): string | undefined {
//   return TOKEN_CHAIN_CONFIG[token]?.chains[chain]?.tokenId;
// }

// export function getWalletType(
//   chain: SupportedBlockchainType,
// ): SupportedWalletTypes | undefined {
//   const tokenEntry = Object.values(TOKEN_CHAIN_CONFIG).find(
//     (cfg) => chain in cfg.chains,
//   );
//   return tokenEntry?.chains[chain]?.walletType;
// }
