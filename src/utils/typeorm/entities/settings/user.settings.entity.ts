import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { UserEntity } from '../user.entity';
import { BaseEntity } from '../base.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { FiatEnum, ThemeMode } from '@/config/settings';

@Entity({ name: 'user_settings' })
export class UserSettingEntity extends BaseEntity {
  @ManyToOne(() => UserEntity, (user) => user.settings, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'user_id' })
  @Exclude()
  user: UserEntity;

  @Expose()
  @ApiPropertyOptional({ description: 'Store name' })
  @Column({ name: 'store_name', nullable: true })
  storeName?: string;

  @Expose()
  @ApiPropertyOptional({ description: 'Store logo URL' })
  @Column({ name: 'store_logo_url', nullable: true })
  storeLogoUrl?: string;

  @Expose()
  @ApiPropertyOptional({ description: 'Currency code, e.g. USD, EUR, NGN' })
  @Column({ name: 'currency', default: FiatEnum.NGN })
  currency: string;

  @Expose()
  @ApiPropertyOptional({
    description: 'Tax rate as a decimal, e.g. 5.50 for 5.5%',
  })
  @Column('decimal', {
    name: 'tax_rate',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  taxRate?: number;

  @Expose()
  @ApiPropertyOptional({ description: 'Indicates if tax is inclusive' })
  @Column({ name: 'is_tax_inclusive', default: false })
  isTaxInclusive?: boolean;

  @Expose()
  @ApiPropertyOptional({
    description: 'Payout frequency, e.g. weekly, monthly',
  })
  @Column({ name: 'payout_frequency', nullable: true })
  payoutFrequency?: string;

  @Expose()
  @ApiPropertyOptional({ description: 'Payout day of the week or month' })
  @Column({ name: 'payout_day', nullable: true })
  payoutDay?: string;

  @Expose()
  @ApiProperty({ description: 'Enable card payments' })
  @Column({ name: 'enable_card_payments', default: true })
  enableCardPayments: boolean;

  @Expose()
  @ApiProperty({ description: 'Enable cash payments' })
  @Column({ name: 'enable_cash_payments', default: true })
  enableCashPayments: boolean;

  @Expose()
  @ApiProperty({ description: 'Enable cryptocurrency payments' })
  @Column({ name: 'enable_crypto_payments', default: false })
  enableCryptoPayments: boolean;

  @Expose()
  @ApiProperty({ description: 'Notify on sale' })
  @Column({ name: 'notify_on_sale', default: true })
  notifyOnSale: boolean;

  @Expose()
  @ApiProperty({ description: 'Notify on payout' })
  @Column({ name: 'notify_on_payout', default: true })
  notifyOnPayout: boolean;

  @Expose()
  @ApiPropertyOptional({
    enum: ThemeMode,
    description: 'Theme mode: light or dark',
  })
  @Column({
    type: 'enum',
    enum: ThemeMode,
    name: 'theme_mode',
    nullable: true,
  })
  themeMode?: ThemeMode;

  @Expose()
  @ApiPropertyOptional({ description: 'Language code, e.g. en, fr' })
  @Column({ name: 'language', nullable: true })
  language?: string;
}

@Exclude()
export class IUserSettingDto extends UserSettingEntity {}
