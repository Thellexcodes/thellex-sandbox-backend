import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsString,
  IsOptional,
  IsNotEmpty,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  CountryEnum,
  FiatEnum,
  SupportedBlockchainTypeEnum,
  TokenEnum,
} from '@/config/settings';
import { IFiatToCryptoQuoteResponseDto } from './payment.dto';

export class FiatToCryptoOnRampRequestDto {
  @ApiProperty({
    description: 'Amount to collect in the selected fiat currency',
    example: 5000,
    minimum: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  userAmount: number;

  @ApiProperty({
    description: 'Fiat currency code (ISO 4217 format, e.g., ngn, ghs)',
    example: 'ngn',
    enum: FiatEnum,
  })
  @IsEnum(FiatEnum)
  @IsNotEmpty()
  fiatCode: FiatEnum;

  @ApiProperty({
    description: 'Crypto asset code (e.g., usdt, usdc)',
    example: 'usdt',
    enum: TokenEnum,
  })
  @IsEnum(TokenEnum)
  @IsNotEmpty()
  assetCode: TokenEnum;

  @ApiProperty({
    description: '2-letter ISO country code (e.g., ng, gh)',
    example: 'ng',
    enum: CountryEnum,
  })
  @IsString()
  @IsNotEmpty()
  country: CountryEnum;

  @ApiProperty({
    description: 'Optional reason or purpose for the payment',
    example: 'Payment to friend',
  })
  @IsString()
  reason: string;

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

export class IFiatToCryptoOnRampResponseDto {
  @ApiProperty({ type: () => IFiatToCryptoQuoteResponseDto })
  @Type(() => IFiatToCryptoQuoteResponseDto)
  result: IFiatToCryptoQuoteResponseDto;

  @ApiProperty()
  status: boolean;

  @ApiProperty()
  path: string;

  @ApiProperty()
  statusCode: number;
}
