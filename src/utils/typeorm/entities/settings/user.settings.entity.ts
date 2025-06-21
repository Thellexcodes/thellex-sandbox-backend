import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { UserEntity } from '../user.entity';
import { BaseEntity } from '../base.entity';

@Entity({ name: 'settings' })
export class UserSettingEntity extends BaseEntity {
  @ManyToOne(() => UserEntity, (user) => user.settings, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ name: 'store_name', nullable: true })
  storeName?: string;

  @Column({ name: 'store_logo_url', nullable: true })
  storeLogoUrl?: string;

  @Column({ name: 'currency', nullable: true })
  currency?: string;

  @Column('decimal', {
    name: 'tax_rate',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  taxRate?: number;

  @Column({ name: 'is_tax_inclusive', default: false })
  isTaxInclusive?: boolean;

  @Column({ name: 'payout_frequency', nullable: true })
  payoutFrequency?: string;

  @Column({ name: 'payout_day', nullable: true })
  payoutDay?: string;

  @Column({ name: 'enable_card_payments', default: true })
  enableCardPayments: boolean;

  @Column({ name: 'enable_cash_payments', default: true })
  enableCashPayments: boolean;

  @Column({ name: 'enable_crypto_payments', default: false })
  enableCryptoPayments: boolean;

  @Column({ name: 'notify_on_sale', default: true })
  notifyOnSale: boolean;

  @Column({ name: 'notify_on_payout', default: true })
  notifyOnPayout: boolean;

  @Column({ name: 'theme_color', nullable: true })
  themeColor?: string;

  @Column({ name: 'language', nullable: true })
  language?: string;
}
