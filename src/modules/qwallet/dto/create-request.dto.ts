import { SUPPORTED_BLOCKCHAINS, SupportedBlockchain } from '@/config/settings';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class CreateRequestPaymentDto {
  @ApiProperty({
    description: 'Type of the payment request',
    example: 'crypto',
  })
  @IsString()
  requestType: string;

  @ApiProperty({
    description: 'Asset code (e.g., USDC, USDT)',
    example: 'USDT',
  })
  @IsString()
  assetCode: string;

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
  network: SupportedBlockchain;
}
