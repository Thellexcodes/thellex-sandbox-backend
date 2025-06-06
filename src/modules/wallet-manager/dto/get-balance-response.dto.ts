import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class AssetBalanceDto {
  @ApiProperty()
  address: string;

  @ApiProperty()
  network: string;

  @ApiProperty()
  balance: number;

  @ApiProperty()
  assetCode: string;

  @ApiProperty()
  @IsOptional()
  assetIssure: string;
}

export class GetBalanceResponseDto {
  @ApiProperty()
  totalBalance: string;

  @ApiProperty()
  currency: string;

  @ApiProperty({ type: [AssetBalanceDto] })
  wallets: AssetBalanceDto[];
}
