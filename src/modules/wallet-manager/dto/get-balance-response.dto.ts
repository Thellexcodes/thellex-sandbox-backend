import {
  ITransactionHistory,
  TransactionHistoryDto,
} from '@/modules/transaction-history/dto/create-transaction-history.dto';
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

  @ApiProperty({ type: [TransactionHistoryDto] })
  transactionHistory: TransactionHistoryDto[];
}

export class GetWalletBalanceSummaryResponse {
  @ApiProperty()
  totalInUsd: number;

  @ApiProperty({
    type: 'object',
    additionalProperties: { $ref: getSchemaPath(WalletMapDto) },
  })
  wallets: Record<string, WalletMapDto>;
}

export interface IWalletMap {
  totalBalance: string;
  networks: SupportedBlockchainType[];
  assetCode: string;
  transactionHistory: ITransactionHistory[];
  [network: string]: any;
}

export interface IWalletBalanceSummary {
  totalInUsd: number;
  wallets: Record<string, IWalletMap>;
}
