import { BaseResponseDto } from '@/models/base-response.dto';
import { ITransactionHistoryDto } from '@/utils/typeorm/entities/transaction-history.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class CreateWithdrawalResponseDto extends BaseResponseDto<ITransactionHistoryDto> {
  @ApiProperty({ type: ITransactionHistoryDto })
  result: ITransactionHistoryDto;
}

export class IFiatToCryptoQuoteResponseDto {
  @Expose()
  @ApiProperty({ example: 15000 })
  @IsNumber()
  userAmount: number;

  @Expose()
  @ApiProperty({ example: '2.00%' })
  @IsString()
  feePercentage: string;

  @Expose()
  @ApiProperty({ example: 300 })
  @IsNumber()
  feeAmount: number;

  @Expose()
  @ApiProperty({ example: 15300 })
  @IsNumber()
  adjustedFiatAmount: number;

  @Expose()
  @ApiProperty({ example: 1567.89, description: 'Fiat buy rate' })
  @IsNumber()
  rate: number;

  @Expose()
  @ApiProperty({ example: 9.76 })
  @IsNumber()
  netCryptoAmount: number;

  @Expose()
  @ApiProperty({ example: 0.19, description: 'Fee amount in USD' })
  @IsNumber()
  serviceFeeAmountUsd: number;
}
