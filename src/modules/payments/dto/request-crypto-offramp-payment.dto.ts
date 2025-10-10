import {
  CountryCodeEnum,
  SupportedBlockchainTypeEnum,
  FiatEnum,
  TokenEnum,
} from '@/config/settings';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Validate,
  ValidateNested,
} from 'class-validator';
import { IsEvmAddressConstraint } from './fiat-to-crypto-request.dto';
import { BankInfoRequestDto } from './bank-info-request.dto';
import { PaymentReasonEnum } from '@/models/payment.types';
import { IsLowercaseEnum } from '@/validators/is-lowercase-enum.validator';
import { normalizeEnumValue } from '@/utils/helpers';

export class RequestCryptoOffRampPaymentDto {
  // ===== Crypto Asset Details =====

  @ApiProperty({
    example: TokenEnum.USDT,
    description: 'The crypto token to off-ramp',
    enum: TokenEnum,
  })
  @IsEnum(TokenEnum)
  @IsNotEmpty()
  assetCode: TokenEnum;

  @ApiProperty({
    example: SupportedBlockchainTypeEnum.BEP20,
    description: 'Blockchain network',
    enum: SupportedBlockchainTypeEnum,
  })
  @IsEnum(SupportedBlockchainTypeEnum)
  @IsNotEmpty()
  network: SupportedBlockchainTypeEnum;

  @ApiProperty({
    example: 100.5,
    description: 'Amount in crypto',
    type: Number,
  })
  @IsNumber({ maxDecimalPlaces: 8 })
  @IsNotEmpty()
  userAmount: number;

  // ===== Fiat & Payment Preferences =====

  @ApiProperty({
    example: FiatEnum.NGN,
    enum: FiatEnum,
    description: 'Fiat currency to receive',
  })
  @Transform(({ value }) => normalizeEnumValue(value, FiatEnum))
  // @IsEnum(FiatEnum)
  @IsNotEmpty()
  fiatCode: FiatEnum;

  @ApiProperty({
    description: '2-letter ISO country code (e.g., ng, gh)',
    example: 'ng',
    enum: CountryCodeEnum,
  })
  @IsString()
  @IsNotEmpty()
  country: CountryCodeEnum;

  @ApiProperty({
    example: 'bank_transfer',
    description: 'Preferred off-ramp method (e.g. bank_transfer)',
    required: false,
  })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiProperty({
    example: PaymentReasonEnum.TRAVEL,
    description: 'Reason for the off-ramp payment',
    enum: PaymentReasonEnum,
  })
  @IsEnum(PaymentReasonEnum)
  @IsNotEmpty()
  paymentReason: PaymentReasonEnum;

  // ===== Crypto Sender Info =====

  @ApiProperty({
    example: '0x2179EA580dF5b25b3Cb369f13397C5a6730a48d9',
    description: 'Address sending the crypto',
  })
  @IsString()
  @IsNotEmpty()
  @Validate(IsEvmAddressConstraint)
  sourceAddress: string;

  // ===== Recipient Bank Info =====

  @ApiProperty({
    description: 'Recipient bank details',
    type: BankInfoRequestDto,
  })
  @ValidateNested()
  @Type(() => BankInfoRequestDto)
  @IsNotEmpty()
  bankInfo: BankInfoRequestDto;

  @ApiPropertyOptional({
    example: 102.1,
    description: 'Final asset amount including fees, slippage, etc.',
    type: Number,
  })
  @IsNumber({ maxDecimalPlaces: 8 })
  @IsOptional()
  mainAssetAmount: number;

  @ApiPropertyOptional({
    example: 154000,
    description: 'Final fiat amount user receives after conversion and fees',
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  mainFiatAmount: number;
}
