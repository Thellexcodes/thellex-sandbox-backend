import { ApiProperty } from '@nestjs/swagger';
import { QwalletSubAccountDto } from './qwallet-subaccount.dto';
import { SupportedBlockchainTypeEnum } from '@/v1/config/settings';

export class QWalletPaymentAddressDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ nullable: true })
  reference: string | null;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  network: SupportedBlockchainTypeEnum;

  @ApiProperty({ type: () => QwalletSubAccountDto })
  user: QwalletSubAccountDto;

  @ApiProperty({ nullable: true })
  destination_tag: string | null;

  @ApiProperty({ nullable: true })
  total_payments: any;

  @ApiProperty()
  created_at: string;

  @ApiProperty()
  updated_at: string;
}
