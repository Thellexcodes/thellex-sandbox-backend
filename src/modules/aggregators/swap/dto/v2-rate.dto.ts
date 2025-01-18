import { Token } from '@uniswap/sdk-core';

export class V2RateDto {
  payToken: Token;

  receiveToken: Token;

  chainId!: number;

  payAmount: number;

  receiveAmount: number;
}
