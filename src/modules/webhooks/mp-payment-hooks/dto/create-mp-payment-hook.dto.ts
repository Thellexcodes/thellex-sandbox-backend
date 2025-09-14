import { normalizeEnumValue } from '@/utils/helpers';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';

export enum MpPaymentStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
}

export enum MpPaymentEvent {
  TRANSFER_SUCCESSFUL = 'transfer.successful',
  TRANSFER_FAILED = 'transfer.failed',
}

export class CreateMpPaymentHookDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  reference?: string | null;

  @ApiProperty()
  @Transform(({ value }) => normalizeEnumValue(value, MpPaymentStatus))
  @IsEnum(MpPaymentStatus)
  status: MpPaymentStatus;

  @ApiProperty()
  @Transform(({ value }) => normalizeEnumValue(value, MpPaymentEvent))
  @IsEnum(MpPaymentEvent)
  event: MpPaymentEvent;

  @ApiProperty()
  @Transform(({ value }) => {
    const parsed = new Date(value.replace(' +0000 UTC', 'Z'));
    return isNaN(parsed.getTime()) ? null : parsed;
  })
  created_at: Date;

  @ApiProperty()
  @Transform(({ value }) => {
    const parsed = new Date(value.replace(' +0000 UTC', 'Z'));
    return isNaN(parsed.getTime()) ? null : parsed;
  })
  updated_at: Date;
}
