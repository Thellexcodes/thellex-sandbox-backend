import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseDto, BaseEntity } from '../base.entity';
import { QWalletsEntity } from '../wallets/qwallet/qwallets.entity';
import { SupportedWalletTypes, WalletProviderEnum } from '@/config/settings';
import { CwalletsEntity } from '../wallets/cwallet/cwallet.entity';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'tokens' })
export class TokenEntity extends BaseEntity {
  @Column({ name: 'name', type: 'varchar', nullable: true })
  name: string | null;

  @Column({ name: 'asset_code', type: 'varchar', nullable: true })
  assetCode: string | null;

  @Column({ name: 'issuer', type: 'varchar', nullable: true })
  issuer: string | null;

  @Column({ name: 'decimals', type: 'int', default: 18 })
  decimals: number;

  @Column({ name: 'balance', type: 'varchar', nullable: false, default: '0' })
  balance: string | null;

  @Column({
    name: 'wallet_type',
    type: 'enum',
    enum: SupportedWalletTypes,
    nullable: false,
  })
  walletType: SupportedWalletTypes;

  @Column({
    name: 'wallet_provider',
    type: 'enum',
    enum: WalletProviderEnum,
    nullable: false,
  })
  walletProvider: WalletProviderEnum;

  @ManyToOne(() => CwalletsEntity, (wallet) => wallet.tokens, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'cwallet_id' })
  cwallet?: CwalletsEntity;

  @ManyToOne(() => QWalletsEntity, (wallet) => wallet.tokens, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'qwallet_id' })
  qwallet?: QWalletsEntity;
}

export class ITokenDto extends BaseDto {
  @ApiProperty({ nullable: true })
  @Expose()
  name: string | null;

  @ApiProperty({ nullable: true })
  @Expose()
  contractAddress: string | null;

  @ApiProperty({ nullable: true })
  @Expose()
  assetCode: string | null;

  @ApiProperty({ nullable: true })
  @Expose()
  issuer: string | null;

  @ApiProperty()
  @Expose()
  decimals: number;

  @ApiProperty({ type: [String] })
  @Expose()
  networks: string[];

  @ApiProperty({ nullable: true })
  @Expose()
  balance: string | null;

  @ApiProperty()
  @Expose()
  walletType: string;

  @ApiProperty()
  @Expose()
  walletProvider: string;
}
