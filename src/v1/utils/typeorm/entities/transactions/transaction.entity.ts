import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { PaymentStatus, TransactionTypeEnum } from '@/v1/models/payment.types';
import { FiatEnum, TokenEnum } from '@/v1/config/settings';

@Entity('transactions')
export class TransactionEntity extends BaseEntity {
  @Column({
    type: 'enum',
    enum: TransactionTypeEnum,
    nullable: false,
  })
  transactionType: TransactionTypeEnum;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 8,
    nullable: false,
    default: 0,
  })
  fiatAmount: number;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 8,
    nullable: false,
    default: 0,
  })
  cryptoAmount: number;

  @Column({
    type: 'enum',
    enum: FiatEnum,
    nullable: false,
    default: FiatEnum.NONE,
  })
  fiatCurrency: FiatEnum;

  @Column({
    type: 'enum',
    enum: TokenEnum,
    nullable: false,
    default: FiatEnum.NONE,
  })
  cryptoAsset: TokenEnum;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.Processing,
  })
  paymentStatus: PaymentStatus;
}
