import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import {
  IQWalletProfileDto,
  QWalletProfileEntity,
} from './qwallet-profile.entity';
import { BaseEntity } from '../../base.entity';
import { ITokenDto, TokenEntity } from '../../token/token.entity';
import {
  SupportedBlockchainType,
  SupportedWalletTypes,
  WalletProviderEnum,
} from '@/config/settings';
import { Exclude, Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'qwallets' })
export class QWalletsEntity extends BaseEntity {
  @ManyToOne(() => QWalletProfileEntity, (profile) => profile.wallets, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'profile_id' })
  @ApiProperty({ type: () => QWalletProfileEntity })
  profile: QWalletProfileEntity;

  @ApiProperty({ type: 'string', nullable: true })
  @Column({ type: 'varchar', nullable: true })
  reference: string | null;

  @ApiProperty({ type: 'string' })
  @Column({ type: 'varchar' })
  address: string;

  @ApiProperty({ type: 'boolean', nullable: true })
  @Column({ name: 'is_crypto', type: 'boolean', nullable: true })
  isCrypto: boolean | null;

  @ApiProperty({ type: 'string', nullable: true })
  @Column({ name: 'destination_tag', type: 'varchar', nullable: true })
  destinationTag: string | null;

  @ApiProperty({ type: 'string', nullable: true })
  @Column({ name: 'total_payments', type: 'varchar', nullable: true })
  totalPayments: string | null;

  @ApiProperty({ enum: WalletProviderEnum })
  @Column({ type: 'enum', enum: WalletProviderEnum, nullable: false })
  walletProvider: WalletProviderEnum;

  @ApiProperty({ enum: SupportedWalletTypes })
  @Column({
    name: 'wallet_type',
    enum: SupportedWalletTypes,
    nullable: false,
  })
  walletType: SupportedWalletTypes;

  @ApiProperty({
    enum: SupportedBlockchainType,
    default: SupportedBlockchainType.BEP20,
  })
  @Column({
    name: 'default_network',
    type: 'enum',
    enum: SupportedBlockchainType,
    default: SupportedBlockchainType.BEP20,
  })
  defaultNetwork: SupportedBlockchainType;

  @ApiProperty({ type: [String] })
  @Column({
    name: 'networks',
    type: 'simple-array',
  })
  networks: SupportedBlockchainType[];

  @ApiProperty({ type: () => [TokenEntity] })
  @OneToMany(() => TokenEntity, (token) => token.qwallet, { eager: true })
  tokens: TokenEntity[];
}

@Exclude()
export class IQWalletDto extends QWalletsEntity {
  @Expose()
  @ApiProperty({ type: 'string', nullable: true })
  reference: string | null;

  @Expose() address: string;

  @Expose()
  @ApiProperty({ type: 'boolean', nullable: true })
  isCrypto: boolean | null;

  @Expose()
  @ApiProperty({ type: 'string', nullable: true })
  destinationTag: string | null;

  @Expose()
  @ApiProperty({ type: 'string', nullable: true })
  totalPayments: string | null;

  @Expose()
  @ApiProperty({ enum: WalletProviderEnum })
  walletProvider: WalletProviderEnum;

  @Expose()
  @ApiProperty({ enum: SupportedWalletTypes })
  walletType: SupportedWalletTypes;

  @Expose()
  @ApiProperty({
    enum: SupportedBlockchainType,
    default: SupportedBlockchainType.BEP20,
  })
  defaultNetwork: SupportedBlockchainType;

  @Expose()
  @ApiProperty({ type: [String] })
  networks: SupportedBlockchainType[];

  @Expose()
  @Type(() => TokenEntity)
  @ApiProperty({ type: () => [TokenEntity] })
  tokens: TokenEntity[];
}
