import { AnyObject } from '@/models/any.types';
import { PaymentStatus, RampPaymentEventEnum } from '@/models/payment.types';
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
  status: PaymentStatus;

  @IsString()
  apiKey: string;

  @IsOptional()
  settlementInfo?: AnyObject;

  @Transform(({ value }) => normalizeEnumValue(value, RampPaymentEventEnum))
  @IsEnum(RampPaymentEventEnum)
  event: string;

  @IsNumber()
  executedAt: number;
}
