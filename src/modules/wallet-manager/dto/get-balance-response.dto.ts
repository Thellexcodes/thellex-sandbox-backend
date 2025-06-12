import { CreateTransactionHistoryDto } from '@/modules/transaction-history/dto/create-transaction-history.dto';
import { ApiProperty } from '@nestjs/swagger';
import {
  ITransactionHistory,
  TransactionHistoryDto,
} from './transaction-history.dto';

class NetworkInfoDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  address: string;

  @ApiProperty({ type: [TransactionHistoryDto] })
  transactionHistory: TransactionHistoryDto[];
}

export class AssetBalanceDto {
  @ApiProperty()
  assetCode: string;

  @ApiProperty()
  totalBalance: string;

  @ApiProperty({ type: [NetworkInfoDto] })
  networks: NetworkInfoDto[];
}

export class GetBalanceResponseDto {
  @ApiProperty()
  totalBalance: string;

  @ApiProperty()
  currency: string;

  @ApiProperty({ type: [AssetBalanceDto] })
  wallets: AssetBalanceDto[];
}

export interface INetworkInfo {
  name: string;
  address: string;
}

export interface IWalletInfo {
  assetCode: string;
  totalBalance: string;
  networks: INetworkInfo[];
  transactionHistory?: ITransactionHistory[];
}

export interface IWalletSummary {
  totalBalance: string;
  currency: string;
  wallets: IWalletInfo[];
}
