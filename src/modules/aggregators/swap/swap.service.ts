import { ethers } from 'ethers';
import { HttpStatus, Injectable } from '@nestjs/common';
import { Token, DexAggregator } from '@/thellex-sdk-v1/src';
import { V2RateDto } from './dto/v2-rate.dto';
import { getRpcUrls, rateCache } from '@/utils/constants';
import { CustomHttpException } from '@/middleware/custom.http.exception';

@Injectable()
export class SwapService {
  constructor() {}

  async v2Rate(queryParams: V2RateDto) {
    try {
      const cacheKey = `v2Rate-${queryParams.payToken.address}:${queryParams.receiveToken.address}:${queryParams.payAmount}`;

      const cachedRate = rateCache.get(cacheKey);
      if (cachedRate) return cachedRate;

      const baseAmount = ethers.parseUnits(
        `${queryParams.payAmount}`,
        Number(queryParams.payToken.decimals),
      );

      const paths: Token[] = [queryParams.payToken, queryParams.receiveToken];

      const dexAggregator = new DexAggregator(
        getRpcUrls(queryParams.chainId),
        queryParams.chainId,
      );

      const v2Pool = await dexAggregator.getPoolAddressesFromUniswapV2Factory(
        paths,
        queryParams.chainId,
      );

      if (v2Pool?.poolAddress) {
        const rate = await dexAggregator.getUniswapV2BestRateForSwap(
          paths,
          baseAmount,
          v2Pool.poolAddress,
        );

        if (rate) {
          rateCache.set(cacheKey, rate);
          return rate;
        }
      }
    } catch (err) {
      console.log(err);
      throw new CustomHttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
