import { PaymentStatus, PaymentType } from '@/types/payment.types';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { QwalletDto } from '../../qwallet/dto/qwallet.dto';
import { QwalletSubAccountDto } from '../../qwallet/dto/qwallet-subaccount.dto';
import { QwalletPaymentTransactionDto } from '../../qwallet/dto/qwallet-payment.dto';
import { QWalletPaymentAddressDto } from '../../qwallet/dto/qwallet-address.dto';

export class QwalletHookDepositSuccessfulEventDto {
  @ApiProperty() id: string;
  @ApiProperty({
    description: 'Type of transaction',
    enum: PaymentType,
    example: PaymentType.INBOUND,
  })
  @IsEnum(PaymentType)
  type: PaymentType;
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
  event?: string;
  type: PaymentType;
  currency: string;
  amount: string;
  fee: string;
  txid: string;
  status: PaymentStatus;
  reason: string | null;
  created_at: Date;
  done_at: Date | null;
  wallet: QwalletDto;
  user: QwalletSubAccountDto;
  payment_transaction: QwalletPaymentTransactionDto;
  payment_address: QWalletPaymentAddressDto;
}
