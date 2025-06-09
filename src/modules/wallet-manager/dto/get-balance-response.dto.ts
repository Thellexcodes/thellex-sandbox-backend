import { CreateTransactionHistoryDto } from '@/modules/transaction-history/dto/create-transaction-history.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

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

  @ApiProperty({ type: [CreateTransactionHistoryDto] })
  transactionHistory: CreateTransactionHistoryDto[];
}

export class GetBalanceResponseDto {
  @ApiProperty()
  totalBalance: string;

  @ApiProperty()
  currency: string;

  @ApiProperty({ type: [AssetBalanceDto] })
  wallets: AssetBalanceDto[];
}

export interface IAssetBalance {
  address: string;
  network: string;
  assetCode: string;
  assetIssure?: string;
  balanceInUsd?: number;
  balanceInNgn?: number;
  transactionHistory: CreateTransactionHistoryDto[];
}

export interface IGetBalanceResponse {
  totalBalance: string;
  currency: string;
  wallets: IAssetBalance[];
}
