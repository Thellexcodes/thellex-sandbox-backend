import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { TransactionHistoryDto } from './transaction-history.dto';

export class AssetBalanceDto {
  @ApiProperty()
  address: string;

  @ApiProperty()
  network: string;

  @ApiProperty()
  assetCode: string;

  @ApiProperty()
  @IsOptional()
  assetIssure?: string;

  @ApiProperty({ description: 'Balance converted to USD' })
  @IsOptional()
  balanceInUsd?: number;

  @ApiProperty({ description: 'Balance converted to NGN' })
  @IsOptional()
  balanceInNgn?: number;

  @ApiProperty({ type: [TransactionHistoryDto] })
  transactionHistory: TransactionHistoryDto[];
}

export class GetBalanceResponseDto {
  @ApiProperty()
  totalBalance: string;

  @ApiProperty()
  currency: string;

  @ApiProperty({ type: [AssetBalanceDto] })
  wallets: AssetBalanceDto[];
}
