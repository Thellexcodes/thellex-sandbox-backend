import { TransactionHistoryDto } from '@/modules/transaction-history/dto/create-transaction-history.dto';
import { SupportedBlockchainType } from '@/config/settings';
import { ApiProperty, getSchemaPath } from '@nestjs/swagger';

export class WalletMapDto {
  @ApiProperty()
  totalBalance: string;

  @ApiProperty({
    type: [String],
    description: 'Supported blockchain networks',
  })
  networks: string[];

  @ApiProperty()
  assetCode: string;

  @ApiProperty()
  address: string;

  @ApiProperty({ type: [TransactionHistoryDto] })
  transactionHistory: TransactionHistoryDto[];
}

export class WalletMapRecord {
  @ApiProperty({ type: WalletMapDto })
  usdc: WalletMapDto;

  @ApiProperty({ type: WalletMapDto })
  usdt: WalletMapDto;
}

export class GetWalletBalanceSummaryResponse {
  @ApiProperty()
  totalInUsd: number;

  @ApiProperty({ type: WalletMapRecord })
  wallets: {
    usdc: WalletMapDto;
    usdt: WalletMapDto;
  };
}

export interface IWalletMap {
  totalBalance: string;
  networks: SupportedBlockchainType[];
  assetCode: string;
  address: string;
  transactionHistory: TransactionHistoryDto[];
  [network: string]: any;
}

export interface IWalletBalanceSummary {
  totalInUsd: number;
  wallets: Record<string, IWalletMap>;
}
