import { SupportedFiatCurrency } from '@/config/settings';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class RequestCryptoOffRampPaymentDto {
  @ApiProperty({ example: 'USDT', description: 'The crypto token to off-ramp' })
  @IsString()
  @IsNotEmpty()
  assetCode: string;

  @ApiProperty({ example: 'matic', description: 'Blockchain network' })
  @IsString()
  @IsNotEmpty()
  network: string;

  @ApiProperty({ example: 100, description: 'Amount in crypto' })
  @IsNumber()
  amount: number;

  @ApiProperty({
    example: SupportedFiatCurrency.USD,
    enum: SupportedFiatCurrency,
    description: 'Fiat currency to receive',
  })
  @IsEnum(SupportedFiatCurrency)
  fiatCurrency: SupportedFiatCurrency;

  @ApiProperty({
    example: 'bank_transfer',
    description: 'Preferred off-ramp method (e.g. bank_transfer)',
    required: false,
  })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiProperty({
    example: 'recipient@example.com',
    description: 'Recipient identifier (email, phone, bank ID, etc)',
  })
  @IsString()
  @IsNotEmpty()
  recipient: string;
}
