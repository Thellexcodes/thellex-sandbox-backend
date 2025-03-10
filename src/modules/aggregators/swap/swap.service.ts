import { ethers } from 'ethers';
import { HttpStatus, Injectable } from '@nestjs/common';
import { DexAggregator } from '@/thellex-sdk/src';
import { RateDto } from './dto/rate.dto';
import { getRpcUrls, rateCache } from '@/utils/constants';
import { CustomHttpException } from '@/middleware/custom.http.exception';
import { Token } from '@uniswap/sdk-core';
import { createTokensFromQueryParams } from '@/utils/helpers';

@Injectable()
export class SwapService {
  constructor() {}

  async v2Rate(queryParams: RateDto) {
    try {
      const cacheKey = `v2Rate-${queryParams.payToken.address}:${queryParams.receiveToken.address}:${queryParams.payAmount}`;
      const cachedRate = rateCache.get(cacheKey);

      if (cachedRate) return cachedRate;

      const baseAmount = ethers.parseUnits(
        `${queryParams.payAmount}`,
        Number(queryParams.payToken.decimals),
      );

      const paths = await createTokensFromQueryParams(queryParams);

      // const dexAggregator = new DexAggregator(
      //   getRpcUrls(queryParams.chainId),
      //   queryParams.chainId,
      // );

      // const v2Pool = await dexAggregator.getPoolAddressesFromUniswapV2Factory(
      //   paths,
      //   queryParams.chainId,
      // );

      // if (v2Pool?.poolAddress) {
      //   const rate = await dexAggregator.getUniswapV2BestRateForSwap(
      //     paths,
      //     baseAmount,
      //     v2Pool.poolAddress,
      //   );

      //   if (rate) {
      //     rateCache.set(cacheKey, rate);
      //     return rate;
      //   }
      // }
    } catch (err) {
      console.log(err);
      throw new CustomHttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async v3Rate(queryParams: RateDto) {
    try {
      const cacheKey = `v3Rate-${queryParams.payToken.address}:${queryParams.receiveToken.address}:${queryParams.payAmount}:${queryParams.fee}`;
      const cachedRate = rateCache.get(cacheKey);

      if (cachedRate) return cachedRate;

      const baseAmount = ethers.parseUnits(
        `${queryParams.payAmount}`,
        Number(queryParams.payToken.decimals),
      );

      const paths = await createTokensFromQueryParams(queryParams);

      // console.log(paths);

      const dexAggregator = new DexAggregator(
        getRpcUrls(queryParams.chainId),
        queryParams.chainId,
      );

      const v3Pool = await dexAggregator.getPoolAddressesFromUniswapV3Factory(
        paths,
        queryParams.chainId,
        queryParams.fee,
      );

      if (v3Pool?.poolAddress) {
        const rate = await dexAggregator.getUniswapV3BestRateForSwap(
          paths,
          Number(queryParams.payAmount),
          v3Pool.poolAddress,
          queryParams.fee,
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
