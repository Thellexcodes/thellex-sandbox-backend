import {
  PaymentStatus,
  TransactionDirectionEnum,
} from '@/v1/models/payment.types';
import { QWalletPaymentAddressDto } from '@/v1/modules/wallets/qwallet/dto/qwallet-address.dto';
import { QwalletPaymentTransactionDto } from '@/v1/modules/wallets/qwallet/dto/qwallet-payment.dto';
import { QwalletSubAccountDto } from '@/v1/modules/wallets/qwallet/dto/qwallet-subaccount.dto';
import { QwalletDto } from '@/v1/modules/wallets/qwallet/dto/qwallet.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class QwalletHookDepositSuccessfulEventDto {
  @ApiProperty() id: string;
  @ApiProperty({
    description: 'Type of transaction',
    enum: TransactionDirectionEnum,
    example: TransactionDirectionEnum.INBOUND,
  })
  @IsEnum(TransactionDirectionEnum)
  type: TransactionDirectionEnum;
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
  type: TransactionDirectionEnum;
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
