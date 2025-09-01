import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class BankInfoRequestDto {
  @ApiProperty({ example: 'John Doe', description: 'Account holder name' })
  @IsString()
  @IsNotEmpty()
  accountHolder: string;

  @ApiProperty({ example: '1234567890', description: 'Account number' })
  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @ApiProperty({ example: 'Bank of Example', description: 'Bank name' })
  @IsString()
  @IsNotEmpty()
  bankName: string;

  @ApiProperty({
    example: 'ABCD1234',
    description: 'SWIFT code',
    required: false,
  })
  @IsOptional()
  @IsString()
  swiftCode?: string;

  @ApiProperty({
    example: 'GB29NWBK60161331926819',
    description: 'IBAN number',
    required: false,
  })
  @IsOptional()
  @IsString()
  iban?: string;
}
