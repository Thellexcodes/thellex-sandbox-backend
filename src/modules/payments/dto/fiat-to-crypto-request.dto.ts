import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsString,
  IsNotEmpty,
  IsEnum,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  Validate,
  IsOptional,
} from 'class-validator';
import { Expose, Transform, Type } from 'class-transformer';
import {
  CountryCodeEnum,
  FiatEnum,
  SupportedBlockchainTypeEnum,
  TokenEnum,
} from '@/config/settings';
import { ethers } from 'ethers';
import { PaymentReasonEnum } from '@/models/payment.types';
import { IsLowercaseEnum } from '@/validators/is-lowercase-enum.validator';

@ValidatorConstraint({ name: 'IsEvmAddress', async: false })
export class IsEvmAddressConstraint implements ValidatorConstraintInterface {
  validate(address: string, args: ValidationArguments) {
    return ethers.isAddress(address);
  }

  defaultMessage(args: ValidationArguments) {
    return 'walletAddress must be a valid Ethereum (EVM) address';
  }
}

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
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toLowerCase() : value,
  )
  @IsLowercaseEnum(FiatEnum, {
    message: 'fiatCode must be a valid ISO 4217 fiat code in lowercase',
  })
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
    enum: CountryCodeEnum,
  })
  @IsString()
  @IsNotEmpty()
  country: CountryCodeEnum;

  @ApiProperty({
    example: PaymentReasonEnum.TRAVEL,
    description: 'Reason for the off-ramp payment',
    enum: PaymentReasonEnum,
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toLowerCase() : value,
  )
  @IsLowercaseEnum(PaymentReasonEnum, {
    message:
      'paymentReason must be one of: ' +
      Object.values(PaymentReasonEnum).join(', '),
  })
  @IsNotEmpty()
  paymentReason: PaymentReasonEnum;

  @ApiProperty({
    description: 'Blockchain network to use for processing the transaction',
    enum: SupportedBlockchainTypeEnum,
    example: SupportedBlockchainTypeEnum.BEP20,
  })
  @IsEnum(SupportedBlockchainTypeEnum)
  @IsNotEmpty()
  network: SupportedBlockchainTypeEnum;

  @ApiProperty({
    description: 'EVM wallet address where crypto will be sent',
    example: '0x2179EA580dF5b25b3Cb369f13397C5a6730a48d9',
  })
  @IsString()
  @IsNotEmpty()
  @Validate(IsEvmAddressConstraint)
  destinationAddress: string;
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
  @Expose()
  @ApiProperty()
  bankName: string;

  @Expose()
  @ApiProperty()
  accountNumber: string;

  @IsOptional()
  swiftCode?: string;

  @Expose()
  @ApiProperty()
  @IsOptional()
  accountHolder?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  accountType?: string;

  @ApiProperty({
    example: 'ngn-local-paga',
    description: 'Unique network identifier (e.g., NGN, PAGA)',
  })
  @IsString()
  @IsOptional()
  networkId?: string;

  @ApiProperty({
    example: 'PAGA',
    description: 'System-level bank identifier (used for lookups)',
  })
  @IsString()
  @IsOptional()
  accountBank?: string;

  @ApiProperty({
    example: 'NGN Bank Transfer',
    description: 'Network name (e.g., NGN Bank Transfer, SEPA)',
  })
  @IsString()
  @IsOptional()
  networkName?: string;
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

// export class IFiatToCryptoOnRampResponseDto {
//   @ApiProperty({ type: () => IFiatToCryptoQuoteResponseDto })
//   @Type(() => IFiatToCryptoQuoteResponseDto)
//   result: IFiatToCryptoQuoteResponseDto;

//   @ApiProperty()
//   status: boolean;

//   @ApiProperty()
//   path: string;

//   @ApiProperty()
//   statusCode: number;
// }
