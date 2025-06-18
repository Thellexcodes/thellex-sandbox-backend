import { ApiProperty } from '@nestjs/swagger';
import { QwalletPaymentTransactionDto } from './qwallet-payment.dto';
import { QwalletSubAccountDto } from './qwallet-subaccount.dto';
import { SupportedBlockchainType } from '@/config/settings';

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
  network: SupportedBlockchainType;

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
