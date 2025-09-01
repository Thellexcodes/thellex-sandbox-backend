import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class ICreateBankRequestAccountDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  currency: string;

  @ApiProperty({ example: 'First National Bank' })
  @IsString()
  bankName: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsString()
  @IsOptional()
  accountName: string;

  @ApiProperty({ example: '1234567890' })
  @IsString()
  accountNumber: string;

  @ApiPropertyOptional({ example: 'FNBBZWHX' })
  @IsOptional()
  @IsString()
  swiftCode?: string;

  @ApiPropertyOptional({ example: 'ZW12345678901234567890' })
  @IsOptional()
  @IsString()
  iban?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiProperty({ example: '123' })
  @IsString()
  bankCode: string;
}

// export class UpdateBankAccountDto extends PartialType(
//   ICreateBankRequestAccountDto,
// ) {
//   @ApiProperty({ example: 'First Bank', required: false })
//   @IsOptional()
//   @IsString()
//   bankName?: string;

//   @ApiProperty({ example: 'John Doe', required: false })
//   @IsOptional()
//   @IsString()
//   accountName?: string;

//   @ApiProperty({ example: 'NGN', required: false })
//   @IsOptional()
//   @IsString()
//   currency?: string;

//   @ApiProperty({
//     example: 'nuban',
//     required: false,
//     description: 'Account type e.g. nuban, iban',
//   })
//   @IsOptional()
//   @IsString()
//   accountType?: string;

//   @ApiProperty({ example: 'NG', required: false })
//   @IsOptional()
//   @IsString()
//   country?: string;
// }

// UpdatePaymentSettingsDto
export class UpdatePaymentSettingsDto {
  @ApiPropertyOptional({ description: 'Enable card payments', example: true })
  @IsOptional()
  @IsBoolean()
  enableCardPayments?: boolean;

  @ApiPropertyOptional({ description: 'Enable cash payments', example: true })
  @IsOptional()
  @IsBoolean()
  enableCashPayments?: boolean;

  @ApiPropertyOptional({
    description: 'Enable crypto payments',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  enableCryptoPayments?: boolean;

  @ApiPropertyOptional({ description: 'Notify on sale events', example: true })
  @IsOptional()
  @IsBoolean()
  notifyOnSale?: boolean;

  @ApiPropertyOptional({
    description: 'Notify on payout events',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  notifyOnPayout?: boolean;
}
