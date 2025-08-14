import { FiatEnum, TokenEnum } from '@/config/settings';
import {
  PaymentReasonEnum,
  PaymentStatus,
  TransactionTypeEnum,
} from '@/models/payment.types';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';

export class CreateTransactionDto {
  @IsEnum(TransactionTypeEnum)
  transactionType: TransactionTypeEnum;

  @IsNumber()
  fiatAmount: number;

  @IsNumber()
  cryptoAmount: number;

  @IsEnum(FiatEnum)
  @IsOptional()
  fiatCurrency?: FiatEnum;

  @IsEnum(TokenEnum)
  @IsOptional()
  cryptoAsset?: TokenEnum;

  @IsEnum(PaymentStatus)
  paymentStatus: PaymentStatus;

  @IsEnum(PaymentReasonEnum)
  paymentReason: PaymentReasonEnum;
}
