import { AnyObject } from '@/models/any.types';
import { PaymentStatus, YCPaymentEventEnum } from '@/models/payment.types';
import { normalizeEnumValue } from '@/utils/helpers';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class YcCreatePaymentHookDto {
  @IsUUID()
  id: string;

  @IsUUID()
  sequenceId: string;

  @Transform(({ value }) => normalizeEnumValue(value, PaymentStatus))
  @IsEnum(PaymentStatus)
  status: string;

  @IsString()
  apiKey: string;

  @IsOptional()
  settlementInfo?: AnyObject;

  @Transform(({ value }) => normalizeEnumValue(value, YCPaymentEventEnum))
  @IsEnum(YCPaymentEventEnum)
  event: string;

  @IsNumber()
  executedAt: number;
}
