import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { QWalletsEntity } from '../wallets/qwallet/qwallets.entity';
import {
  SupportedBlockchainTypeEnum,
  SupportedWalletTypes,
  WalletProviderEnum,
} from '@/v1/config/settings';
import { CwalletsEntity } from '../wallets/cwallet/cwallet.entity';
import { Exclude, Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity({ name: 'tokens' })
export class TokenEntity extends BaseEntity {
  @Expose()
  @ApiProperty({ type: String, nullable: true })
  @Column({ name: 'name', type: 'varchar', nullable: true })
  name: string | null;

  @Expose()
  @ApiProperty({ type: String, nullable: true })
  @Column({ name: 'issuer', type: 'varchar', nullable: true })
  issuer: string | null;

  @Expose()
  @ApiPropertyOptional({ type: Number, default: 18 })
  @Column({ name: 'decimals', type: 'int', default: 18 })
  decimals?: number;

  @Expose()
  @ApiProperty({ enum: SupportedWalletTypes })
  @Column({
    name: 'wallet_type',
    type: 'enum',
    enum: SupportedWalletTypes,
    nullable: false,
  })
  walletType: SupportedWalletTypes;

  @Expose()
  @ApiProperty({ enum: WalletProviderEnum, example: 'Circle' })
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

  @Expose()
  @ApiProperty({ enum: SupportedBlockchainTypeEnum })
  @Column({
    name: 'network',
    type: 'enum',
    enum: SupportedBlockchainTypeEnum,
    nullable: false,
  })
  network: SupportedBlockchainTypeEnum;

  @Expose()
  @ApiProperty({ type: String, nullable: true })
  @Column({ name: 'symbol', type: 'varchar', nullable: true })
  assetCode: string | null;

  @Expose()
  @ApiProperty({ type: String, default: '0' })
  @Column({ name: 'balance', type: 'varchar', nullable: false, default: '0' })
  balance: string;
}

@Exclude()
export class ITokenDto extends TokenEntity {
  @Exclude() qwallet?: QWalletsEntity;
  @Exclude() cwallet?: CwalletsEntity;
}
