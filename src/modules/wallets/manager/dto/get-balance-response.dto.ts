import { TransactionHistoryDto } from '@/modules/transaction-history/dto/create-transaction-history.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

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

@Exclude()
export class WalletBalanceSummaryResponseDto {
  @Expose()
  @ApiProperty()
  totalInUsd: number;

  @Expose()
  @ApiProperty({ type: WalletMapRecord })
  wallets: {
    usdc: WalletMapDto;
    usdt: WalletMapDto;
  };
}
