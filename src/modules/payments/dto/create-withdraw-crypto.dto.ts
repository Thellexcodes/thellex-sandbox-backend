import { SupportedBlockchainType, TokenEnum } from '@/config/settings';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class CreateCryptoWithdrawPaymentDto {
  @ApiProperty({
    description: 'Token to be withdrawn (usdc or usdt)',
    enum: TokenEnum,
    example: TokenEnum.USDC,
  })
  @IsNotEmpty()
  @IsEnum(TokenEnum)
  assetCode: TokenEnum;

  @ApiProperty({
    description: 'Value to be sent to the recipient',
    example: '150.00',
  })
  @IsNotEmpty()
  @Matches(/^\d+(\.\d{1,18})?$/, {
    message: 'Amount must be a valid decimal number',
  })
  amount: string;

  @ApiProperty({
    description: 'Blockchain network for the withdrawal',
    enum: SupportedBlockchainType,
    example: SupportedBlockchainType.MATIC,
  })
  @IsNotEmpty()
  @IsEnum(SupportedBlockchainType)
  network: SupportedBlockchainType;

  @ApiProperty({
    description: 'sender crypto address',
    example: '0xAbc123...',
  })
  @IsNotEmpty()
  @IsString()
  sourceAddress: string;

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
