import { BaseResponseDto } from '@/models/base-response.dto';
import { ITransactionHistoryDto } from '@/utils/typeorm/entities/transaction-history.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';
import { BankInfoDto } from './fiat-to-crypto-request.dto';
import { RampReciepientInfoDto } from '@/utils/typeorm/entities/fiat-crypto-ramp-transaction.entity';

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
  feeLabel: string;

  @Expose()
  @ApiProperty({ example: 300 })
  @IsNumber()
  serviceFeeAmountLocal: number;

  @Expose()
  @ApiProperty({ example: 0.19, description: 'Fee amount in USD' })
  @IsNumber()
  serviceFeeAmountUsd: number;

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
  @ApiProperty({ type: () => BankInfoDto })
  bankInfo: BankInfoDto;

  @Expose()
  @ApiProperty({ type: () => RampReciepientInfoDto })
  recipientInfo: RampReciepientInfoDto;

  @Expose()
  expiresAt: Date;
}
