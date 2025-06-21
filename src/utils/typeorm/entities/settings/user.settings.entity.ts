import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { IUserDto, UserEntity } from '../user.entity';
import { BaseEntity } from '../base.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

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

export class IUserSettingDto {
  @ApiProperty({ type: () => IUserDto })
  @Expose()
  @Type(() => IUserDto)
  user: IUserDto;

  @ApiPropertyOptional()
  @Expose()
  storeName?: string;

  @ApiPropertyOptional()
  @Expose()
  storeLogoUrl?: string;

  @ApiPropertyOptional()
  @Expose()
  currency?: string;

  @ApiPropertyOptional({
    type: Number,
    description: 'Tax rate (e.g. 7.50 = 7.5%)',
  })
  @Expose()
  taxRate?: number;

  @ApiProperty({ default: false })
  @Expose()
  isTaxInclusive?: boolean;

  @ApiPropertyOptional()
  @Expose()
  payoutFrequency?: string;

  @ApiPropertyOptional()
  @Expose()
  payoutDay?: string;

  @ApiProperty({ default: true })
  @Expose()
  enableCardPayments: boolean;

  @ApiProperty({ default: true })
  @Expose()
  enableCashPayments: boolean;

  @ApiProperty({ default: false })
  @Expose()
  enableCryptoPayments: boolean;

  @ApiProperty({ default: true })
  @Expose()
  notifyOnSale: boolean;

  @ApiProperty({ default: true })
  @Expose()
  notifyOnPayout: boolean;

  @ApiPropertyOptional()
  @Expose()
  themeColor?: string;

  @ApiPropertyOptional()
  @Expose()
  language?: string;
}
