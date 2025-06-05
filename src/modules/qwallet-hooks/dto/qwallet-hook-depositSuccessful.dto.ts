import { QWalletPaymentAddressDto } from '@/modules/qwallet/dto/qwallet-address.dto';
import { QwalletPaymentTransactionDto } from '@/modules/qwallet/dto/qwallet-payment.dto';
import { QwalletSubAccountDto } from '@/modules/qwallet/dto/qwallet-subaccount.dto';
import { QwalletDto } from '@/modules/qwallet/dto/qwallet.dto';
import { ApiProperty } from '@nestjs/swagger';

// Main Data DTO
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

// Main Payload DTO
export class QWalletDepositSuccessfulPayloadDto {
  @ApiProperty({ example: 'deposit.successful' }) event: string;
  @ApiProperty({ type: () => QwalletHookDepositSuccessfulDataDto })
  data: QwalletHookDepositSuccessfulDataDto;
}
