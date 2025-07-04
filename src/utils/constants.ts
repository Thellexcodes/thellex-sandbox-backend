// import { CHAINS } from '@/thellex-sdk/src';
import { DocumentAnalysisEntityDto } from '@/modules/kyc/dto/kyc-data.dto';
import { LRUCache } from 'lru-cache';

export const getRpcUrls = (chainId: number) => {
  const chains = {
    // [CHAINS.MAINNET]: process.env.ETHEREUM_RPC_URL,
    // [CHAINS.BASE_CHAIN]: process.env.BASE_RPC_URL,
  };

  return chains[chainId];
};

export const rateCache = new LRUCache<string, any>({
  max: 100000, // Max number of items in cache
  ttl: 20000, // Time-to-live in milliseconds (20 minutes)
});

interface IdDocumentCacheInterface {
  photoIdFrontImageBase64: string;
  documentAnalysisResult: DocumentAnalysisEntityDto;
}
