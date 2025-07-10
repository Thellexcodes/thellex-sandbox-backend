import { LRUCache } from 'lru-cache';

export const getRpcUrls = (chainId: number) => {
  const chains = {
    // [CHAINS.MAINNET]: process.env.ETHEREUM_RPC_URL,
    // [CHAINS.BASE_CHAIN]: process.env.BASE_RPC_URL,
  };

  return chains[chainId];
};

export const rateCache = new LRUCache<string, any>({
  max: 100000,
});
