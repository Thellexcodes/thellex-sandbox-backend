import { ApiProperty } from '@nestjs/swagger';
import { QwalletSubAccountDto } from './qwallet-subaccount.dto';
import { QWalletNetworkDto } from './qwallet-network.dto';
import { SupportedBlockchainTypeEnum } from '@/v1/config/settings';

export class QwalletDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  balance: string;

  @ApiProperty()
  locked: string;

  @ApiProperty()
  staked: string;

  @ApiProperty({ type: () => QwalletSubAccountDto })
  user: QwalletSubAccountDto;

  @ApiProperty()
  converted_balance: string;

  @ApiProperty()
  reference_currency: string;

  @ApiProperty()
  is_crypto: boolean;

  @ApiProperty()
  created_at: string;

  @ApiProperty()
  updated_at: string;

  @ApiProperty()
  blockchain_enabled: boolean;

  @ApiProperty()
  default_network: SupportedBlockchainTypeEnum;

  @ApiProperty({ type: [QWalletNetworkDto] })
  networks: QWalletNetworkDto[];

  @ApiProperty()
  deposit_address: string;

  @ApiProperty({ nullable: true })
  destination_tag: string | null;
}
