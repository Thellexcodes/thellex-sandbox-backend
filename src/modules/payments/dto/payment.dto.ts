import { BaseResponseDto } from '@/models/base-response.dto';
import { ITransactionHistoryDto } from '@/utils/typeorm/entities/transaction-history.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { BankInfoDto } from './fiat-to-crypto-request.dto';
import { RampReciepientInfoDto } from '@/utils/typeorm/entities/fiat-crypto-ramp-transaction.entity';

export class CreateWithdrawalResponseDto extends BaseResponseDto<ITransactionHistoryDto> {
  @ApiProperty({ type: ITransactionHistoryDto })
  result: ITransactionHistoryDto;
}

export class IFiatToCryptoQuoteSummaryResponseDto {
  @Expose()
  @ApiProperty({ example: 5000 })
  @IsNumber()
  userAmount: number;

  @Expose()
  @ApiProperty({ example: '2.00%' })
  @IsString()
  feeLabel: string;

  @Expose()
  @ApiProperty({ example: 100 })
  @IsNumber()
  serviceFeeAmountLocal: number;

  @Expose()
  @ApiProperty({ example: 0.06, description: 'Fee amount in USD' })
  @IsNumber()
  serviceFeeAmountUsd: number;

  @Expose()
  @ApiProperty({ example: 4900 })
  @IsNumber()
  netFiatAmount: number;

  @Expose()
  @ApiProperty({ example: 10.0 })
  @IsNumber()
  netCryptoAmount: number;

  @Expose()
  @ApiProperty({ example: 1615, description: 'Fiat to crypto rate' })
  @IsNumber()
  rate: number;

  @Expose()
  @ApiProperty({ example: 3.034056, description: 'Gross fiat to receive/send' })
  @IsNumber()
  grossFiat: number;

  @Expose()
  @ApiProperty({
    example: 3.034056,
    description: 'Gross crypto to receive/send',
  })
  @IsNumber()
  grossCrypto: number;

  @Expose()
  @ApiProperty({ type: () => BankInfoDto })
  @ValidateNested()
  @Type(() => BankInfoDto)
  bankInfo: BankInfoDto;

  @Expose()
  @ApiProperty({ type: () => RampReciepientInfoDto })
  @ValidateNested()
  @Type(() => RampReciepientInfoDto)
  recipientInfo: RampReciepientInfoDto;

  @Expose()
  @ApiProperty({ example: '2025-07-14T13:23:47.812Z' })
  @IsDate()
  @Type(() => Date)
  expiresAt: Date;
}
