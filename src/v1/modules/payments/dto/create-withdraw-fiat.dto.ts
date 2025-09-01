import { FiatEnum } from '@/v1/config/settings';
import { PaymentReasonEnum } from '@/v1/models/payment.types';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class MetaDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  scheme: string = 'DOM';
}

class CounterpartyDto {
  @ApiProperty()
  @IsString()
  name: string;
}

export class ICreateMalperadFiatWithdrawPaymentDto {
  @ApiProperty()
  @IsString()
  bank_code: string;

  @ApiProperty()
  @IsString()
  account_number: string;

  @ApiProperty()
  @IsInt()
  amount: number;

  @ApiProperty({ enum: PaymentReasonEnum, example: PaymentReasonEnum.BILLS })
  @IsOptional()
  reason: PaymentReasonEnum;

  @ApiProperty()
  @IsString()
  currency: FiatEnum;

  @ApiProperty()
  @IsString()
  @IsOptional()
  reference?: string;

  @ApiProperty()
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => MetaDto)
  meta?: MetaDto;

  @ApiProperty()
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => CounterpartyDto)
  counterparty?: CounterpartyDto;
}
