import { IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { Token } from '@uniswap/sdk-core';

export class RateDto {
  payToken: Token;

  receiveToken: Token;

  @Transform(({ value }) => Number(value))
  chainId: number;

  @Transform(({ value }) => Number(value))
  payAmount: number;

  @Transform(({ value }) => Number(value))
  receiveAmount: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  fee: number;
}
