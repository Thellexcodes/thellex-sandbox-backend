import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsString,
  IsOptional,
  IsNotEmpty,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SupportedBlockchainTypeEnum } from '@/config/settings';

export class FiatCollectionRequestDto {
  @ApiProperty({
    description: 'Amount to collect in the selected fiat currency',
    example: 5000,
    minimum: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  userAmount: number;

  @ApiProperty({
    description: '3-letter fiat currency code (e.g., NGN, GHS)',
    example: 'NGN',
  })
  @IsString()
  @IsNotEmpty()
  fiatCode: string;

  @ApiProperty({
    description: '2-letter ISO country code (e.g., NG, GH)',
    example: 'NG',
  })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({
    description: 'Optional reason or purpose for the payment',
    example: 'Payment to friend',
    required: false,
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({
    description: 'Blockchain network to use for processing the transaction',
    enum: SupportedBlockchainTypeEnum,
    example: SupportedBlockchainTypeEnum.TRC20,
  })
  @IsEnum(SupportedBlockchainTypeEnum)
  @IsNotEmpty()
  network: SupportedBlockchainTypeEnum;
}

export class RecipientInfoDto {
  @ApiProperty()
  country: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  idType: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  dob: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  idNumber: string;

  @ApiProperty()
  email: string;
}

export class BankInfoDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  accountNumber: string;

  @ApiProperty()
  accountName: string;
}

export class SourceInfoDto {
  @ApiProperty()
  accountType: string;
}

export class FiatCollectionResultDto {
  @ApiProperty()
  currency: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  serviceFeeAmountUSD: number;

  @ApiProperty()
  partnerFeeAmountLocal: number;

  @ApiProperty()
  country: string;

  @ApiProperty()
  reference: string;

  @ApiProperty({ type: () => RecipientInfoDto })
  @Type(() => RecipientInfoDto)
  recipient: RecipientInfoDto;

  @ApiProperty()
  expiresAt: string;

  @ApiProperty()
  requestSource: string;

  @ApiProperty()
  directSettlement: boolean;

  @ApiProperty()
  refundRetry: number;

  @ApiProperty()
  id: string;

  @ApiProperty()
  partnerId: string;

  @ApiProperty()
  rate: number;

  @ApiProperty({ type: () => BankInfoDto })
  @Type(() => BankInfoDto)
  bankInfo: BankInfoDto;

  @ApiProperty()
  tier0Active: boolean;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  forceAccept: boolean;

  @ApiProperty({ type: () => SourceInfoDto })
  @Type(() => SourceInfoDto)
  source: SourceInfoDto;

  @ApiProperty()
  sequenceId: string;

  @ApiProperty()
  reason: string;

  @ApiProperty()
  convertedAmount: number;

  @ApiProperty()
  channelId: string;

  @ApiProperty()
  serviceFeeAmountLocal: number;

  @ApiProperty()
  updatedAt: string;

  @ApiProperty()
  partnerFeeAmountUSD: number;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  depositId: string;
}

export class FiatCollectionResponseDto {
  @ApiProperty({ type: () => FiatCollectionResultDto })
  @Type(() => FiatCollectionResultDto)
  result: FiatCollectionResultDto;

  @ApiProperty()
  status: boolean;

  @ApiProperty()
  path: string;

  @ApiProperty()
  statusCode: number;
}
