import { AnyObject } from '@/v1/models/any.types';
import {
  PaymentStatus,
  YCRampPaymentEventEnum,
} from '@/v1/models/payment.types';
import { normalizeEnumValue } from '@/v1/utils/helpers';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';

export class YcHookDataDto {
  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiProperty()
  @IsUUID()
  sequenceId: string;

  @ApiProperty()
  @Transform(({ value }) => normalizeEnumValue(value, PaymentStatus))
  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @ApiProperty()
  @IsString()
  apiKey: string;

  @ApiPropertyOptional()
  @IsOptional()
  settlementInfo?: AnyObject;

  @ApiPropertyOptional()
  errorCode?: string;

  @ApiProperty()
  @Transform(({ value }) => normalizeEnumValue(value, YCRampPaymentEventEnum))
  @IsEnum(YCRampPaymentEventEnum)
  event: string;

  @ApiProperty({ oneOf: [{ type: 'number' }, { type: 'string' }] })
  @IsNotEmpty()
  @ValidateIf(
    (o) => typeof o.executedAt === 'string' || typeof o.executedAt === 'number',
  )
  // @IsString({ message: 'executedAt must be a string or number' })
  // @Matches(/^\d+$/, {
  //   message: 'executedAt must be a numeric string or number',
  // })
  executedAt: number | string;
}
