import {
  SUPPORTED_BLOCKCHAINS,
  SupportedBlockchainTypeEnum,
  TokenEnum,
} from '@/v1/config/settings';
import { TransactionDirectionEnum } from '@/v1/models/payment.types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsIn, IsOptional, IsString } from 'class-validator';

export class CreateRequestPaymentDto {
  @ApiProperty({
    description: 'Type of the payment request',
    example: 'crypto',
  })
  @IsEnum(TransactionDirectionEnum)
  TransactionDirectionEnum: TransactionDirectionEnum;

  @ApiProperty({
    description: 'Asset code (e.g., USDC, USDT)',
    example: 'USDT',
  })
  @IsString()
  assetCode: TokenEnum;

  @ApiPropertyOptional({
    description: 'Asset issuer (optional, if applicable)',
    example: 'GA5ZSEH5...',
  })
  @IsOptional()
  @IsString()
  assetIssuer?: string;

  @ApiPropertyOptional({
    description: 'Amount to request (optional)',
    example: '100.00',
  })
  @IsOptional()
  @IsString()
  amount?: string;

  @ApiProperty({
    description: 'Blockchain network to use',
    enum: SUPPORTED_BLOCKCHAINS,
    example: 'polygon',
  })
  @IsIn(SUPPORTED_BLOCKCHAINS, { message: 'network/invalid' })
  network: SupportedBlockchainTypeEnum;
}
