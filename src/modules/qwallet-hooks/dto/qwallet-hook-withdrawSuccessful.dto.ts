import { QwalletSubAccountDto } from '@/modules/qwallet/dto/qwallet-subaccount.dto';
import { QwalletDto } from '@/modules/qwallet/dto/qwallet.dto';
import { PaymentStatus } from '@/types/payment.types';
import { WalletWebhookEventEnum } from '@/types/wallet-manager.types';
import { ApiProperty } from '@nestjs/swagger';

class RecipientDetailsDto {
  @ApiProperty()
  address: string;

  @ApiProperty({ nullable: true })
  destination_tag: string | null;

  @ApiProperty({ nullable: true })
  name: string | null;
}

class RecipientDto {
  @ApiProperty()
  type: string;

  @ApiProperty({ type: RecipientDetailsDto })
  details: RecipientDetailsDto;
}

export class QWalletHookWithdrawSuccessfulEventDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ nullable: true })
  reference: string | null;

  @ApiProperty()
  type: string;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  amount: string;

  @ApiProperty()
  fee: string;

  @ApiProperty()
  total: string;

  @ApiProperty()
  txid: string;

  @ApiProperty()
  transaction_note: string;

  @ApiProperty()
  narration: string;

  @ApiProperty()
  status: string;

  @ApiProperty({ nullable: true })
  reason: string | null;

  @ApiProperty()
  created_at: string;

  @ApiProperty({ nullable: true })
  done_at: string | null;

  @ApiProperty({ type: RecipientDto })
  recipient: RecipientDto;

  @ApiProperty({ type: QwalletDto })
  wallet: QwalletDto;

  @ApiProperty({ type: QwalletSubAccountDto })
  user: QwalletSubAccountDto;
}

export interface IQWalletHookWithdrawSuccessfulEvent {
  id: string;
  event?: WalletWebhookEventEnum;
  reference: string | null;
  transactionId: string;
  type: string;
  currency: string;
  amount: string;
  fee: string;
  total: string;
  txid: string;
  transaction_note: string;
  narration: string;
  status: PaymentStatus;
  reason: string | null;
  created_at: Date;
  done_at: Date | null;
  recipient: RecipientDto;
  wallet: QwalletDto;
  user: QwalletSubAccountDto;
}
