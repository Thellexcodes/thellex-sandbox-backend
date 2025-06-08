import { QWalletPaymentAddressDto } from '@/modules/qwallet/dto/qwallet-address.dto';
import { QwalletPaymentTransactionDto } from '@/modules/qwallet/dto/qwallet-payment.dto';
import { QwalletSubAccountDto } from '@/modules/qwallet/dto/qwallet-subaccount.dto';
import { QwalletDto } from '@/modules/qwallet/dto/qwallet.dto';
import { ApiProperty } from '@nestjs/swagger';

export class QwalletHookDepositSuccessfulDataDto {
  @ApiProperty() id: string;
  @ApiProperty() type: string;
  @ApiProperty() currency: string;
  @ApiProperty() amount: string;
  @ApiProperty() fee: string;
  @ApiProperty() txid: string;
  @ApiProperty() status: string;
  @ApiProperty({ nullable: true }) reason: string | null;
  @ApiProperty() created_at: string;
  @ApiProperty({ nullable: true }) done_at: string | null;
  @ApiProperty({ type: () => QwalletDto }) wallet: QwalletDto;
  @ApiProperty({ type: () => QwalletSubAccountDto }) user: QwalletSubAccountDto;
  @ApiProperty({ type: () => QwalletPaymentTransactionDto })
  payment_transaction: QwalletPaymentTransactionDto;
  @ApiProperty({ type: () => QWalletPaymentAddressDto })
  payment_address: QWalletPaymentAddressDto;
}

export interface IQwalletHookDepositSuccessfulData {
  id: string;
  type: string;
  currency: string;
  amount: string;
  fee: string;
  txid: string;
  status: string;
  reason: string | null;
  created_at: string;
  done_at: string | null;
  wallet: QwalletDto;
  user: QwalletSubAccountDto;
  payment_transaction: QwalletPaymentTransactionDto;
  payment_address: QWalletPaymentAddressDto;
}
