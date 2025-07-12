import {
  SupportedBlockchainTypeEnum,
  SupportedFiatCurrency,
  TokenEnum,
} from '@/config/settings';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
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
    example: SupportedBlockchainTypeEnum.TRC20,
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
    example: SupportedFiatCurrency.USD,
    enum: SupportedFiatCurrency,
    description: 'Fiat currency to receive',
  })
  @IsEnum(SupportedFiatCurrency)
  @IsNotEmpty()
  fiatCode: SupportedFiatCurrency;

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
    example: '0x1234abcd5678ef90...',
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
}
