import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class WithdrawPaymentDto {
  @ApiProperty({
    description: 'Value to be sent to the recipient',
    example: '150.00',
  })
  @IsNotEmpty()
  @IsString()
  amount: string;

  @ApiProperty({
    description: 'ID of your sub-user or crypto address',
    example: '0xAbc123...',
  })
  @IsNotEmpty()
  @IsString()
  fund_uid: string;

  @ApiProperty({
    description: 'Notes for the recipient',
    example: 'Payment for service X',
  })
  @IsOptional()
  @IsString()
  transaction_note?: string;

  @ApiProperty({
    description: 'Narration for the recipient',
    example: 'Freelance project payout',
  })
  @IsOptional()
  @IsString()
  narration?: string;

  @ApiProperty({
    description: 'Destination tag (e.g. for XRP, Stellar, etc)',
    example: '123456',
  })
  @IsOptional()
  @IsString()
  fund_uid2?: string;
}
