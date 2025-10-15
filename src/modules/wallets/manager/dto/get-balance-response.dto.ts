import { BankInfoDto } from '@/modules/payments/dto/fiat-to-crypto-request.dto';
import { TransactionHistoryDto } from '@/modules/transaction-history/dto/create-transaction-history.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

/**
 * Represents a single wallet (crypto or fiat)
 */
export class WalletEntryDto {
  @ApiProperty({ description: 'Total balance in asset unit' })
  totalBalance: number;

  @ApiProperty({ description: 'Equivalent value in local currency' })
  valueInLocal: number;

  @ApiProperty({ description: 'Blockchain network or fiat type' })
  network: string;

  @ApiProperty({ description: 'Asset or fiat code, e.g., USDC, NGN' })
  assetCode: string;

  @ApiProperty({ description: 'Wallet or account address' })
  address: string;

  @ApiPropertyOptional({ description: 'Wallet or account address' })
  bankInfo?: BankInfoDto;

  @ApiProperty({
    type: [TransactionHistoryDto],
    description: 'Transaction history',
  })
  transactionHistory: TransactionHistoryDto[];
}

/**
 * Map of wallet entries by asset/fiat code
 */
export class WalletEntriesRecord {
  @ApiProperty({ type: WalletEntryDto, required: false })
  usdc?: WalletEntryDto;

  @ApiProperty({ type: WalletEntryDto, required: false })
  usdt?: WalletEntryDto;

  @ApiProperty({ type: WalletEntryDto, required: false })
  btc?: WalletEntryDto;

  @ApiProperty({ type: WalletEntryDto, required: false })
  eth?: WalletEntryDto;

  @ApiProperty({ type: WalletEntryDto, required: false })
  ngn?: WalletEntryDto;

  @ApiProperty({ type: WalletEntryDto, required: false })
  usd?: WalletEntryDto;
}

/**
 * Wallet balance summary DTO (for V2 endpoints)
 */
@Exclude()
export class WalletBalanceSummaryV2ResponseDto {
  @Expose()
  @ApiProperty({ description: 'Total balance across all wallets in USD' })
  totalInUsd: number;

  @Expose()
  @ApiProperty({
    type: WalletEntriesRecord,
    description: 'All wallet balances by asset/fiat',
  })
  wallets: WalletEntriesRecord;
}
